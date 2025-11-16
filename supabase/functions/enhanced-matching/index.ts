import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { limit = 10, max_distance_km = 50 } = await req.json();

    console.log(`Finding matches for user ${user.id} with limit ${limit} and max distance ${max_distance_km}km`);

    // Get user's profile and preferences
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Use default preferences if none exist
    const userPreferences = preferences || {
      age_range_min: 18,
      age_range_max: 35,
      max_distance_km: max_distance_km,
      show_me: 'all',
      looking_for: 'relationship'
    };

    // Get users that are blocked by the current user or have blocked the current user
    const { data: blockedUsers } = await supabase
      .from('user_blocks')
      .select('blocked_id, blocker_id')
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    const blockedUserIds = blockedUsers?.map(block => 
      block.blocker_id === user.id ? block.blocked_id : block.blocker_id
    ) || [];

    // Get already liked users
    const { data: likedUsers } = await supabase
      .from('user_likes')
      .select('liked_id')
      .eq('liker_id', user.id);

    const likedUserIds = likedUsers?.map(like => like.liked_id) || [];

    // Get already matched users
    const { data: matchedUsers } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    const matchedUserIds = matchedUsers?.map(match => 
      match.user1_id === user.id ? match.user2_id : match.user1_id
    ) || [];

    const excludedUserIds = [...blockedUserIds, ...likedUserIds, ...matchedUserIds];

    // Build query for potential matches
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .eq('can_access_app', true)
      .gte('age', userPreferences.age_range_min)
      .lte('age', userPreferences.age_range_max);

    // Exclude blocked, liked, and matched users
    if (excludedUserIds.length > 0) {
      query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
    }

    // Add location-based filtering if user has coordinates
    if (userProfile.latitude && userProfile.longitude) {
      // This is a simplified distance filter - in production you'd want proper geographic queries
      const latDelta = userPreferences.max_distance_km / 111; // Rough conversion
      const lngDelta = userPreferences.max_distance_km / (111 * Math.cos(userProfile.latitude * Math.PI / 180));
      
      query = query
        .gte('latitude', userProfile.latitude - latDelta)
        .lte('latitude', userProfile.latitude + latDelta)
        .gte('longitude', userProfile.longitude - lngDelta)
        .lte('longitude', userProfile.longitude + lngDelta);
    }

    const { data: potentialMatches, error: matchError } = await query
      .limit(limit * 3) // Get more to filter and score
      .order('last_active', { ascending: false });

    if (matchError) {
      console.error('Error fetching potential matches:', matchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch matches' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate compatibility scores for each potential match
    const scoredMatches = potentialMatches?.map(match => {
      let score = 0;
      const weights = {
        religious: 30,
        location: 25,
        age: 20,
        lifestyle: 15,
        family: 10
      };

      // Religious compatibility
      if (userProfile.religion_level && match.religion_level) {
        if (userProfile.religion_level === match.religion_level) {
          score += weights.religious;
        } else if (
          (userProfile.religion_level === 'Very Religious' || userProfile.religion_level === 'Religious') &&
          (match.religion_level === 'Very Religious' || match.religion_level === 'Religious')
        ) {
          score += weights.religious * 0.7;
        } else {
          score += weights.religious * 0.3;
        }
      }

      // Prayer frequency bonus
      if (userProfile.prayer_frequency && match.prayer_frequency) {
        if (userProfile.prayer_frequency === match.prayer_frequency) {
          score += 5;
        }
      }

      // Location compatibility
      if (userProfile.location && match.location) {
        if (userProfile.location === match.location) {
          score += weights.location;
        } else if (
          userProfile.location.includes(match.location.split(',')[0]) ||
          match.location.includes(userProfile.location.split(',')[0])
        ) {
          score += weights.location * 0.6;
        }
      }

      // Age compatibility
      if (userProfile.age && match.age) {
        const ageDiff = Math.abs(userProfile.age - match.age);
        if (ageDiff <= 2) {
          score += weights.age;
        } else if (ageDiff <= 5) {
          score += weights.age * 0.8;
        } else if (ageDiff <= 10) {
          score += weights.age * 0.5;
        } else {
          score += weights.age * 0.2;
        }
      }

      // Lifestyle compatibility
      if (userProfile.smoking_status && match.smoking_status) {
        if (userProfile.smoking_status === match.smoking_status) {
          score += weights.lifestyle;
        } else if (userProfile.smoking_status === 'never' && match.smoking_status === 'never') {
          score += weights.lifestyle;
        } else if (
          (userProfile.smoking_status === 'never' && match.smoking_status === 'occasionally') ||
          (match.smoking_status === 'never' && userProfile.smoking_status === 'occasionally')
        ) {
          score += weights.lifestyle * 0.5;
        }
      }

      // Family planning compatibility
      if (userProfile.children_preference && match.children_preference) {
        if (userProfile.children_preference === match.children_preference) {
          score += weights.family;
        } else if (
          (userProfile.children_preference === 'wants_children' && match.children_preference === 'open_to_children') ||
          (match.children_preference === 'wants_children' && userProfile.children_preference === 'open_to_children')
        ) {
          score += weights.family * 0.8;
        }
      }

      // Calculate distance if both users have coordinates
      let distance = null;
      if (userProfile.latitude && userProfile.longitude && match.latitude && match.longitude) {
        const R = 6371; // Earth's radius in km
        const dLat = (match.latitude - userProfile.latitude) * Math.PI / 180;
        const dLon = (match.longitude - userProfile.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userProfile.latitude * Math.PI / 180) * Math.cos(match.latitude * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
      }

      return {
        ...match,
        compatibility_score: Math.min(score, 100),
        distance_km: distance ? Math.round(distance * 10) / 10 : null
      };
    }) || [];

    // Sort by compatibility score and filter by distance
    const filteredMatches = scoredMatches
      .filter(match => !match.distance_km || match.distance_km <= userPreferences.max_distance_km)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    console.log(`Found ${filteredMatches.length} matches for user ${user.id}`);

    return new Response(JSON.stringify({
      matches: filteredMatches,
      total_potential_matches: potentialMatches?.length || 0,
      user_preferences: userPreferences
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-matching function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
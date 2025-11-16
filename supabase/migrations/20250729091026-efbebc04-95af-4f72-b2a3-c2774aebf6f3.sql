-- Fix the security issue and enhance matching with gender filters
CREATE OR REPLACE FUNCTION public.grant_app_access_for_complete_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant access to profiles that have basic info filled out
  UPDATE public.profiles 
  SET can_access_app = true 
  WHERE 
    first_name IS NOT NULL 
    AND age IS NOT NULL 
    AND location IS NOT NULL
    AND can_access_app = false;
END;
$$;

-- Enhanced matching function with gender filtering
CREATE OR REPLACE FUNCTION public.get_enhanced_match_recommendations_with_gender(
  target_user_id uuid, 
  limit_count integer DEFAULT 10
)
RETURNS TABLE(
  user_id uuid, 
  first_name text, 
  last_name text, 
  display_name text, 
  age integer, 
  gender text,
  location text, 
  bio text, 
  avatar_url text, 
  religion_level text, 
  prayer_frequency text, 
  hijab_status text, 
  education_level text, 
  career_field text, 
  marital_status text, 
  smoking_status text, 
  has_children boolean, 
  children_preference text, 
  is_verified boolean, 
  interests text[],
  match_score integer,
  distance_km double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_gender text;
  target_preferences record;
  target_lat double precision;
  target_lon double precision;
BEGIN
  -- Get target user's gender and preferences
  SELECT p.gender, up.* INTO target_gender, target_preferences
  FROM profiles p
  LEFT JOIN user_preferences up ON up.user_id = p.user_id
  WHERE p.user_id = target_user_id;
  
  -- Get target user's location for distance calculation
  SELECT latitude, longitude INTO target_lat, target_lon 
  FROM profiles 
  WHERE user_id = target_user_id;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.display_name,
    p.age,
    p.gender,
    p.location,
    p.bio,
    p.avatar_url,
    p.religion_level,
    p.prayer_frequency,
    p.hijab_status,
    p.education_level,
    p.career_field,
    p.marital_status,
    p.smoking_status,
    p.has_children,
    p.children_preference,
    p.is_verified,
    p.interests,
    calculate_enhanced_match_score(target_user_id, p.user_id) as match_score,
    CASE 
      WHEN target_lat IS NOT NULL AND target_lon IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      THEN calculate_distance(target_lat, target_lon, p.latitude, p.longitude)
      ELSE NULL
    END as distance_km
  FROM profiles p
  WHERE p.user_id != target_user_id
    AND p.can_access_app = true  -- Only show users with app access
    -- Gender filtering (opposite gender for heterosexual matching)
    AND (
      (target_gender = 'male' AND p.gender = 'female') OR
      (target_gender = 'female' AND p.gender = 'male') OR
      target_gender IS NULL OR p.gender IS NULL  -- Allow if gender not specified
    )
    -- Age filtering based on preferences
    AND (
      target_preferences.age_range_min IS NULL OR 
      p.age IS NULL OR 
      p.age >= target_preferences.age_range_min
    )
    AND (
      target_preferences.age_range_max IS NULL OR 
      p.age IS NULL OR 
      p.age <= target_preferences.age_range_max
    )
    -- Exclude users already liked
    AND NOT EXISTS (
      SELECT 1 FROM user_likes ul 
      WHERE ul.liker_id = target_user_id AND ul.liked_id = p.user_id
    )
    -- Exclude users already matched
    AND NOT EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.user1_id = target_user_id AND m.user2_id = p.user_id)
         OR (m.user1_id = p.user_id AND m.user2_id = target_user_id)
    )
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks ub 
      WHERE (ub.blocker_id = target_user_id AND ub.blocked_id = p.user_id)
         OR (ub.blocker_id = p.user_id AND ub.blocked_id = target_user_id)
    )
    -- Only show active profiles
    AND p.last_active > (now() - interval '90 days')
  ORDER BY match_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$;
-- Fix remaining functions that need search_path set

-- Update has_feature_access function
CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name text, user_id_param uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_plan user_plan_type;
  custom_features JSONB;
BEGIN
  SELECT plan_type, features_enabled INTO user_plan, custom_features
  FROM public.user_roles 
  WHERE user_id = user_id_param AND is_active = true;
  
  -- Default to free plan if no role exists
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Check custom feature overrides first
  IF custom_features ? feature_name THEN
    RETURN (custom_features ->> feature_name)::boolean;
  END IF;
  
  -- Define feature access by plan
  CASE feature_name
    WHEN 'video_messaging' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'voice_notes' THEN
      RETURN true; -- Available to all plans
    WHEN 'emojis' THEN
      RETURN true; -- Available to all plans
    WHEN 'unlimited_likes' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'see_who_liked_you' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'advanced_filters' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'read_receipts' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'profile_boost' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'super_likes' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'paid_messages' THEN
      RETURN user_plan IN ('premium', 'elite');
    WHEN 'video_calls' THEN
      RETURN user_plan = 'elite';
    WHEN 'unlimited_paid_messages' THEN
      RETURN user_plan = 'elite';
    WHEN 'profile_verification_priority' THEN
      RETURN user_plan = 'elite';
    WHEN 'advanced_analytics' THEN
      RETURN user_plan = 'elite';
    WHEN 'concierge_matching' THEN
      RETURN user_plan = 'elite';
    WHEN 'custom_filters' THEN
      RETURN user_plan = 'elite';
    WHEN 'profile_insights' THEN
      RETURN user_plan = 'elite';
    ELSE
      RETURN false;
  END CASE;
END;
$function$;

-- Update calculate_enhanced_match_score function (already has search_path but make sure)
CREATE OR REPLACE FUNCTION public.calculate_enhanced_match_score(user1_id uuid, user2_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  score INTEGER := 0;
  user1_profile RECORD;
  user2_profile RECORD;
  weight_religious INTEGER := 30;
  weight_location INTEGER := 20;
  weight_age INTEGER := 15;
  weight_lifestyle INTEGER := 15;
  weight_family INTEGER := 20;
BEGIN
  -- Get both user profiles
  SELECT * INTO user1_profile FROM public.profiles WHERE user_id = user1_id;
  SELECT * INTO user2_profile FROM public.profiles WHERE user_id = user2_id;
  
  -- Return 0 if either profile doesn't exist
  IF user1_profile IS NULL OR user2_profile IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Religious Compatibility (30 points max)
  IF user1_profile.religion_level IS NOT NULL AND user2_profile.religion_level IS NOT NULL THEN
    IF user1_profile.religion_level = user2_profile.religion_level THEN
      score := score + weight_religious;
    ELSIF (user1_profile.religion_level IN ('Very Religious', 'Religious') AND user2_profile.religion_level IN ('Very Religious', 'Religious'))
       OR (user1_profile.religion_level IN ('Somewhat Religious', 'Not Very Religious') AND user2_profile.religion_level IN ('Somewhat Religious', 'Not Very Religious')) THEN
      score := score + (weight_religious * 0.7)::INTEGER;
    ELSE
      score := score + (weight_religious * 0.3)::INTEGER;
    END IF;
  END IF;
  
  -- Prayer frequency bonus
  IF user1_profile.prayer_frequency IS NOT NULL AND user2_profile.prayer_frequency IS NOT NULL THEN
    IF user1_profile.prayer_frequency = user2_profile.prayer_frequency THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- Madhab compatibility bonus
  IF user1_profile.madhab IS NOT NULL AND user2_profile.madhab IS NOT NULL THEN
    IF user1_profile.madhab = user2_profile.madhab THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- Location Compatibility (20 points max)
  IF user1_profile.location IS NOT NULL AND user2_profile.location IS NOT NULL THEN
    IF user1_profile.location = user2_profile.location THEN
      score := score + weight_location;
    ELSIF user1_profile.location ILIKE '%' || split_part(user2_profile.location, ',', 1) || '%' 
       OR user2_profile.location ILIKE '%' || split_part(user1_profile.location, ',', 1) || '%' THEN
      score := score + (weight_location * 0.6)::INTEGER;
    END IF;
  END IF;
  
  -- Age Compatibility (15 points max)
  IF user1_profile.age IS NOT NULL AND user2_profile.age IS NOT NULL THEN
    CASE 
      WHEN ABS(user1_profile.age - user2_profile.age) <= 2 THEN
        score := score + weight_age;
      WHEN ABS(user1_profile.age - user2_profile.age) <= 5 THEN
        score := score + (weight_age * 0.8)::INTEGER;
      WHEN ABS(user1_profile.age - user2_profile.age) <= 10 THEN
        score := score + (weight_age * 0.5)::INTEGER;
      ELSE
        score := score + (weight_age * 0.2)::INTEGER;
    END CASE;
  END IF;
  
  -- Family & Children Compatibility (20 points max)
  -- Previous marriage compatibility
  IF user1_profile.marital_status IS NOT NULL AND user2_profile.marital_status IS NOT NULL THEN
    IF user1_profile.marital_status = user2_profile.marital_status THEN
      score := score + 5;
    ELSIF (user1_profile.marital_status = 'never_married' AND user2_profile.marital_status IN ('divorced', 'widowed'))
       OR (user2_profile.marital_status = 'never_married' AND user1_profile.marital_status IN ('divorced', 'widowed')) THEN
      score := score + 3; -- Slight preference but not incompatible
    END IF;
  END IF;
  
  -- Children compatibility
  IF user1_profile.children_preference IS NOT NULL AND user2_profile.children_preference IS NOT NULL THEN
    IF user1_profile.children_preference = user2_profile.children_preference THEN
      score := score + 8;
    ELSIF (user1_profile.children_preference = 'wants_children' AND user2_profile.children_preference = 'open_to_children')
       OR (user2_profile.children_preference = 'wants_children' AND user1_profile.children_preference = 'open_to_children') THEN
      score := score + 6;
    ELSIF (user1_profile.children_preference = 'doesnt_want_children' AND user2_profile.children_preference = 'already_has_enough')
       OR (user2_profile.children_preference = 'doesnt_want_children' AND user1_profile.children_preference = 'already_has_enough') THEN
      score := score + 4;
    END IF;
  END IF;
  
  -- Existing children consideration
  IF user1_profile.has_children IS NOT NULL AND user2_profile.has_children IS NOT NULL THEN
    IF user1_profile.has_children = user2_profile.has_children THEN
      score := score + 4;
    ELSIF (user1_profile.has_children = false AND user2_profile.children_preference IN ('open_to_children', 'wants_children'))
       OR (user2_profile.has_children = false AND user1_profile.children_preference IN ('open_to_children', 'wants_children')) THEN
      score := score + 2;
    END IF;
  END IF;
  
  -- Marriage timeline compatibility
  IF user1_profile.marriage_timeline IS NOT NULL AND user2_profile.marriage_timeline IS NOT NULL THEN
    IF user1_profile.marriage_timeline = user2_profile.marriage_timeline THEN
      score := score + 3;
    END IF;
  END IF;
  
  -- Lifestyle Compatibility (15 points max)
  -- Smoking compatibility
  IF user1_profile.smoking_status IS NOT NULL AND user2_profile.smoking_status IS NOT NULL THEN
    IF user1_profile.smoking_status = user2_profile.smoking_status THEN
      score := score + 5;
    ELSIF (user1_profile.smoking_status = 'never' AND user2_profile.smoking_status = 'occasionally')
       OR (user2_profile.smoking_status = 'never' AND user1_profile.smoking_status = 'occasionally') THEN
      score := score + 2;
    ELSIF user1_profile.smoking_status = 'never' AND user2_profile.smoking_status IN ('socially', 'regularly') THEN
      score := score - 3; -- Penalty for incompatible smoking preferences
    ELSIF user2_profile.smoking_status = 'never' AND user1_profile.smoking_status IN ('socially', 'regularly') THEN
      score := score - 3;
    END IF;
  END IF;
  
  -- Education level compatibility
  IF user1_profile.education_level IS NOT NULL AND user2_profile.education_level IS NOT NULL THEN
    IF user1_profile.education_level = user2_profile.education_level THEN
      score := score + 5;
    END IF;
  END IF;
  
  -- Career field compatibility
  IF user1_profile.career_field IS NOT NULL AND user2_profile.career_field IS NOT NULL THEN
    IF user1_profile.career_field = user2_profile.career_field THEN
      score := score + 3;
    END IF;
  END IF;
  
  -- Hijab status compatibility (for appropriate gender matching)
  IF user1_profile.hijab_status IS NOT NULL AND user2_profile.hijab_status IS NOT NULL THEN
    -- This would need gender context, simplified for now
    score := score + 2;
  END IF;
  
  -- Ensure score doesn't go below 0 and cap at 100
  RETURN GREATEST(LEAST(score, 100), 0);
END;
$function$;

-- Update get_enhanced_match_recommendations function
CREATE OR REPLACE FUNCTION public.get_enhanced_match_recommendations(target_user_id uuid, limit_count integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, display_name text, age integer, location text, bio text, avatar_url text, religion_level text, prayer_frequency text, hijab_status text, education_level text, career_field text, marital_status text, smoking_status text, has_children boolean, children_preference text, is_verified boolean, match_score integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.display_name,
    p.age,
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
    public.calculate_enhanced_match_score(target_user_id, p.user_id) as match_score
  FROM public.profiles p
  WHERE p.user_id != target_user_id
    -- Exclude users already liked
    AND NOT EXISTS (
      SELECT 1 FROM public.user_likes ul 
      WHERE ul.liker_id = target_user_id AND ul.liked_id = p.user_id
    )
    -- Exclude users already matched
    AND NOT EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE (m.user1_id = target_user_id AND m.user2_id = p.user_id)
         OR (m.user1_id = p.user_id AND m.user2_id = target_user_id)
    )
    -- Only show active profiles
    AND p.last_active > (now() - interval '90 days')
  ORDER BY match_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- Update get_compatibility_insights function
CREATE OR REPLACE FUNCTION public.get_compatibility_insights(user1_id uuid, user2_id uuid)
 RETURNS TABLE(category text, score integer, insight text, compatibility_level text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user1_profile RECORD;
  user2_profile RECORD;
BEGIN
  -- Get both user profiles
  SELECT * INTO user1_profile FROM public.profiles WHERE user_id = user1_id;
  SELECT * INTO user2_profile FROM public.profiles WHERE user_id = user2_id;
  
  -- Return empty if either profile doesn't exist
  IF user1_profile IS NULL OR user2_profile IS NULL THEN
    RETURN;
  END IF;
  
  -- Religious compatibility
  IF user1_profile.religion_level IS NOT NULL AND user2_profile.religion_level IS NOT NULL THEN
    IF user1_profile.religion_level = user2_profile.religion_level THEN
      RETURN QUERY SELECT 'religious'::TEXT, 95::INTEGER, 
        'You both share the same level of religious commitment'::TEXT, 'excellent'::TEXT;
    ELSE
      RETURN QUERY SELECT 'religious'::TEXT, 60::INTEGER, 
        'Different religious commitment levels may require discussion'::TEXT, 'moderate'::TEXT;
    END IF;
  END IF;
  
  -- Family planning compatibility
  IF user1_profile.children_preference IS NOT NULL AND user2_profile.children_preference IS NOT NULL THEN
    IF user1_profile.children_preference = user2_profile.children_preference THEN
      RETURN QUERY SELECT 'family'::TEXT, 90::INTEGER, 
        'You both have aligned goals for children and family planning'::TEXT, 'excellent'::TEXT;
    ELSIF (user1_profile.children_preference = 'wants_children' AND user2_profile.children_preference = 'open_to_children')
       OR (user2_profile.children_preference = 'wants_children' AND user1_profile.children_preference = 'open_to_children') THEN
      RETURN QUERY SELECT 'family'::TEXT, 75::INTEGER, 
        'Good potential for family planning alignment'::TEXT, 'good'::TEXT;
    ELSE
      RETURN QUERY SELECT 'family'::TEXT, 40::INTEGER, 
        'Different views on children may need careful consideration'::TEXT, 'challenging'::TEXT;
    END IF;
  END IF;
  
  -- Lifestyle compatibility
  IF user1_profile.smoking_status IS NOT NULL AND user2_profile.smoking_status IS NOT NULL THEN
    IF user1_profile.smoking_status = user2_profile.smoking_status THEN
      RETURN QUERY SELECT 'lifestyle'::TEXT, 85::INTEGER, 
        'Aligned lifestyle choices regarding smoking'::TEXT, 'excellent'::TEXT;
    ELSIF user1_profile.smoking_status = 'never' AND user2_profile.smoking_status IN ('socially', 'regularly') THEN
      RETURN QUERY SELECT 'lifestyle'::TEXT, 30::INTEGER, 
        'Significant lifestyle difference regarding smoking'::TEXT, 'challenging'::TEXT;
    END IF;
  END IF;
  
  -- Previous marriage compatibility
  IF user1_profile.marital_status IS NOT NULL AND user2_profile.marital_status IS NOT NULL THEN
    IF user1_profile.marital_status = user2_profile.marital_status THEN
      RETURN QUERY SELECT 'experience'::TEXT, 85::INTEGER, 
        'Similar life experiences and relationship backgrounds'::TEXT, 'excellent'::TEXT;
    ELSE
      RETURN QUERY SELECT 'experience'::TEXT, 65::INTEGER, 
        'Different relationship backgrounds can bring diverse perspectives'::TEXT, 'good'::TEXT;
    END IF;
  END IF;
  
  RETURN;
END;
$function$;
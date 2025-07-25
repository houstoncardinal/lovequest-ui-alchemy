-- Add new profile fields for enhanced matching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smoking_status TEXT CHECK (smoking_status IN ('never', 'occasionally', 'socially', 'regularly', 'prefer_not_to_say'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('never_married', 'divorced', 'widowed', 'separated'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_children BOOLEAN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS children_preference TEXT CHECK (children_preference IN ('wants_children', 'doesnt_want_children', 'open_to_children', 'already_has_enough', 'prefer_not_to_say'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS body_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exercise_frequency TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_goals TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_traits TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hobbies_interests TEXT[];

-- Update the enhanced match scoring function to include new criteria
CREATE OR REPLACE FUNCTION public.calculate_enhanced_match_score(user1_id UUID, user2_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Update the get_match_recommendations function to use enhanced scoring
CREATE OR REPLACE FUNCTION public.get_enhanced_match_recommendations(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  age INTEGER,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  religion_level TEXT,
  prayer_frequency TEXT,
  hijab_status TEXT,
  education_level TEXT,
  career_field TEXT,
  marital_status TEXT,
  smoking_status TEXT,
  has_children BOOLEAN,
  children_preference TEXT,
  is_verified BOOLEAN,
  match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Create function for compatibility insights
CREATE OR REPLACE FUNCTION public.get_compatibility_insights(user1_id UUID, user2_id UUID)
RETURNS TABLE (
  category TEXT,
  score INTEGER,
  insight TEXT,
  compatibility_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;
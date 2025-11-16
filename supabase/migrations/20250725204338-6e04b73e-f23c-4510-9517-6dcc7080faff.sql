-- Enable real-time functionality for matches table
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Enable real-time functionality for user_likes table
ALTER TABLE public.user_likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_likes;

-- Create function to calculate match score between two users
CREATE OR REPLACE FUNCTION public.calculate_match_score(user1_id UUID, user2_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  score INTEGER := 0;
  user1_profile RECORD;
  user2_profile RECORD;
BEGIN
  -- Get both user profiles
  SELECT * INTO user1_profile FROM public.profiles WHERE user_id = user1_id;
  SELECT * INTO user2_profile FROM public.profiles WHERE user_id = user2_id;
  
  -- Return 0 if either profile doesn't exist
  IF user1_profile IS NULL OR user2_profile IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Location compatibility (30 points max)
  IF user1_profile.location IS NOT NULL AND user2_profile.location IS NOT NULL THEN
    IF user1_profile.location = user2_profile.location THEN
      score := score + 30;
    ELSIF user1_profile.location ILIKE '%' || split_part(user2_profile.location, ',', 1) || '%' 
       OR user2_profile.location ILIKE '%' || split_part(user1_profile.location, ',', 1) || '%' THEN
      score := score + 15;
    END IF;
  END IF;
  
  -- Age compatibility (25 points max)
  IF user1_profile.age IS NOT NULL AND user2_profile.age IS NOT NULL THEN
    CASE 
      WHEN ABS(user1_profile.age - user2_profile.age) <= 2 THEN
        score := score + 25;
      WHEN ABS(user1_profile.age - user2_profile.age) <= 5 THEN
        score := score + 15;
      WHEN ABS(user1_profile.age - user2_profile.age) <= 10 THEN
        score := score + 10;
      ELSE
        score := score + 5;
    END CASE;
  END IF;
  
  -- Religion level compatibility (25 points max)
  IF user1_profile.religion_level IS NOT NULL AND user2_profile.religion_level IS NOT NULL THEN
    IF user1_profile.religion_level = user2_profile.religion_level THEN
      score := score + 25;
    ELSIF (user1_profile.religion_level IN ('Very Religious', 'Religious') AND user2_profile.religion_level IN ('Very Religious', 'Religious'))
       OR (user1_profile.religion_level IN ('Somewhat Religious', 'Not Very Religious') AND user2_profile.religion_level IN ('Somewhat Religious', 'Not Very Religious')) THEN
      score := score + 15;
    ELSE
      score := score + 5;
    END IF;
  END IF;
  
  -- Prayer frequency compatibility (20 points max)
  IF user1_profile.prayer_frequency IS NOT NULL AND user2_profile.prayer_frequency IS NOT NULL THEN
    IF user1_profile.prayer_frequency = user2_profile.prayer_frequency THEN
      score := score + 20;
    ELSIF (user1_profile.prayer_frequency IN ('5 times daily', 'Daily') AND user2_profile.prayer_frequency IN ('5 times daily', 'Daily'))
       OR (user1_profile.prayer_frequency IN ('Weekly', 'Occasionally', 'Rarely') AND user2_profile.prayer_frequency IN ('Weekly', 'Occasionally', 'Rarely')) THEN
      score := score + 10;
    ELSE
      score := score + 5;
    END IF;
  END IF;
  
  RETURN LEAST(score, 100); -- Cap at 100%
END;
$$;

-- Create function to get match recommendations for a user
CREATE OR REPLACE FUNCTION public.get_match_recommendations(target_user_id UUID, limit_count INTEGER DEFAULT 10)
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
  match_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    public.calculate_match_score(target_user_id, p.user_id) as match_score
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
  ORDER BY match_score DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Create function to get mutual matches for a user
CREATE OR REPLACE FUNCTION public.get_mutual_matches(target_user_id UUID)
RETURNS TABLE (
  match_id UUID,
  matched_user_id UUID,
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
  match_score INTEGER,
  matched_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    CASE 
      WHEN m.user1_id = target_user_id THEN m.user2_id
      ELSE m.user1_id
    END as matched_user_id,
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
    public.calculate_match_score(target_user_id, 
      CASE 
        WHEN m.user1_id = target_user_id THEN m.user2_id
        ELSE m.user1_id
      END
    ) as match_score,
    m.created_at as matched_at
  FROM public.matches m
  JOIN public.profiles p ON p.user_id = CASE 
    WHEN m.user1_id = target_user_id THEN m.user2_id
    ELSE m.user1_id
  END
  WHERE m.user1_id = target_user_id OR m.user2_id = target_user_id
  ORDER BY m.created_at DESC;
END;
$$;
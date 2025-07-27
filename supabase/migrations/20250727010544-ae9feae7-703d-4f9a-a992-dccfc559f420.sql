-- Fix all database functions to include proper search_path for security
-- This prevents SQL injection attacks and ensures functions operate in correct schema

-- Update get_user_plan function
CREATE OR REPLACE FUNCTION public.get_user_plan(user_id_param uuid DEFAULT auth.uid())
 RETURNS user_plan_type
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT plan_type FROM public.user_roles WHERE user_id = user_id_param AND is_active = true),
    'free'::user_plan_type
  );
$function$;

-- Update update_post_likes_count function
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'first_name')
  );
  RETURN NEW;
END;
$function$;

-- Update update_post_comments_count function
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update check_for_match function
CREATE OR REPLACE FUNCTION public.check_for_match()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Check if the liked user has already liked back
  IF EXISTS (
    SELECT 1 FROM public.user_likes 
    WHERE liker_id = NEW.liked_id 
    AND liked_id = NEW.liker_id
  ) THEN
    -- Create a match (ensure consistent ordering)
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.liker_id, NEW.liked_id),
      GREATEST(NEW.liker_id, NEW.liked_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_user_role function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, plan_type)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Update update_user_roles_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id
  );
$function$;

-- Update calculate_distance function
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  SELECT (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
$function$;

-- Update has_feature_access function - already has search_path set

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update get_or_create_conversation function
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id uuid, user2_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  match_record RECORD;
  conversation_id uuid;
BEGIN
  -- Find the match between the two users
  SELECT * INTO match_record 
  FROM public.matches 
  WHERE (user1_id = get_or_create_conversation.user1_id AND user2_id = get_or_create_conversation.user2_id)
     OR (user1_id = get_or_create_conversation.user2_id AND user2_id = get_or_create_conversation.user1_id);
  
  IF match_record.id IS NULL THEN
    RAISE EXCEPTION 'Users are not matched';
  END IF;
  
  -- Check if conversation exists
  SELECT id INTO conversation_id 
  FROM public.match_conversations 
  WHERE match_id = match_record.id;
  
  -- Create conversation if it doesn't exist
  IF conversation_id IS NULL THEN
    INSERT INTO public.match_conversations (match_id)
    VALUES (match_record.id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$function$;

-- Update are_users_matched function
CREATE OR REPLACE FUNCTION public.are_users_matched(user1_id uuid, user2_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = are_users_matched.user1_id AND user2_id = are_users_matched.user2_id)
       OR (user1_id = are_users_matched.user2_id AND user2_id = are_users_matched.user1_id)
  );
$function$;

-- Update is_user_blocked function
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_id uuid, blocked_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE blocker_id = is_user_blocked.blocker_id 
    AND blocked_id = is_user_blocked.blocked_id
  );
$function$;

-- Update calculate_match_score function
CREATE OR REPLACE FUNCTION public.calculate_match_score(user1_id uuid, user2_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Update get_match_recommendations function
CREATE OR REPLACE FUNCTION public.get_match_recommendations(target_user_id uuid, limit_count integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, display_name text, age integer, location text, bio text, avatar_url text, religion_level text, prayer_frequency text, hijab_status text, match_score integer)
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
$function$;

-- Update get_mutual_matches function
CREATE OR REPLACE FUNCTION public.get_mutual_matches(target_user_id uuid)
 RETURNS TABLE(match_id uuid, matched_user_id uuid, first_name text, last_name text, display_name text, age integer, location text, bio text, avatar_url text, religion_level text, prayer_frequency text, hijab_status text, match_score integer, matched_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Update get_location_based_matches function
CREATE OR REPLACE FUNCTION public.get_location_based_matches(target_user_id uuid, max_distance_km integer DEFAULT 50, limit_count integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, first_name text, last_name text, display_name text, age integer, location text, bio text, avatar_url text, religion_level text, prayer_frequency text, hijab_status text, match_score integer, distance_km double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  target_lat DOUBLE PRECISION;
  target_lon DOUBLE PRECISION;
BEGIN
  -- Get target user's location
  SELECT latitude, longitude INTO target_lat, target_lon 
  FROM public.profiles 
  WHERE profiles.user_id = target_user_id;
  
  -- Return empty if target user has no location
  IF target_lat IS NULL OR target_lon IS NULL THEN
    RETURN;
  END IF;
  
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
    public.calculate_enhanced_match_score(target_user_id, p.user_id) as match_score,
    public.calculate_distance(target_lat, target_lon, p.latitude, p.longitude) as distance_km
  FROM public.profiles p
  WHERE p.user_id != target_user_id
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.can_access_app = true -- Only verified users
    AND public.calculate_distance(target_lat, target_lon, p.latitude, p.longitude) <= max_distance_km
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
    AND p.last_active > (now() - interval '90 days')
  ORDER BY distance_km ASC, match_score DESC
  LIMIT limit_count;
END;
$function$;

-- get_enhanced_match_recommendations and get_compatibility_insights already have search_path set

-- Update RLS policies to restrict anonymous access and require authentication

-- Drop and recreate all policies to ensure they require authentication
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
CREATE POLICY "Admins can view admin users" ON public.admin_users
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users admin_users_1
  WHERE admin_users_1.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their match conversations" ON public.match_conversations;
DROP POLICY IF EXISTS "Users can view their match conversations" ON public.match_conversations;
CREATE POLICY "Users can update their match conversations" ON public.match_conversations
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.matches m
  WHERE m.id = match_conversations.match_id 
  AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
));

CREATE POLICY "Users can view their match conversations" ON public.match_conversations
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.matches m
  WHERE m.id = match_conversations.match_id 
  AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
));

DROP POLICY IF EXISTS "Users can view insights involving them" ON public.match_insights;
CREATE POLICY "Users can view insights involving them" ON public.match_insights
FOR SELECT TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
CREATE POLICY "Users can view their own matches" ON public.matches
FOR SELECT TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they sent or received" ON public.messages
FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Photo uploads - keep some public access for approved photos but restrict others
DROP POLICY IF EXISTS "All users can view approved photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can view their own photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can upload their own photos" ON public.photo_uploads;

CREATE POLICY "Authenticated users can view approved photos" ON public.photo_uploads
FOR SELECT TO authenticated
USING (upload_status = 'approved');

CREATE POLICY "Users can manage their own photos" ON public.photo_uploads
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Post-related policies
DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON public.post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;

CREATE POLICY "Comments are viewable by authenticated users" ON public.post_comments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comments" ON public.post_comments
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Post likes are viewable by authenticated users" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;

CREATE POLICY "Post likes are viewable by authenticated users" ON public.post_likes
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their post likes" ON public.post_likes
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Posts are viewable by authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

CREATE POLICY "Posts are viewable by authenticated users" ON public.posts
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their own posts" ON public.posts
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Continue with remaining tables
DROP POLICY IF EXISTS "Users can view their feature usage" ON public.premium_feature_usage;
CREATE POLICY "Users can view their feature usage" ON public.premium_feature_usage
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own subscription" ON public.premium_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.premium_subscriptions;
CREATE POLICY "Users can manage their own subscription" ON public.premium_subscriptions
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Profiles - keep some public read access but restrict to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their push tokens" ON public.push_notification_tokens;
CREATE POLICY "Users can manage their push tokens" ON public.push_notification_tokens
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can remove their blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can view their blocks" ON public.user_blocks;

CREATE POLICY "Users can manage their blocks" ON public.user_blocks
FOR ALL TO authenticated
USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can view their own likes and likes they received" ON public.user_likes;

CREATE POLICY "Users can manage their likes" ON public.user_likes
FOR ALL TO authenticated
USING (auth.uid() = liker_id OR auth.uid() = liked_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;

CREATE POLICY "Admins can manage all reports" ON public.user_reports
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create reports" ON public.user_reports
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.user_reports
FOR SELECT TO authenticated
USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Users can manage their own role" ON public.user_roles
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;

CREATE POLICY "Users can manage their own settings" ON public.user_settings
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can manage their verification requests" ON public.verification_requests;

CREATE POLICY "Admins can manage all verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage their verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their video calls" ON public.video_call_sessions;
CREATE POLICY "Users can manage their video calls" ON public.video_call_sessions
FOR ALL TO authenticated
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);
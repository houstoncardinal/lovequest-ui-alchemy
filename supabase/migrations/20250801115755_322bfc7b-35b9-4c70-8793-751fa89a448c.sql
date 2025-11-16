-- Fix remaining search_path security issues
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, plan_type)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name text, user_id_param uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_plan TEXT;
  custom_features JSONB;
BEGIN
  SELECT plan_type::text, features_enabled INTO user_plan, custom_features
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
$$;
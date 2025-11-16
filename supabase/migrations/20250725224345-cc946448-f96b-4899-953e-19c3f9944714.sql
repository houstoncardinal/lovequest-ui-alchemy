-- Create an enum for user plan types
CREATE TYPE public.user_plan_type AS ENUM ('free', 'premium', 'elite');

-- Create user_roles table to manage plan-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type user_plan_type NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT true,
  features_enabled JSONB DEFAULT '{}',
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own role" ON public.user_roles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a security definer function to check user plan
CREATE OR REPLACE FUNCTION public.get_user_plan(user_id_param UUID DEFAULT auth.uid())
RETURNS user_plan_type
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT plan_type FROM public.user_roles WHERE user_id = user_id_param AND is_active = true),
    'free'::user_plan_type
  );
$$;

-- Create a function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name TEXT, user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
AS $$
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
$$;

-- Create trigger to automatically create user_roles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, plan_type)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_roles_updated_at();
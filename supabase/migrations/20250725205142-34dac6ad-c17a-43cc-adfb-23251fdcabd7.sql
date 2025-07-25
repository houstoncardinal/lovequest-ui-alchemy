-- Create premium subscriptions table
CREATE TABLE public.premium_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'platinum')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription" 
ON public.premium_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscription" 
ON public.premium_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Add premium fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS career_field TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS income_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_size_preference TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS madhab TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS islamic_knowledge_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hajj_umrah_experience BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_involvement_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marriage_timeline TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS financial_readiness TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_marriage BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wants_children BOOLEAN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS number_of_children_wanted INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_level TEXT DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_boost_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wali_contact_info JSONB;

-- Create match insights table
CREATE TABLE public.match_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  compatibility_score INTEGER NOT NULL,
  personality_match_score INTEGER,
  religious_compatibility_score INTEGER,
  lifestyle_compatibility_score INTEGER,
  family_compatibility_score INTEGER,
  insights_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.match_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view insights involving them" 
ON public.match_insights 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('photo', 'education', 'career', 'background')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents JSONB,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their verification requests" 
ON public.verification_requests 
FOR ALL 
USING (auth.uid() = user_id);

-- Create video call sessions table
CREATE TABLE public.video_call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'missed')),
  session_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their video calls" 
ON public.video_call_sessions 
FOR ALL 
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create premium features usage tracking
CREATE TABLE public.premium_feature_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 month')
);

-- Enable RLS
ALTER TABLE public.premium_feature_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their feature usage" 
ON public.premium_feature_usage 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update triggers for timestamp management
CREATE TRIGGER update_premium_subscriptions_updated_at
BEFORE UPDATE ON public.premium_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_insights_updated_at
BEFORE UPDATE ON public.match_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
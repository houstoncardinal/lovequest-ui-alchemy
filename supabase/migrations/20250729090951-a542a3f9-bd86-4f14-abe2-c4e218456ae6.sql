-- Add missing gender field and other essential profile fields for matching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests text[];

-- Create a function to auto-grant app access for development/testing
-- This will allow matching to work while verification system is being built
CREATE OR REPLACE FUNCTION public.grant_app_access_for_complete_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Run the function to enable matching for existing users
SELECT public.grant_app_access_for_complete_profiles();

-- Update some sample data for testing
INSERT INTO public.profiles (
  user_id, 
  first_name, 
  last_name, 
  display_name, 
  age, 
  gender, 
  location, 
  bio, 
  religion_level, 
  prayer_frequency, 
  avatar_url,
  can_access_app,
  is_verified,
  interests
) VALUES 
(
  gen_random_uuid(),
  'Ayesha',
  'Siddiqui', 
  'Ayesha Siddiqui',
  25,
  'female',
  'London, UK',
  'Entrepreneur, passionate about faith, family, and art. Looking for a meaningful halal connection.',
  'Religious',
  'Daily',
  'https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=400&h=600&fit=crop',
  true,
  true,
  ARRAY['entrepreneurship', 'art', 'faith', 'family']
),
(
  gen_random_uuid(),
  'Omar',
  'Farooq',
  'Omar Farooq', 
  28,
  'male',
  'London, UK',
  'Finance professional, enjoys travel and community service. Seeking a partner for a blessed marriage journey.',
  'Very Religious',
  '5 times daily',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  true,
  true,
  ARRAY['finance', 'travel', 'community service', 'faith']
),
(
  gen_random_uuid(),
  'Fatima',
  'Ahmed',
  'Fatima Ahmed',
  24,
  'female', 
  'Manchester, UK',
  'Medical student passionate about helping others. Love reading, cooking, and spending time with family.',
  'Religious',
  'Daily',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
  true,
  true,
  ARRAY['medicine', 'reading', 'cooking', 'family']
) ON CONFLICT (user_id) DO NOTHING;
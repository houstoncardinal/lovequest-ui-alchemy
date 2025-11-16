-- Update verification_requests table to handle ID and face verification
ALTER TABLE public.verification_requests 
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS face_photo_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update profiles table for verification blocking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_access_app BOOLEAN DEFAULT false;

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for verification documents
CREATE POLICY "Users can upload their verification documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all verification documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-documents');

-- Add user location fields for geolocation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

-- Create admin users table for admin dashboard access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'moderator',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can manage admin records
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id
  );
$$;

-- Update verification requests policies for admin access
CREATE POLICY "Admins can manage all verification requests" 
ON public.verification_requests 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Distance calculation function for geolocation matching
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION, lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION)
RETURNS DOUBLE PRECISION
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
$$;

-- Update match recommendations to include distance filtering
CREATE OR REPLACE FUNCTION public.get_location_based_matches(
  target_user_id UUID, 
  max_distance_km INTEGER DEFAULT 50,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
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
  match_score INTEGER,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
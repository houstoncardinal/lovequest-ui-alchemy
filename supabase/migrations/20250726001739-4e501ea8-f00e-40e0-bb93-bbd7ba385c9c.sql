-- Add hashtags and mood fields to posts table
ALTER TABLE public.posts 
ADD COLUMN hashtags TEXT[] DEFAULT '{}',
ADD COLUMN mood TEXT DEFAULT NULL;
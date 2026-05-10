CREATE TABLE public.profile_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT profile_favorites_category_check CHECK (category IN (
    'movies','tv_shows','music_artists','songs','books','podcasts','games','foods','travel_destinations','hobbies','sports_teams'
  ))
);

CREATE INDEX idx_profile_favorites_user_category ON public.profile_favorites(user_id, category);
CREATE INDEX idx_profile_favorites_title ON public.profile_favorites(category, lower(title));

ALTER TABLE public.profile_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favorites are viewable by everyone"
  ON public.profile_favorites FOR SELECT USING (true);

CREATE POLICY "Users can add their own favorites"
  ON public.profile_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.profile_favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.profile_favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any favorite"
  ON public.profile_favorites FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
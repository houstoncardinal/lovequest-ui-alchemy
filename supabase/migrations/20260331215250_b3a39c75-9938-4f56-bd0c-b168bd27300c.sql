
-- Drop existing triggers safely then recreate
DROP TRIGGER IF EXISTS on_like_check_mutual ON public.likes;
DROP TRIGGER IF EXISTS on_like_notify ON public.likes;
DROP TRIGGER IF EXISTS on_match_notify ON public.matches;
DROP TRIGGER IF EXISTS on_message_notify ON public.messages;
DROP TRIGGER IF EXISTS on_post_like_count ON public.post_likes;
DROP TRIGGER IF EXISTS on_post_comment_count ON public.post_comments;
DROP TRIGGER IF EXISTS on_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS on_posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS on_reports_updated_at ON public.reports;

CREATE TRIGGER on_like_check_mutual
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.check_mutual_like();

CREATE TRIGGER on_like_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

CREATE TRIGGER on_match_notify
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_match();

CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

CREATE TRIGGER on_post_like_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER on_post_comment_count
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER on_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: Users can see likes they received
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view likes they received' AND tablename = 'likes') THEN
    CREATE POLICY "Users can view likes they received"
      ON public.likes FOR SELECT TO authenticated
      USING (auth.uid() = liked_id);
  END IF;
END $$;

-- Admin SELECT policies (skip if already exists from partial first migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all likes' AND tablename = 'likes') THEN
    CREATE POLICY "Admins can view all likes" ON public.likes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all matches' AND tablename = 'matches') THEN
    CREATE POLICY "Admins can view all matches" ON public.matches FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all messages' AND tablename = 'messages') THEN
    CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all blocks' AND tablename = 'blocks') THEN
    CREATE POLICY "Admins can view all blocks" ON public.blocks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all user roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Admin moderation actions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete any post' AND tablename = 'posts') THEN
    CREATE POLICY "Admins can delete any post" ON public.posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete any message' AND tablename = 'messages') THEN
    CREATE POLICY "Admins can delete any message" ON public.messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any match' AND tablename = 'matches') THEN
    CREATE POLICY "Admins can update any match" ON public.matches FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete any match' AND tablename = 'matches') THEN
    CREATE POLICY "Admins can delete any match" ON public.matches FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete any block' AND tablename = 'blocks') THEN
    CREATE POLICY "Admins can delete any block" ON public.blocks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage user roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update user roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete user roles' AND tablename = 'user_roles') THEN
    CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Fix notifications INSERT for triggers
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

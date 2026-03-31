
-- ═══════════════════════════════════════════════════════
-- 1. BLOCKS TABLE — enforce blocking in feed & messaging
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create blocks"
  ON public.blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks"
  ON public.blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can remove blocks"
  ON public.blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

-- ═══════════════════════════════════════════════════════
-- 2. NOTIFICATIONS TABLE
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  related_user_id UUID,
  related_match_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════
-- 3. NOTIFICATION TRIGGERS
-- ═══════════════════════════════════════════════════════

-- Notify when someone likes you
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.like_type IN ('like', 'superlike') THEN
    INSERT INTO public.notifications (user_id, type, title, body, related_user_id)
    VALUES (
      NEW.liked_id,
      CASE WHEN NEW.like_type = 'superlike' THEN 'superlike' ELSE 'like' END,
      CASE WHEN NEW.like_type = 'superlike' THEN 'Someone Super Liked you! ⭐' ELSE 'Someone liked you! 💖' END,
      'Check your likes to see who it is',
      NEW.liker_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_like_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Notify when a match is created
CREATE OR REPLACE FUNCTION public.notify_on_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, related_user_id, related_match_id)
  VALUES
    (NEW.user1_id, 'match', 'New Match! 🎉', 'You have a new match! Start a conversation.', NEW.user2_id, NEW.id),
    (NEW.user2_id, 'match', 'New Match! 🎉', 'You have a new match! Start a conversation.', NEW.user1_id, NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_match_notify
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_match();

-- Notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  other_user_id UUID;
BEGIN
  SELECT CASE
    WHEN m.user1_id = NEW.sender_id THEN m.user2_id
    ELSE m.user1_id
  END INTO other_user_id
  FROM public.matches m
  WHERE m.id = NEW.match_id;

  IF other_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, related_user_id, related_match_id)
    VALUES (
      other_user_id, 'message', 'New message 💬',
      CASE WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 100) ELSE 'Sent you a media message' END,
      NEW.sender_id, NEW.match_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ═══════════════════════════════════════════════════════
-- 4. ADD unique constraint on matches for mutual-like check
-- ═══════════════════════════════════════════════════════
ALTER TABLE public.matches ADD CONSTRAINT matches_user_pair_unique UNIQUE (user1_id, user2_id);

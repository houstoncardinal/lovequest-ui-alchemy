-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'image', 'voice', 'video'
  attachment_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match conversations table
CREATE TABLE public.match_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user reports table for content moderation
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  reported_message_id UUID,
  reported_post_id UUID,
  report_type TEXT NOT NULL, -- 'harassment', 'spam', 'inappropriate_content', 'fake_profile', 'other'
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user blocks table
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create photo uploads table for profile photos
CREATE TABLE public.photo_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  upload_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  new_matches BOOLEAN DEFAULT true,
  new_messages BOOLEAN DEFAULT true,
  profile_views BOOLEAN DEFAULT true,
  super_likes BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create push notification tokens table
CREATE TABLE public.push_notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'web', 'ios', 'android'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent or received" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for match conversations
CREATE POLICY "Users can view their match conversations" ON public.match_conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their match conversations" ON public.match_conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- RLS Policies for user reports
CREATE POLICY "Users can view their own reports" ON public.user_reports
FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.user_reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" ON public.user_reports
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user blocks
CREATE POLICY "Users can view their blocks" ON public.user_blocks
FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks" ON public.user_blocks
FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can remove their blocks" ON public.user_blocks
FOR DELETE USING (auth.uid() = blocker_id);

-- RLS Policies for photo uploads
CREATE POLICY "Users can view their own photos" ON public.photo_uploads
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "All users can view approved photos" ON public.photo_uploads
FOR SELECT USING (upload_status = 'approved');

CREATE POLICY "Users can upload their own photos" ON public.photo_uploads
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON public.photo_uploads
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON public.photo_uploads
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for push notification tokens
CREATE POLICY "Users can manage their push tokens" ON public.push_notification_tokens
FOR ALL USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', false);

-- Storage policies for profile photos
CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for message attachments
CREATE POLICY "Users can view message attachments they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-attachments'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR auth.uid()::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Users can upload message attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_conversations_updated_at
  BEFORE UPDATE ON public.match_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reports_updated_at
  BEFORE UPDATE ON public.user_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_photo_uploads_updated_at
  BEFORE UPDATE ON public.photo_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

ALTER TABLE public.match_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_conversations;

-- Create indexes for performance
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id) WHERE is_deleted = false;
CREATE INDEX idx_match_conversations_match_id ON public.match_conversations(match_id);
CREATE INDEX idx_user_blocks_blocker_blocked ON public.user_blocks(blocker_id, blocked_id);
CREATE INDEX idx_photo_uploads_user_id ON public.photo_uploads(user_id, is_primary DESC);
CREATE INDEX idx_user_reports_status ON public.user_reports(status, created_at DESC);

-- Function to check if users are matched
CREATE OR REPLACE FUNCTION public.are_users_matched(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = are_users_matched.user1_id AND user2_id = are_users_matched.user2_id)
       OR (user1_id = are_users_matched.user2_id AND user2_id = are_users_matched.user1_id)
  );
$$;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(blocker_id uuid, blocked_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE blocker_id = is_user_blocked.blocker_id 
    AND blocked_id = is_user_blocked.blocked_id
  );
$$;

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id uuid, user2_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
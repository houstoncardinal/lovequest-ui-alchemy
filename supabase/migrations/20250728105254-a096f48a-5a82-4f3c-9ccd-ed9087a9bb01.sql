-- Update RLS policies to restrict anonymous access and require authentication

-- Drop and recreate all policies to ensure they require authentication
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
CREATE POLICY "Admins can view admin users" ON public.admin_users
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users admin_users_1
  WHERE admin_users_1.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their match conversations" ON public.match_conversations;
DROP POLICY IF EXISTS "Users can view their match conversations" ON public.match_conversations;
CREATE POLICY "Users can update their match conversations" ON public.match_conversations
FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.matches m
  WHERE m.id = match_conversations.match_id 
  AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
));

CREATE POLICY "Users can view their match conversations" ON public.match_conversations
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.matches m
  WHERE m.id = match_conversations.match_id 
  AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
));

DROP POLICY IF EXISTS "Users can view insights involving them" ON public.match_insights;
CREATE POLICY "Users can view insights involving them" ON public.match_insights
FOR SELECT TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
CREATE POLICY "Users can view their own matches" ON public.matches
FOR SELECT TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they sent or received" ON public.messages
FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Photo uploads - keep some public access for approved photos but restrict others
DROP POLICY IF EXISTS "All users can view approved photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can delete their own photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can update their own photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can view their own photos" ON public.photo_uploads;
DROP POLICY IF EXISTS "Users can upload their own photos" ON public.photo_uploads;

CREATE POLICY "Authenticated users can view approved photos" ON public.photo_uploads
FOR SELECT TO authenticated
USING (upload_status = 'approved');

CREATE POLICY "Users can manage their own photos" ON public.photo_uploads
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Post-related policies
DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON public.post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;

CREATE POLICY "Comments are viewable by authenticated users" ON public.post_comments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comments" ON public.post_comments
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Post likes are viewable by authenticated users" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can remove their own likes" ON public.post_likes;

CREATE POLICY "Post likes are viewable by authenticated users" ON public.post_likes
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their post likes" ON public.post_likes
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Posts are viewable by authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

CREATE POLICY "Posts are viewable by authenticated users" ON public.posts
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can manage their own posts" ON public.posts
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Continue with remaining tables
DROP POLICY IF EXISTS "Users can view their feature usage" ON public.premium_feature_usage;
CREATE POLICY "Users can view their feature usage" ON public.premium_feature_usage
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own subscription" ON public.premium_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.premium_subscriptions;
CREATE POLICY "Users can manage their own subscription" ON public.premium_subscriptions
FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Profiles - keep some public read access but restrict to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their push tokens" ON public.push_notification_tokens;
CREATE POLICY "Users can manage their push tokens" ON public.push_notification_tokens
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can remove their blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can view their blocks" ON public.user_blocks;

CREATE POLICY "Users can manage their blocks" ON public.user_blocks
FOR ALL TO authenticated
USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can view their own likes and likes they received" ON public.user_likes;

CREATE POLICY "Users can manage their likes" ON public.user_likes
FOR ALL TO authenticated
USING (auth.uid() = liker_id OR auth.uid() = liked_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.user_reports;

CREATE POLICY "Admins can manage all reports" ON public.user_reports
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create reports" ON public.user_reports
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.user_reports
FOR SELECT TO authenticated
USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Users can manage their own role" ON public.user_roles
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;

CREATE POLICY "Users can manage their own settings" ON public.user_settings
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can manage their verification requests" ON public.verification_requests;

CREATE POLICY "Admins can manage all verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can manage their verification requests" ON public.verification_requests
FOR ALL TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their video calls" ON public.video_call_sessions;
CREATE POLICY "Users can manage their video calls" ON public.video_call_sessions
FOR ALL TO authenticated
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);
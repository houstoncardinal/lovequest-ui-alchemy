-- Create function to safely delete user account and all related data
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_exists boolean;
BEGIN
    -- Check if user exists and is the current authenticated user
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE id = target_user_id
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'User does not exist';
    END IF;
    
    -- Only allow users to delete their own account
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Can only delete your own account';
    END IF;
    
    -- Delete user data in correct order to avoid foreign key conflicts
    
    -- Delete user reports
    DELETE FROM public.user_reports WHERE reporter_id = target_user_id OR reported_user_id = target_user_id;
    
    -- Delete verification requests
    DELETE FROM public.verification_requests WHERE user_id = target_user_id;
    
    -- Delete photo uploads
    DELETE FROM public.photo_uploads WHERE user_id = target_user_id;
    
    -- Delete video call sessions
    DELETE FROM public.video_call_sessions WHERE caller_id = target_user_id OR receiver_id = target_user_id;
    
    -- Delete messages
    DELETE FROM public.messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
    
    -- Delete match conversations (via matches deletion cascade)
    -- Delete matches
    DELETE FROM public.matches WHERE user1_id = target_user_id OR user2_id = target_user_id;
    
    -- Delete match insights
    DELETE FROM public.match_insights WHERE user1_id = target_user_id OR user2_id = target_user_id;
    
    -- Delete user likes
    DELETE FROM public.user_likes WHERE liker_id = target_user_id OR liked_id = target_user_id;
    
    -- Delete user blocks
    DELETE FROM public.user_blocks WHERE blocker_id = target_user_id OR blocked_id = target_user_id;
    
    -- Delete posts and related data
    DELETE FROM public.post_comments WHERE user_id = target_user_id;
    DELETE FROM public.post_likes WHERE user_id = target_user_id;
    DELETE FROM public.posts WHERE user_id = target_user_id;
    
    -- Delete user preferences
    DELETE FROM public.user_preferences WHERE user_id = target_user_id;
    
    -- Delete user settings
    DELETE FROM public.user_settings WHERE user_id = target_user_id;
    
    -- Delete notification preferences
    DELETE FROM public.notification_preferences WHERE user_id = target_user_id;
    
    -- Delete push notification tokens
    DELETE FROM public.push_notification_tokens WHERE user_id = target_user_id;
    
    -- Delete premium data
    DELETE FROM public.premium_feature_usage WHERE user_id = target_user_id;
    DELETE FROM public.premium_subscriptions WHERE user_id = target_user_id;
    
    -- Delete user roles
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Finally delete profile (this should cascade delete auth.users)
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    
    -- Delete from auth.users (requires admin privileges or cascade from profiles)
    -- This will be handled by the auth system when profile is deleted
END;
$$;

-- Grant execute permission to authenticated users for their own account
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;
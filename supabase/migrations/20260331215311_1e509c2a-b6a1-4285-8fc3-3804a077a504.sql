
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users or system can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

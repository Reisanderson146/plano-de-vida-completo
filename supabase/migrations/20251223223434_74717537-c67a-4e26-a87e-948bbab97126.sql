-- Drop existing policies on email_logs to recreate them properly
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;

-- Ensure RLS is enabled
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view email logs
CREATE POLICY "Admins can view all email logs" 
ON public.email_logs 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Policy: Users can view their own email logs (by user_id)
CREATE POLICY "Users can view their own email logs" 
ON public.email_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Only service role can insert (edge functions use service role key)
-- This policy uses TRUE but only applies to service_role, not anon or authenticated
CREATE POLICY "Service role can insert email logs" 
ON public.email_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Explicitly deny all other operations for non-admins
CREATE POLICY "Admins can update email logs" 
ON public.email_logs 
FOR UPDATE 
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can delete email logs" 
ON public.email_logs 
FOR DELETE 
TO authenticated
USING (is_admin());
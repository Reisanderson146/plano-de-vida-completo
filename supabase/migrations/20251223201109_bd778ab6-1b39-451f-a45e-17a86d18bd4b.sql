-- Create table for email logs
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  resend_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view email logs
CREATE POLICY "Admins can view all email logs"
  ON public.email_logs
  FOR SELECT
  USING (public.is_admin());

-- Service role can insert logs (edge functions)
CREATE POLICY "Service role can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.email_logs IS 'Logs of all emails sent from the system';
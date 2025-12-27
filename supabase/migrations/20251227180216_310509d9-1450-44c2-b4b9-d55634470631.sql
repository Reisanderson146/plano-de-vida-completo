-- Add columns for subscription tracking with trial info
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone;
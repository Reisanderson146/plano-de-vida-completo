-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_plan TEXT DEFAULT NULL;
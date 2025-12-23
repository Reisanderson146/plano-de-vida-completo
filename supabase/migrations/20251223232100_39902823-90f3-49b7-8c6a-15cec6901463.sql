-- Add preferred AI style column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_ai_style TEXT DEFAULT 'balanced';
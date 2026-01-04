-- Add birth_date column to profiles table for birthday emails
ALTER TABLE public.profiles ADD COLUMN birth_date DATE;

-- Create index for efficient birthday lookups
CREATE INDEX idx_profiles_birth_date ON public.profiles(birth_date);
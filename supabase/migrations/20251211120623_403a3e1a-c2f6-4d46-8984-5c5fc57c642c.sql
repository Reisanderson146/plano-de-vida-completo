-- Add theme column to profiles table to store user-specific theme preference
ALTER TABLE public.profiles ADD COLUMN theme_id text DEFAULT 'default';

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.theme_id IS 'User-specific theme preference for the application';
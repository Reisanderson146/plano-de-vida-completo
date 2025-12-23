-- Remove RLS policies from user_streaks table
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Streaks cannot be deleted" ON public.user_streaks;

-- Remove RLS policies from user_achievements table
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Achievements cannot be updated" ON public.user_achievements;
DROP POLICY IF EXISTS "Achievements cannot be deleted" ON public.user_achievements;

-- Drop tables
DROP TABLE IF EXISTS public.user_streaks;
DROP TABLE IF EXISTS public.user_achievements;
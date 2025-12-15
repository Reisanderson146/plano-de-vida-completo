-- Política DELETE para profiles (impedir deleção de perfis)
CREATE POLICY "Users cannot delete their own profile"
ON public.profiles FOR DELETE
USING (false);

-- Política UPDATE para user_achievements (conquistas são imutáveis)
CREATE POLICY "Achievements cannot be updated"
ON public.user_achievements FOR UPDATE
USING (false);

-- Política DELETE para user_achievements (manter histórico)
CREATE POLICY "Achievements cannot be deleted"
ON public.user_achievements FOR DELETE
USING (false);

-- Política DELETE para user_streaks (manter histórico)
CREATE POLICY "Streaks cannot be deleted"
ON public.user_streaks FOR DELETE
USING (false);
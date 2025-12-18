import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { applyTheme } from '@/lib/themes';

export function useUserTheme() {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user's theme preference from database when they log in
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user?.id || !mounted) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_id')
          .eq('id', user.id)
          .single();

        if (profile?.theme_id && profile.theme_id !== 'default') {
          // theme_id can be 'light', 'dark', or 'system'
          setTheme(profile.theme_id);
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, [user?.id, mounted, setTheme]);

  // Reapply color theme when dark/light mode changes
  useEffect(() => {
    if (mounted) {
      setTimeout(() => applyTheme(), 50);
    }
  }, [resolvedTheme, mounted]);

  // Save theme preference to database
  const saveTheme = useCallback(async (newTheme: string) => {
    // Add transitioning class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    
    setTheme(newTheme);
    
    // Remove class after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);

    // Save to database if user is logged in
    if (user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_id: newTheme })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving user theme:', error);
      }
    }
  }, [user?.id, setTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme: saveTheme,
    mounted,
    isLoading,
  };
}

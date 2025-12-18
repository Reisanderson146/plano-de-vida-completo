import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { applyTheme } from '@/lib/themes';

// Key for anonymous users (not logged in)
const ANONYMOUS_THEME_KEY = 'planodevida-theme-anonymous';

export function useUserTheme() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current user ID and load their theme
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!mounted) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id || null;
        setUserId(currentUserId);

        if (currentUserId) {
          // Logged in user - load from database
          const { data: profile } = await supabase
            .from('profiles')
            .select('theme_id')
            .eq('id', currentUserId)
            .single();

          if (profile?.theme_id && profile.theme_id !== 'default') {
            setNextTheme(profile.theme_id);
          }
        } else {
          // Anonymous user - load from localStorage
          const savedTheme = localStorage.getItem(ANONYMOUS_THEME_KEY);
          if (savedTheme) {
            setNextTheme(savedTheme);
          }
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTheme();

    // Listen for auth changes to reload theme when user logs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);

      if (newUserId && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // User just logged in - load their theme from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_id')
          .eq('id', newUserId)
          .single();

        if (profile?.theme_id && profile.theme_id !== 'default') {
          setNextTheme(profile.theme_id);
        }
      } else if (event === 'SIGNED_OUT') {
        // User logged out - load anonymous theme
        const savedTheme = localStorage.getItem(ANONYMOUS_THEME_KEY);
        if (savedTheme) {
          setNextTheme(savedTheme);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [mounted, setNextTheme]);

  // Reapply color theme when dark/light mode changes
  useEffect(() => {
    if (mounted) {
      setTimeout(() => applyTheme(), 50);
    }
  }, [resolvedTheme, mounted]);

  // Save theme preference
  const saveTheme = useCallback(async (newTheme: string) => {
    // Add transitioning class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    
    setNextTheme(newTheme);
    
    // Remove class after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);

    if (userId) {
      // Logged in user - save to database
      try {
        await supabase
          .from('profiles')
          .update({ theme_id: newTheme })
          .eq('id', userId);
      } catch (error) {
        console.error('Error saving user theme:', error);
      }
    } else {
      // Anonymous user - save to localStorage
      localStorage.setItem(ANONYMOUS_THEME_KEY, newTheme);
    }
  }, [userId, setNextTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme: saveTheme,
    mounted,
    isLoading,
  };
}

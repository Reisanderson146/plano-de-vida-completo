import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useFavoriteQuotes() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const favoritesRef = useRef<number[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_quotes')
        .select('quote_index')
        .eq('user_id', user.id);

      if (error) throw error;
      const loadedFavorites = data?.map(f => f.quote_index) || [];
      setFavorites(loadedFavorites);
      favoritesRef.current = loadedFavorites;
    } catch (error) {
      console.error('Error loading favorite quotes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (quoteIndex: number): Promise<boolean> => {
    if (!user) return false;

    // Use ref to get current value and avoid stale closure
    const currentFavorites = favoritesRef.current;
    const isCurrentlyFavorite = currentFavorites.includes(quoteIndex);

    // Optimistic update
    if (isCurrentlyFavorite) {
      const newFavorites = currentFavorites.filter(i => i !== quoteIndex);
      setFavorites(newFavorites);
      favoritesRef.current = newFavorites;
    } else {
      const newFavorites = [...currentFavorites, quoteIndex];
      setFavorites(newFavorites);
      favoritesRef.current = newFavorites;
    }

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from('favorite_quotes')
          .delete()
          .eq('user_id', user.id)
          .eq('quote_index', quoteIndex);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorite_quotes')
          .insert({ user_id: user.id, quote_index: quoteIndex });

        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      if (isCurrentlyFavorite) {
        const revertedFavorites = [...favoritesRef.current, quoteIndex];
        setFavorites(revertedFavorites);
        favoritesRef.current = revertedFavorites;
      } else {
        const revertedFavorites = favoritesRef.current.filter(i => i !== quoteIndex);
        setFavorites(revertedFavorites);
        favoritesRef.current = revertedFavorites;
      }
      return false;
    }
  }, [user]);

  const isFavorite = useCallback((quoteIndex: number) => {
    return favorites.includes(quoteIndex);
  }, [favorites]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites
  };
}

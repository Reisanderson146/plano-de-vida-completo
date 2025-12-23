import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useFavoriteQuotes() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      setFavorites(data?.map(f => f.quote_index) || []);
    } catch (error) {
      console.error('Error loading favorite quotes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (quoteIndex: number): Promise<boolean> => {
    if (!user) return false;

    const isCurrentlyFavorite = favorites.includes(quoteIndex);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_quotes')
          .delete()
          .eq('user_id', user.id)
          .eq('quote_index', quoteIndex);

        if (error) throw error;
        setFavorites(prev => prev.filter(i => i !== quoteIndex));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_quotes')
          .insert({ user_id: user.id, quote_index: quoteIndex });

        if (error) throw error;
        setFavorites(prev => [...prev, quoteIndex]);
      }
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (quoteIndex: number) => {
    return favorites.includes(quoteIndex);
  };

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    refresh: loadFavorites
  };
}

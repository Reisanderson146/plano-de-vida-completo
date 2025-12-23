import { Heart, Quote } from 'lucide-react';
import { getDailyQuote, MOTIVATIONAL_QUOTES } from '@/lib/motivational-quotes';
import { useMemo, useState } from 'react';
import { useFavoriteQuotes } from '@/hooks/useFavoriteQuotes';
import { FavoriteQuotesDialog } from './FavoriteQuotesDialog';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function MotivationalQuote() {
  const { user } = useAuth();
  const quote = useMemo(() => getDailyQuote(), []);
  const { isFavorite, toggleFavorite } = useFavoriteQuotes();
  const [isAnimating, setIsAnimating] = useState(false);

  // Get the current quote index
  const quoteIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return dayOfYear % MOTIVATIONAL_QUOTES.length;
  }, []);

  const isCurrentFavorite = isFavorite(quoteIndex);

  const handleToggleFavorite = async () => {
    if (!user) return;
    setIsAnimating(true);
    await toggleFavorite(quoteIndex);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 overflow-hidden animate-fade-in">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
      
      <div className="relative flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Quote className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-foreground/90 text-sm sm:text-base leading-relaxed italic font-medium">
            "{quote.text}"
          </p>
          {quote.author && (
            <p className="text-muted-foreground text-xs sm:text-sm mt-2 font-medium">
              — {quote.author}
            </p>
          )}
        </div>

        {user && (
          <div className="flex flex-col items-end gap-2">
            <motion.button
              onClick={handleToggleFavorite}
              className={cn(
                "p-2 rounded-full transition-colors",
                isCurrentFavorite 
                  ? "text-red-500 hover:bg-red-500/10" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              )}
              title={isCurrentFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isCurrentFavorite ? 'filled' : 'empty'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: isAnimating ? [1, 1.3, 1] : 1, 
                    opacity: 1 
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ 
                    duration: 0.3,
                    scale: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <Heart className={cn("w-5 h-5", isCurrentFavorite && "fill-current")} />
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <FavoriteQuotesDialog />
          </div>
        )}
      </div>
    </div>
  );
}

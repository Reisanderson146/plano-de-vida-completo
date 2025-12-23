import { Quote } from 'lucide-react';
import { getDailyQuote } from '@/lib/motivational-quotes';
import { useMemo } from 'react';

export function MotivationalQuote() {
  const quote = useMemo(() => getDailyQuote(), []);

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
      </div>
    </div>
  );
}

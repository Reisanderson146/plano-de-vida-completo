import { Heart, Quote, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOTIVATIONAL_QUOTES } from '@/lib/motivational-quotes';
import { useFavoriteQuotes } from '@/hooks/useFavoriteQuotes';

interface FavoriteQuotesDialogProps {
  trigger?: React.ReactNode;
}

export function FavoriteQuotesDialog({ trigger }: FavoriteQuotesDialogProps) {
  const { favorites, toggleFavorite } = useFavoriteQuotes();

  const favoriteQuotes = favorites
    .filter(index => index >= 0 && index < MOTIVATIONAL_QUOTES.length)
    .map(index => ({
      index,
      ...MOTIVATIONAL_QUOTES[index]
    }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="w-4 h-4" />
            Favoritas ({favorites.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            Frases Favoritas
          </DialogTitle>
        </DialogHeader>

        {favoriteQuotes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Quote className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma frase favorita ainda.</p>
            <p className="text-sm mt-1">Clique no coração ao lado de uma frase para salvá-la.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {favoriteQuotes.map((quote) => (
                <div 
                  key={quote.index}
                  className="relative p-4 rounded-xl bg-muted/50 border border-border/50 group"
                >
                  <button
                    onClick={() => toggleFavorite(quote.index)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                    title="Remover dos favoritos"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                  <p className="text-foreground/90 text-sm leading-relaxed italic pr-8">
                    "{quote.text}"
                  </p>
                  {quote.author && (
                    <p className="text-muted-foreground text-xs mt-2 font-medium">
                      — {quote.author}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

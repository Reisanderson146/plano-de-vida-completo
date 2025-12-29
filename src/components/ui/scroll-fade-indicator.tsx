import { cn } from '@/lib/utils';

interface ScrollFadeIndicatorProps {
  className?: string;
  position?: 'right' | 'left' | 'both';
  visible?: boolean;
}

export function ScrollFadeIndicator({ 
  className, 
  position = 'right',
  visible = true 
}: ScrollFadeIndicatorProps) {
  if (!visible) return null;

  return (
    <>
      {(position === 'left' || position === 'both') && (
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10",
            "bg-gradient-to-r from-background to-transparent",
            className
          )}
        />
      )}
      {(position === 'right' || position === 'both') && (
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10",
            "bg-gradient-to-l from-background to-transparent",
            className
          )}
        />
      )}
    </>
  );
}

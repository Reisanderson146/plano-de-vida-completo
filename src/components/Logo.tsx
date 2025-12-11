import { cn } from '@/lib/utils';
import logoJourney from '@/assets/logo-journey.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={logoJourney} 
        alt="Plano de Vida" 
        className={cn(sizeClasses[size], "object-contain")}
      />
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(
            "font-bold text-white tracking-tight drop-shadow-sm",
            textSizeClasses[size]
          )}>
            Plano de
          </span>
          <span className={cn(
            "font-bold text-green-500 tracking-tight -mt-1",
            textSizeClasses[size]
          )}>
            Vida
          </span>
        </div>
      )}
    </div>
  );
}

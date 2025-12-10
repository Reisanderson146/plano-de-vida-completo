import { cn } from '@/lib/utils';

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
      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-lg",
        sizeClasses[size]
      )}>
        {/* Tree/Life icon */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="w-[70%] h-[70%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tree trunk */}
          <path
            d="M20 38V22"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Tree branches forming upward arrows/paths */}
          <path
            d="M20 22L12 30"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 22L28 30"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Tree crown - stylized leaves forming a growth pattern */}
          <circle
            cx="20"
            cy="14"
            r="10"
            fill="white"
            fillOpacity="0.9"
          />
          <circle
            cx="13"
            cy="17"
            r="6"
            fill="white"
            fillOpacity="0.9"
          />
          <circle
            cx="27"
            cy="17"
            r="6"
            fill="white"
            fillOpacity="0.9"
          />
          {/* Center arrow pointing up - represents planning/direction */}
          <path
            d="M20 6L16 12H24L20 6Z"
            fill="url(#arrowGradient)"
          />
          <path
            d="M20 8V18"
            stroke="url(#arrowGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="arrowGradient" x1="20" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0d9488" />
              <stop offset="1" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(
            "font-bold text-white tracking-tight",
            textSizeClasses[size]
          )}>
            Plano de
          </span>
          <span className={cn(
            "font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent tracking-tight -mt-1",
            textSizeClasses[size]
          )}>
            Vida
          </span>
        </div>
      )}
    </div>
  );
}
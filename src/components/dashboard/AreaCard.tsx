import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AREA_COLORS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';

interface AreaCardProps {
  area: LifeArea;
  label: string;
  total: number;
  completed: number;
}

export function AreaCard({ area, label, total, completed }: AreaCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage >= 80;
  const areaColor = AREA_HEX_COLORS[area];

  return (
    <div className={cn(
      "rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg min-w-[120px] sm:min-w-0",
      AREA_COLORS[area]
    )}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <h3 className="font-semibold text-foreground text-xs sm:text-sm truncate pr-1">{label}</h3>
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0" />
        )}
      </div>
      <div className="space-y-1 sm:space-y-2">
        <div className="text-xl sm:text-2xl font-bold text-foreground">{percentage}%</div>
        <div className="text-xs sm:text-sm text-foreground/70">
          {completed}/{total}
        </div>
        <div className="w-full bg-background/50 rounded-full h-1.5 sm:h-2">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: areaColor 
            }}
          />
        </div>
      </div>
    </div>
  );
}

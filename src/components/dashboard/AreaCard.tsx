import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AREA_COLORS, LifeArea } from '@/lib/constants';

interface AreaCardProps {
  area: LifeArea;
  label: string;
  total: number;
  completed: number;
}

export function AreaCard({ area, label, total, completed }: AreaCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage >= 80;

  return (
    <div className={cn(
      "rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg",
      AREA_COLORS[area]
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground">{label}</h3>
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive" />
        )}
      </div>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-foreground">{percentage}%</div>
        <div className="text-sm text-foreground/70">
          {completed} de {total} metas
        </div>
        <div className="w-full bg-background/50 rounded-full h-2">
          <div 
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              isComplete ? "bg-success" : "bg-destructive"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

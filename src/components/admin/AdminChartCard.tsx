import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminChartCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function AdminChartCard({ 
  title, 
  icon: Icon, 
  iconColor, 
  children, 
  className,
  action 
}: AdminChartCardProps) {
  return (
    <div className={cn(
      "rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-700/50">
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

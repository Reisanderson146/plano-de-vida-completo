import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Scale, 
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/consulta', label: 'Planos', icon: FileText },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/balanco', label: 'Balanço', icon: Scale },
  { path: '/conquistas', label: 'Conquistas', icon: Trophy },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-pb">
      <div className="flex items-center justify-around h-[68px] px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 min-w-0 relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
                isActive && "bg-primary/15 scale-110"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "text-primary scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium truncate px-1 mt-0.5 transition-all",
                isActive ? "text-primary font-semibold" : "opacity-80"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

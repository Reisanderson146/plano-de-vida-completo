import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BarChart3, 
  StickyNote 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Início', icon: LayoutDashboard },
  { path: '/cadastro', label: 'Novo', icon: FileText },
  { path: '/consulta', label: 'Planos', icon: Search },
  { path: '/relatorios', label: 'Relatório', icon: BarChart3 },
  { path: '/anotacoes', label: 'Notas', icon: StickyNote },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors min-w-0",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1",
                isActive && "text-primary"
              )} />
              <span className={cn(
                "text-xs font-medium truncate px-1",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

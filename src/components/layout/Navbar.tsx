import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BarChart3, 
  StickyNote, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cadastro', label: 'Cadastro', icon: FileText },
  { path: '/consulta', label: 'Consulta', icon: Search },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/anotacoes', label: 'Anotações', icon: StickyNote },
];

export function Navbar() {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <nav className="gradient-hero shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm sm:text-lg">PV</span>
              </div>
              <span className="text-primary-foreground font-semibold text-base sm:text-xl hidden sm:block">
                Plano de Vida
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-primary-foreground/70 text-xs sm:text-sm hidden sm:block truncate max-w-[150px]">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

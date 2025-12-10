import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BarChart3, 
  StickyNote, 
  LogOut,
  User
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
    <nav className="gradient-hero shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          <Link to="/" className="flex items-center">
            <Logo size="sm" showText={true} className="sm:hidden" />
            <Logo size="md" showText={true} className="hidden sm:flex" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300",
                    isActive 
                      ? "bg-white/25 text-white shadow-md" 
                      : "text-white/80 hover:text-white hover:bg-white/15"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <User className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm truncate max-w-[120px]">
                {user?.email?.split('@')[0]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white/80 hover:text-white hover:bg-white/15 rounded-full px-3 sm:px-4"
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

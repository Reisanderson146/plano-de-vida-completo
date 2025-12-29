import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  LogOut, 
  LayoutDashboard,
  Home,
  Bell,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Painel', icon: LayoutDashboard },
];

/**
 * Secure Admin Layout - renders only after admin status is confirmed.
 * Prevents UI exposure to unauthorized users.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect non-admins after verification is complete
  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar esta página.',
          variant: 'destructive',
        });
        navigate('/admin/login');
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Show loading screen until admin status is verified
  // This prevents any UI exposure before authorization is confirmed
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-amber-500 animate-spin" />
            <Shield className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin - prevents UI flash
  if (!isAdmin || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 transition-all duration-300 group-hover:border-amber-500/40 group-hover:shadow-lg group-hover:shadow-amber-500/10">
                <Shield className="w-5 h-5 text-amber-400" />
                <div className="absolute inset-0 rounded-xl bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">Admin Panel</span>
                <span className="text-[10px] text-slate-500 block -mt-0.5 font-medium tracking-wider uppercase">Plano de Vida</span>
              </div>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 rounded-full px-1.5 py-1 border border-slate-700/50">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-amber-500/20 text-amber-400 shadow-inner" 
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-9 h-9"
              >
                <Bell className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">App</span>
              </Button>
              
              <div className="w-px h-6 bg-slate-700" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-900/50 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>© 2024 Plano de Vida. Admin Panel.</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

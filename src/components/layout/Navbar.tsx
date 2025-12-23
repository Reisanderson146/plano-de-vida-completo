import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BarChart3, 
  Scale,
  LogOut,
  User,
  Settings,
  Shield,
  CreditCard,
  HelpCircle,
  Play,
  Crown,
  Gem
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTourContext } from './AppLayout';


const navItems = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/consulta', label: 'Planos', icon: FileText },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/balanco', label: 'Balanço', icon: Scale },
];

export function Navbar() {
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const tourContext = useTourContext();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, full_name, subscription_plan')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setAvatarUrl(data.avatar_url);
      setFullName(data.full_name);
      setSubscriptionPlan(data.subscription_plan);
    }
  };

  const getInitials = () => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getPlanBadge = () => {
    if (subscriptionPlan === 'premium') {
      return (
        <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 text-[10px] px-1.5 py-0 h-5 gap-1 shadow-lg shadow-violet-500/30">
          <Crown className="w-3 h-3" />
          Premium
        </Badge>
      );
    }
    if (subscriptionPlan === 'basic') {
      return (
        <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-[10px] px-1.5 py-0 h-5 gap-1">
          <Gem className="w-3 h-3" />
          Basic
        </Badge>
      );
    }
    return null;
  };

  return (
    <nav className="gradient-hero shadow-xl sticky top-0 z-50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="flex items-center group">
              <Logo size="sm" showText={true} showIcon={false} variant="light" singleLine={true} className="sm:hidden transition-transform group-hover:scale-105" />
              <Logo size="md" showText={true} showIcon={false} variant="light" singleLine={true} className="hidden sm:flex transition-transform group-hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-2xl px-2 py-1.5 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-white/25 text-white shadow-lg font-semibold" 
                      : "text-white/75 hover:text-white hover:bg-white/15"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-2xl p-1.5 pr-3 sm:pr-4 shadow-inner hover:shadow-lg">
                  <Avatar className="w-8 h-8 ring-2 ring-white/30 ring-offset-1 ring-offset-transparent">
                    <AvatarImage src={avatarUrl || undefined} alt={fullName || 'Usuário'} />
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-white/90 text-sm font-medium truncate max-w-[100px]">
                    {fullName || user?.email?.split('@')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{fullName || 'Usuário'}</p>
                    {getPlanBadge()}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/meus-dados" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Meus Dados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/configuracoes" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/conta" className="flex items-center cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Minha Assinatura
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/guia" className="flex items-center cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Como Usar
                  </Link>
                </DropdownMenuItem>
                {tourContext && (
                  <DropdownMenuItem 
                    onClick={() => tourContext.restartTour()}
                    className="flex items-center cursor-pointer"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ver Tour Novamente
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="flex items-center cursor-pointer text-primary">
                        <Shield className="w-4 h-4 mr-2" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

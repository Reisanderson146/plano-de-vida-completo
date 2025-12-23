import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  TrendingUp, 
  FileText,
  Crown,
  Gem,
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, AreaChart, Area } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import new admin components
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminUserCard } from '@/components/admin/AdminUserCard';
import { AdminChartCard } from '@/components/admin/AdminChartCard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminManageSection } from '@/components/admin/AdminManageSection';

interface UserProfile {
  id: string;
  full_name: string | null;
  created_at: string;
  is_blocked: boolean;
  email?: string;
  isAdmin?: boolean;
  subscription_plan: string | null;
  subscription_status: string | null;
}

interface MonthlyStats {
  month: string;
  count: number;
  fullMonth: string;
}

interface UserPlan {
  id: string;
  title: string;
  plan_type: string;
  member_name: string | null;
  created_at: string;
  goals_count: number;
  completed_count: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userPlans, setUserPlans] = useState<Record<string, UserPlan[]>>({});
  const [loadingPlans, setLoadingPlans] = useState<string | null>(null);
  const [updatingAdminRole, setUpdatingAdminRole] = useState<string | null>(null);
  const [adminConfirmDialog, setAdminConfirmDialog] = useState<{ userId: string; userName: string; isAdmin: boolean } | null>(null);
  const [updatingSubscription, setUpdatingSubscription] = useState<string | null>(null);
  const [subscriptionDialog, setSubscriptionDialog] = useState<{ userId: string; userName: string; currentPlan: string | null } | null>(null);
  const [totalPlans, setTotalPlans] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked' | 'admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'plan'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!adminLoading) {
      if (!isAdmin) {
        navigate('/admin/login');
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar esta página.',
          variant: 'destructive',
        });
      } else {
        loadData();
      }
    }
  }, [isAdmin, adminLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      const usersWithAdminStatus = (profiles || []).map(profile => ({
        ...profile,
        isAdmin: adminUserIds.has(profile.id)
      }));

      setUsers(usersWithAdminStatus);

      const stats: MonthlyStats[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const count = (profiles || []).filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        stats.push({
          month: format(monthDate, 'MMM', { locale: ptBR }),
          fullMonth: format(monthDate, 'MMMM yyyy', { locale: ptBR }),
          count,
        });
      }
      setMonthlyStats(stats);

      const { data: plans, error: plansError } = await supabase
        .from('life_plans')
        .select('*');

      if (plansError) throw plansError;
      setTotalPlans(plans?.length || 0);

    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPlans = async (userId: string) => {
    if (userPlans[userId]) {
      setExpandedUser(expandedUser === userId ? null : userId);
      return;
    }

    setLoadingPlans(userId);
    try {
      const { data: plans, error: plansError } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', userId);

      if (plansError) throw plansError;

      const plansWithGoals: UserPlan[] = await Promise.all(
        (plans || []).map(async (plan) => {
          const { data: goals } = await supabase
            .from('life_goals')
            .select('is_completed')
            .eq('life_plan_id', plan.id);

          return {
            id: plan.id,
            title: plan.title,
            plan_type: plan.plan_type,
            member_name: plan.member_name,
            created_at: plan.created_at,
            goals_count: goals?.length || 0,
            completed_count: goals?.filter(g => g.is_completed).length || 0,
          };
        })
      );

      setUserPlans(prev => ({ ...prev, [userId]: plansWithGoals }));
      setExpandedUser(userId);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar planos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingPlans(null);
    }
  };

  const toggleUserBlock = async (userId: string, currentStatus: boolean) => {
    setUpdatingUser(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_blocked: !currentStatus } : u
      ));

      toast({
        title: currentStatus ? 'Usuário desbloqueado' : 'Usuário bloqueado',
        description: `O acesso do usuário foi ${currentStatus ? 'liberado' : 'bloqueado'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    setUpdatingAdminRole(userId);
    setAdminConfirmDialog(null);
    
    try {
      if (currentIsAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isAdmin: false } : u
        ));

        toast({
          title: 'Permissão removida',
          description: 'O usuário não é mais administrador.',
        });
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;

        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, isAdmin: true } : u
        ));

        toast({
          title: 'Permissão concedida',
          description: 'O usuário agora é administrador.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar permissão',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingAdminRole(null);
    }
  };

  const toggleSubscriptionPlan = async (userId: string, currentPlan: string | null) => {
    setUpdatingSubscription(userId);
    setSubscriptionDialog(null);
    
    const newPlan = currentPlan === 'premium' ? 'basic' : 'premium';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: newPlan,
          subscription_status: 'active'
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, subscription_plan: newPlan, subscription_status: 'active' } : u
      ));

      toast({
        title: 'Plano alterado',
        description: `Assinatura alterada para ${newPlan === 'premium' ? 'Premium' : 'Basic'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar plano',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingSubscription(null);
    }
  };

  const removeSubscription = async (userId: string) => {
    setUpdatingSubscription(userId);
    setSubscriptionDialog(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: null,
          subscription_status: null
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, subscription_plan: null, subscription_status: null } : u
      ));

      toast({
        title: 'Assinatura removida',
        description: 'O usuário não possui mais assinatura ativa.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover assinatura',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingSubscription(null);
    }
  };

  // Filter users based on search and status
  const filteredUsers = users
    .filter(userProfile => {
      const matchesSearch = !searchQuery || 
        userProfile.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'active' && !userProfile.is_blocked) ||
        (filterStatus === 'blocked' && userProfile.is_blocked) ||
        (filterStatus === 'admin' && userProfile.isAdmin);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = (a.full_name || '').toLowerCase();
          const nameB = (b.full_name || '').toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'plan':
          const planOrder = { premium: 3, basic: 2, null: 1 };
          const planA = planOrder[a.subscription_plan as keyof typeof planOrder] || 0;
          const planB = planOrder[b.subscription_plan as keyof typeof planOrder] || 0;
          comparison = planA - planB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, usersPerPage]);

  const handleSort = (field: 'name' | 'date' | 'plan') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (adminLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-amber-500 animate-spin" />
            <Shield className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Carregando painel administrativo...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.is_blocked).length;
  const blockedUsers = users.filter(u => u.is_blocked).length;
  const adminCount = users.filter(u => u.isAdmin).length;
  const premiumUsers = users.filter(u => u.subscription_plan === 'premium').length;
  const basicUsers = users.filter(u => u.subscription_plan === 'basic').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <AdminHeader onRefresh={loadData} isLoading={loading} />

        {/* Stats Cards - Main Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="Total de Usuários"
            value={totalUsers}
            icon={Users}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
            description={`${activeUsers} ativos`}
          />
          <AdminStatsCard
            title="Usuários Ativos"
            value={activeUsers}
            icon={UserCheck}
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/20"
            trend={{ value: Math.round((activeUsers / totalUsers) * 100), isPositive: true }}
          />
          <AdminStatsCard
            title="Bloqueados"
            value={blockedUsers}
            icon={UserX}
            iconColor="text-red-400"
            iconBgColor="bg-red-500/20"
          />
          <AdminStatsCard
            title="Total de Planos"
            value={totalPlans}
            icon={FileText}
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/20"
            description="Planos criados"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminStatsCard
            title="Administradores"
            value={adminCount}
            icon={Shield}
            iconColor="text-amber-400"
            iconBgColor="bg-amber-500/20"
          />
          <AdminStatsCard
            title="Premium"
            value={premiumUsers}
            icon={Crown}
            iconColor="text-violet-400"
            iconBgColor="bg-violet-500/20"
            description={`${Math.round((premiumUsers / totalUsers) * 100) || 0}% do total`}
          />
          <AdminStatsCard
            title="Basic"
            value={basicUsers}
            icon={Gem}
            iconColor="text-teal-400"
            iconBgColor="bg-teal-500/20"
            description={`${Math.round((basicUsers / totalUsers) * 100) || 0}% do total`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Registration Chart */}
          <AdminChartCard
            title="Cadastros por Mês"
            icon={TrendingUp}
            iconColor="text-amber-400"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyStats}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    allowDecimals={false} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Novos Usuários']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMonth || label}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AdminChartCard>

          {/* Admin Management */}
          <AdminManageSection
            users={users}
            currentUserId={user?.id}
            updatingAdminRole={updatingAdminRole}
            onOpenConfirmDialog={(userProfile) => setAdminConfirmDialog({
              userId: userProfile.id,
              userName: userProfile.full_name || 'Sem nome',
              isAdmin: userProfile.isAdmin || false
            })}
          />
        </div>

        {/* Users List Section */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Lista de Usuários</h3>
                <p className="text-xs text-slate-400">{filteredUsers.length} de {totalUsers} usuários</p>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-500/50"
                />
              </div>
              
              <div className="flex gap-1">
                {(['all', 'active', 'blocked', 'admin'] as const).map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`text-xs ${
                      filterStatus === status 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {status === 'all' && 'Todos'}
                    {status === 'active' && 'Ativos'}
                    {status === 'blocked' && 'Bloqueados'}
                    {status === 'admin' && 'Admins'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sorting and Per Page Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-700/30 bg-slate-800/20">
            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Ordenar por:</span>
              <div className="flex gap-1">
                {([
                  { key: 'name', label: 'Nome' },
                  { key: 'date', label: 'Data' },
                  { key: 'plan', label: 'Plano' }
                ] as const).map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(key)}
                    className={`text-xs h-7 px-2 gap-1 ${
                      sortBy === key 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {label}
                    {sortBy === key && (
                      sortOrder === 'asc' 
                        ? <ArrowUpIcon className="w-3 h-3" /> 
                        : <ArrowDownIcon className="w-3 h-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Por página:</span>
              <Select
                value={usersPerPage.toString()}
                onValueChange={(value) => setUsersPerPage(Number(value))}
              >
                <SelectTrigger className="w-20 h-7 text-xs bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {[5, 10, 25, 50, 100].map((num) => (
                    <SelectItem 
                      key={num} 
                      value={num.toString()}
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Users Grid */}
          <div className="p-4 space-y-3">
            {paginatedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Users className="w-12 h-12 opacity-30 mb-3" />
                <p className="text-sm">Nenhum usuário encontrado</p>
                <p className="text-xs text-slate-600 mt-1">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              paginatedUsers.map((userProfile) => (
                <AdminUserCard
                  key={userProfile.id}
                  user={userProfile}
                  currentUserId={user?.id}
                  plans={userPlans[userProfile.id]}
                  isExpanded={expandedUser === userProfile.id}
                  isLoadingPlans={loadingPlans === userProfile.id}
                  isUpdatingUser={updatingUser === userProfile.id}
                  isUpdatingSubscription={updatingSubscription === userProfile.id}
                  onToggleExpand={() => loadUserPlans(userProfile.id)}
                  onToggleBlock={() => toggleUserBlock(userProfile.id, userProfile.is_blocked)}
                  onOpenSubscriptionDialog={() => setSubscriptionDialog({
                    userId: userProfile.id,
                    userName: userProfile.full_name || 'Sem nome',
                    currentPlan: userProfile.subscription_plan
                  })}
                />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-700/50 bg-slate-800/30">
              <p className="text-sm text-slate-400">
                Mostrando <span className="text-white font-medium">{startIndex + 1}</span> a{' '}
                <span className="text-white font-medium">{Math.min(endIndex, filteredUsers.length)}</span> de{' '}
                <span className="text-white font-medium">{filteredUsers.length}</span> usuários
              </p>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Confirm Dialog */}
      <Dialog open={!!adminConfirmDialog} onOpenChange={() => setAdminConfirmDialog(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-xl ${adminConfirmDialog?.isAdmin ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                <Shield className={`w-6 h-6 ${adminConfirmDialog?.isAdmin ? 'text-red-400' : 'text-amber-400'}`} />
              </div>
              <DialogTitle className="text-xl text-white">
                {adminConfirmDialog?.isAdmin ? 'Remover permissão?' : 'Conceder permissão?'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 pl-14">
              {adminConfirmDialog?.isAdmin 
                ? `${adminConfirmDialog?.userName} perderá acesso ao painel administrativo e todas as funcionalidades de admin.`
                : `${adminConfirmDialog?.userName} terá acesso total ao painel administrativo, podendo gerenciar outros usuários.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setAdminConfirmDialog(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => adminConfirmDialog && toggleAdminRole(adminConfirmDialog.userId, adminConfirmDialog.isAdmin)}
              className={adminConfirmDialog?.isAdmin 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
              }
            >
              {adminConfirmDialog?.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Change Dialog */}
      <Dialog open={!!subscriptionDialog} onOpenChange={() => setSubscriptionDialog(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-violet-500/20">
                <ArrowUpDown className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-xl text-white">Alterar Assinatura</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {subscriptionDialog?.userName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Plano atual:</span>
              <Badge className={
                subscriptionDialog?.currentPlan === 'premium' 
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                  : subscriptionDialog?.currentPlan === 'basic' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }>
                {subscriptionDialog?.currentPlan === 'premium' ? 'Premium' : subscriptionDialog?.currentPlan === 'basic' ? 'Basic' : 'Sem assinatura'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => subscriptionDialog && toggleSubscriptionPlan(subscriptionDialog.userId, subscriptionDialog.currentPlan === 'basic' ? 'basic' : null)}
                disabled={subscriptionDialog?.currentPlan === 'basic'}
                className={`h-24 flex-col gap-2 ${
                  subscriptionDialog?.currentPlan === 'basic' 
                    ? 'bg-emerald-500/10 text-emerald-400/50 border border-emerald-500/20 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0'
                }`}
              >
                <Gem className="w-6 h-6" />
                <span className="font-semibold">Basic</span>
              </Button>
              <Button
                onClick={() => subscriptionDialog && toggleSubscriptionPlan(subscriptionDialog.userId, subscriptionDialog.currentPlan === 'premium' ? 'premium' : 'basic')}
                disabled={subscriptionDialog?.currentPlan === 'premium'}
                className={`h-24 flex-col gap-2 ${
                  subscriptionDialog?.currentPlan === 'premium' 
                    ? 'bg-violet-500/10 text-violet-400/50 border border-violet-500/20 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0'
                }`}
              >
                <Crown className="w-6 h-6" />
                <span className="font-semibold">Premium</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setSubscriptionDialog(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              Cancelar
            </Button>
            {subscriptionDialog?.currentPlan && (
              <Button
                variant="destructive"
                onClick={() => subscriptionDialog && removeSubscription(subscriptionDialog.userId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Remover Assinatura
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

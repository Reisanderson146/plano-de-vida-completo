import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, UserCheck, UserX, Shield, TrendingUp, FileText, ChevronDown, ChevronUp, Eye, ShieldCheck, ShieldOff, Crown, Gem, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
  
  const [selectedUserPlans, setSelectedUserPlans] = useState<UserPlan[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

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

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Individual';
      case 'familiar': return 'Familiar';
      case 'filho': return 'Filho';
      default: return type;
    }
  };

  const getSubscriptionLabel = (plan: string | null) => {
    if (!plan) return 'Sem assinatura';
    if (plan === 'basic') return 'Basic';
    if (plan === 'premium') return 'Premium';
    return plan;
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

  if (adminLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Painel Admin</h1>
            <p className="text-slate-400">Gerencie usuários e visualize estatísticas</p>
          </div>
        </div>

        {/* Stats Cards - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <UserCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-400">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/20">
                  <UserX className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Usuários Bloqueados</p>
                  <p className="text-2xl font-bold text-red-400">{blockedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total de Planos</p>
                  <p className="text-2xl font-bold text-white">{totalPlans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Administradores</p>
                  <p className="text-2xl font-bold text-amber-400">{adminCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Cadastros de Usuários por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats}>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    formatter={(value) => [value, 'Usuários Cadastrados']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f1f5f9'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {monthlyStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#f59e0b" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Section */}
        <Card className="bg-slate-800/50 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-400">
              <Shield className="w-5 h-5" />
              Gerenciar Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">
              Conceda ou remova permissões de administrador para outros usuários.
            </p>
            {users.filter(u => u.id !== user?.id).length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum outro usuário cadastrado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.filter(u => u.id !== user?.id).map((userProfile) => (
                  <div 
                    key={userProfile.id} 
                    className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                      userProfile.isAdmin 
                        ? 'border-amber-500/30 bg-amber-500/5' 
                        : 'border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        userProfile.isAdmin ? 'bg-amber-500/20' : 'bg-slate-700'
                      }`}>
                        {userProfile.isAdmin ? (
                          <Shield className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Users className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{userProfile.full_name || 'Sem nome'}</p>
                        <p className="text-xs text-slate-400">
                          {userProfile.isAdmin ? 'Administrador' : 'Usuário comum'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={userProfile.isAdmin ? "outline" : "default"}
                      size="sm"
                      onClick={() => setAdminConfirmDialog({
                        userId: userProfile.id,
                        userName: userProfile.full_name || 'Sem nome',
                        isAdmin: userProfile.isAdmin || false
                      })}
                      disabled={updatingAdminRole === userProfile.id}
                      className={userProfile.isAdmin 
                        ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10' 
                        : 'bg-amber-500 text-slate-900 hover:bg-amber-600'
                      }
                    >
                      {updatingAdminRole === userProfile.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : userProfile.isAdmin ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-1" />
                          Remover
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Tornar Admin
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-blue-400" />
              Lista de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((userProfile) => (
                <div key={userProfile.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        userProfile.isAdmin ? 'bg-amber-500/20' : 'bg-slate-700'
                      }`}>
                        {userProfile.isAdmin ? (
                          <Shield className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Users className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-white">{userProfile.full_name || 'Sem nome'}</p>
                          {userProfile.isAdmin && (
                            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                              Admin
                            </Badge>
                          )}
                          {userProfile.subscription_plan === 'premium' ? (
                            <Badge className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          ) : userProfile.subscription_plan === 'basic' ? (
                            <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30">
                              <Gem className="w-3 h-3 mr-1" />
                              Basic
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-500">
                              Sem assinatura
                            </Badge>
                          )}
                          {userProfile.is_blocked && (
                            <Badge variant="destructive" className="text-xs">
                              Bloqueado
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Cadastrado em {format(new Date(userProfile.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadUserPlans(userProfile.id)}
                        disabled={loadingPlans === userProfile.id}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        {loadingPlans === userProfile.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Planos
                            {expandedUser === userProfile.id ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </>
                        )}
                      </Button>
                      {userProfile.id !== user?.id && (
                        <>
                          {/* Subscription Change Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubscriptionDialog({
                              userId: userProfile.id,
                              userName: userProfile.full_name || 'Sem nome',
                              currentPlan: userProfile.subscription_plan
                            })}
                            disabled={updatingSubscription === userProfile.id}
                            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                          >
                            {updatingSubscription === userProfile.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ArrowUpDown className="w-4 h-4 mr-1" />
                                Plano
                              </>
                            )}
                          </Button>
                          <Button
                            variant={userProfile.is_blocked ? "default" : "destructive"}
                            size="sm"
                            onClick={() => toggleUserBlock(userProfile.id, userProfile.is_blocked)}
                            disabled={updatingUser === userProfile.id}
                            className={userProfile.is_blocked 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : ''
                            }
                          >
                            {updatingUser === userProfile.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : userProfile.is_blocked ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Desbloquear
                              </>
                            ) : (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Bloquear
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded plans */}
                  {expandedUser === userProfile.id && userPlans[userProfile.id] && (
                    <div className="ml-4 pl-4 border-l-2 border-slate-700 space-y-2">
                      {userPlans[userProfile.id].length === 0 ? (
                        <p className="text-sm text-slate-500 py-2">Nenhum plano criado</p>
                      ) : (
                        userPlans[userProfile.id].map((plan) => (
                          <div 
                            key={plan.id} 
                            className="p-3 rounded-lg bg-slate-700/20 border border-slate-700/50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white text-sm">{plan.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                    {getPlanTypeLabel(plan.plan_type)}
                                  </Badge>
                                  {plan.member_name && (
                                    <span className="text-xs text-slate-500">
                                      {plan.member_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-white">
                                  {plan.completed_count}/{plan.goals_count}
                                </p>
                                <p className="text-xs text-slate-500">metas realizadas</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Confirm Dialog */}
      <Dialog open={!!adminConfirmDialog} onOpenChange={() => setAdminConfirmDialog(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {adminConfirmDialog?.isAdmin ? 'Remover permissão de Admin?' : 'Conceder permissão de Admin?'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {adminConfirmDialog?.isAdmin 
                ? `${adminConfirmDialog?.userName} perderá acesso ao painel administrativo.`
                : `${adminConfirmDialog?.userName} terá acesso total ao painel administrativo.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-amber-500 text-slate-900 hover:bg-amber-600'
              }
            >
              {adminConfirmDialog?.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Change Dialog */}
      <Dialog open={!!subscriptionDialog} onOpenChange={() => setSubscriptionDialog(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-violet-400" />
              Alterar Assinatura
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Altere o plano de assinatura de <span className="text-white font-medium">{subscriptionDialog?.userName}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <p className="text-sm text-slate-400">
              Plano atual: {' '}
              <span className={subscriptionDialog?.currentPlan === 'premium' ? 'text-violet-400 font-medium' : subscriptionDialog?.currentPlan === 'basic' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {subscriptionDialog?.currentPlan === 'premium' ? 'Premium' : subscriptionDialog?.currentPlan === 'basic' ? 'Basic' : 'Sem assinatura'}
              </span>
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => subscriptionDialog && toggleSubscriptionPlan(subscriptionDialog.userId, subscriptionDialog.currentPlan === 'basic' ? 'basic' : null)}
                disabled={subscriptionDialog?.currentPlan === 'basic'}
                className={subscriptionDialog?.currentPlan === 'basic' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }
              >
                <Gem className="w-4 h-4 mr-2" />
                Basic
              </Button>
              <Button
                onClick={() => subscriptionDialog && toggleSubscriptionPlan(subscriptionDialog.userId, subscriptionDialog.currentPlan === 'premium' ? 'premium' : 'basic')}
                disabled={subscriptionDialog?.currentPlan === 'premium'}
                className={subscriptionDialog?.currentPlan === 'premium' 
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
                }
              >
                <Crown className="w-4 h-4 mr-2" />
                Premium
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

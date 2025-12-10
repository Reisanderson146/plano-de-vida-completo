import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, UserCheck, UserX, Shield, TrendingUp, Calendar, FileText, Target, ChevronDown, ChevronUp, Eye, ShieldCheck, ShieldOff } from 'lucide-react';
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


export default function Admin() {
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
  
  // Estatísticas gerais
  const [totalPlans, setTotalPlans] = useState(0);
  
  // Modal de detalhes
  const [selectedUserPlans, setSelectedUserPlans] = useState<UserPlan[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  useEffect(() => {
    if (!adminLoading) {
      if (!isAdmin) {
        navigate('/');
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
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Mark users as admin
      const usersWithAdminStatus = (profiles || []).map(profile => ({
        ...profile,
        isAdmin: adminUserIds.has(profile.id)
      }));

      setUsers(usersWithAdminStatus);

      // Calculate monthly stats for the last 6 months
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

      // Fetch all life plans
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

      // Get goals count for each plan
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
        // Remove admin role
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
        // Add admin role
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

  if (adminLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
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
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie usuários e visualize estatísticas</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Row 1: Users */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-500">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuários Bloqueados</p>
                  <p className="text-2xl font-bold text-red-500">{blockedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Row 2: Plans & Admins */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de Planos</p>
                  <p className="text-2xl font-bold">{totalPlans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Administradores</p>
                  <p className="text-2xl font-bold text-amber-600">{adminCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Chart - Full Width */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Cadastros de Usuários por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats}>
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    formatter={(value) => [value, 'Usuários Cadastrados']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {monthlyStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Section */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
              <Shield className="w-5 h-5" />
              Gerenciar Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Conceda ou remova permissões de administrador para outros usuários.
            </p>
            {users.filter(u => u.id !== user?.id).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
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
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        userProfile.isAdmin ? 'bg-amber-500/20' : 'bg-muted'
                      }`}>
                        {userProfile.isAdmin ? (
                          <Shield className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Users className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{userProfile.full_name || 'Sem nome'}</p>
                        <p className="text-xs text-muted-foreground">
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
                      className={userProfile.isAdmin ? 'border-amber-500/50 text-amber-600 hover:bg-amber-500/10' : ''}
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
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário cadastrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((userProfile) => (
                  <div key={userProfile.id} className="rounded-lg border border-border bg-background/50 overflow-hidden">
                    <div 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {userProfile.full_name || 'Sem nome'}
                          </span>
                          {userProfile.isAdmin && (
                            <Badge className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {userProfile.is_blocked ? (
                            <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">Ativo</Badge>
                          )}
                          {userProfile.id === user?.id && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          Cadastrado em {format(new Date(userProfile.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadUserPlans(userProfile.id)}
                          disabled={loadingPlans === userProfile.id}
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
                          <Button
                            variant={userProfile.is_blocked ? "default" : "destructive"}
                            size="sm"
                            onClick={() => toggleUserBlock(userProfile.id, userProfile.is_blocked)}
                            disabled={updatingUser === userProfile.id}
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
                        )}
                      </div>
                    </div>

                    {/* User Plans Expanded */}
                    {expandedUser === userProfile.id && userPlans[userProfile.id] && (
                      <div className="border-t border-border bg-muted/30 p-4">
                        {userPlans[userProfile.id].length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Este usuário não possui planos cadastrados.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {userPlans[userProfile.id].length} plano(s) encontrado(s)
                            </p>
                            {userPlans[userProfile.id].map((plan) => (
                              <div 
                                key={plan.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-background border border-border/50"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-sm">{plan.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {getPlanTypeLabel(plan.plan_type)}
                                    </Badge>
                                  </div>
                                  {plan.member_name && (
                                    <p className="text-xs text-muted-foreground ml-6">
                                      Membro: {plan.member_name}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6 sm:ml-0">
                                  <span>
                                    <Target className="w-3 h-3 inline mr-1" />
                                    {plan.completed_count}/{plan.goals_count} metas
                                  </span>
                                  <span>
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {format(new Date(plan.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Role Confirmation Dialog */}
        <Dialog open={!!adminConfirmDialog} onOpenChange={() => setAdminConfirmDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {adminConfirmDialog?.isAdmin ? 'Remover Permissão de Administrador' : 'Conceder Permissão de Administrador'}
              </DialogTitle>
              <DialogDescription>
                {adminConfirmDialog?.isAdmin 
                  ? `Tem certeza que deseja remover a permissão de administrador de "${adminConfirmDialog?.userName}"? Este usuário perderá acesso ao painel administrativo.`
                  : `Tem certeza que deseja tornar "${adminConfirmDialog?.userName}" um administrador? Este usuário terá acesso total ao painel administrativo.`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setAdminConfirmDialog(null)}>
                Cancelar
              </Button>
              <Button 
                variant={adminConfirmDialog?.isAdmin ? "destructive" : "default"}
                onClick={() => adminConfirmDialog && toggleAdminRole(adminConfirmDialog.userId, adminConfirmDialog.isAdmin)}
              >
                {adminConfirmDialog?.isAdmin ? 'Remover Permissão' : 'Conceder Permissão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
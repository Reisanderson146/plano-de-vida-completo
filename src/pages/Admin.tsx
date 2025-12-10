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
import { Loader2, Users, UserCheck, UserX, Shield, TrendingUp, Calendar, FileText, Target, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AREA_COLORS, AREA_HEX_COLORS } from '@/lib/constants';
import { DateRangeFilter, getYearRangeFromDateRange } from '@/components/filters/DateRangeFilter';
import { DateRange } from 'react-day-picker';

interface UserProfile {
  id: string;
  full_name: string | null;
  created_at: string;
  is_blocked: boolean;
  email?: string;
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

interface GoalsByArea {
  area: string;
  total: number;
  completed: number;
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
  
  // Estatísticas gerais
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [goalsByArea, setGoalsByArea] = useState<GoalsByArea[]>([]);
  
  // Filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date())
  });
  
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
  }, [isAdmin, adminLoading, navigate, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setUsers(profiles || []);

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

      // Apply date range filter to goals query
      const yearRange = getYearRangeFromDateRange(dateRange);
      let goalsQuery = supabase.from('life_goals').select('*');
      
      if (yearRange.min !== undefined) {
        goalsQuery = goalsQuery.gte('period_year', yearRange.min);
      }
      if (yearRange.max !== undefined) {
        goalsQuery = goalsQuery.lte('period_year', yearRange.max);
      }

      const { data: goals, error: goalsError } = await goalsQuery;

      if (goalsError) throw goalsError;
      
      setTotalGoals(goals?.length || 0);
      setCompletedGoals(goals?.filter(g => g.is_completed).length || 0);

      // Calculate goals by area
      const areaStats: Record<string, { total: number; completed: number }> = {};
      goals?.forEach(goal => {
        if (!areaStats[goal.area]) {
          areaStats[goal.area] = { total: 0, completed: 0 };
        }
        areaStats[goal.area].total++;
        if (goal.is_completed) {
          areaStats[goal.area].completed++;
        }
      });

      const areaData = Object.entries(areaStats).map(([area, data]) => ({
        area,
        total: data.total,
        completed: data.completed,
      }));
      setGoalsByArea(areaData);

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
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

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
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
            />
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

        {/* Stats Cards - Row 2: Plans & Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de Metas</p>
                  <p className="text-2xl font-bold">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Metas Concluídas</p>
                  <p className="text-2xl font-bold text-emerald-500">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Registration Chart */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Cadastros por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip 
                      formatter={(value) => [value, 'Cadastros']}
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

          {/* Goals by Area Chart */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Metas por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {goalsByArea.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={goalsByArea}
                        dataKey="total"
                        nameKey="area"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        label={({ area, total }) => `${area}: ${total}`}
                        labelLine={false}
                      >
                        {goalsByArea.map((entry) => (
                          <Cell 
                            key={`cell-${entry.area}`} 
                            fill={AREA_HEX_COLORS[entry.area] || 'hsl(var(--primary))'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} metas (${props.payload.completed} concluídas)`,
                          props.payload.area
                        ]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Nenhuma meta cadastrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </AppLayout>
  );
}
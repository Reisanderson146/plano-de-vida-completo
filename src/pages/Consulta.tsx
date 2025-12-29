import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, FileText, ChevronRight, Plus, Trash2, User, Users, Baby, Filter, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ExportPlanDialog } from '@/components/life-plan/ExportPlanDialog';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface LifePlan {
  id: string;
  title: string;
  motto: string | null;
  plan_type: string;
  member_name: string | null;
  created_at: string;
  goals_count: number;
  completed_count: number;
  photo_url: string | null;
}

interface Goal {
  id: string;
  life_plan_id: string;
  period_year: number;
  age: number;
  area: LifeArea;
  goal_text: string;
  is_completed: boolean;
}

interface AreaConfig {
  id: LifeArea;
  label: string;
  color: string;
}

const PLAN_TYPE_CONFIG = {
  individual: { 
    label: 'Individual', 
    icon: User, 
    color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20' 
  },
  familiar: { 
    label: 'Familiar', 
    icon: Users, 
    color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20' 
  },
  filho: { 
    label: 'Filho(a)', 
    icon: Baby, 
    color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20' 
  },
};

type FilterType = 'todos' | 'individual' | 'familiar' | 'filho';

export default function Consulta() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<LifePlan[]>([]);
  const [filter, setFilter] = useState<FilterType>('todos');
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportPlan, setExportPlan] = useState<LifePlan | null>(null);
  const [exportGoals, setExportGoals] = useState<Goal[]>([]);
  const [exportAreaConfigs, setExportAreaConfigs] = useState<AreaConfig[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      const plansWithCounts = await Promise.all(
        (plansData || []).map(async (plan) => {
          const { count: totalCount } = await supabase
            .from('life_goals')
            .select('*', { count: 'exact', head: true })
            .eq('life_plan_id', plan.id);

          const { count: completedCount } = await supabase
            .from('life_goals')
            .select('*', { count: 'exact', head: true })
            .eq('life_plan_id', plan.id)
            .eq('is_completed', true);

          return {
            ...plan,
            goals_count: totalCount || 0,
            completed_count: completedCount || 0,
          };
        })
      );

      setPlans(plansWithCounts);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('life_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({ title: 'Plano excluído com sucesso!' });
      loadPlans();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleOpenExport = async (plan: LifePlan) => {
    setLoadingExport(true);
    setExportPlan(plan);
    
    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('life_goals')
        .select('*')
        .eq('life_plan_id', plan.id)
        .order('period_year', { ascending: true });

      if (goalsError) throw goalsError;

      const { data: customizations } = await supabase
        .from('plan_area_customizations')
        .select('*')
        .eq('life_plan_id', plan.id);

      const areaConfigs = LIFE_AREAS.map(a => {
        const custom = customizations?.find(c => c.area_id === a.id);
        return {
          id: a.id,
          label: custom?.custom_label || a.label,
          color: custom?.custom_color || AREA_HEX_COLORS[a.id],
        };
      });

      setExportGoals(goalsData as Goal[]);
      setExportAreaConfigs(areaConfigs);
      setExportDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar plano',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const filteredPlans = filter === 'todos' 
    ? plans 
    : plans.filter(p => p.plan_type === filter);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'individual', label: 'Individual' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'filho', label: 'Filhos' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 opacity-0 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Meus Planos</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Consulte e edite seus planos de vida
            </p>
          </div>
          <Link to="/cadastro" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 shadow-inner animate-pulse">
                <Plus className="w-4 h-4" strokeWidth={3} />
              </span>
              Novo Plano
            </Button>
          </Link>
        </div>

        {/* Filter */}
        {plans.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide opacity-0 animate-stagger-1">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "flex-shrink-0 rounded-xl h-9",
                  filter !== option.value && "border-border/50"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}

        {plans.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
                Nenhum plano encontrado
              </h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                Crie seu primeiro plano de vida para começar sua jornada de desenvolvimento pessoal
              </p>
              <Link to="/cadastro">
                <Button className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Plano
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredPlans.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <Filter className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
                Nenhum plano encontrado
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Não há planos do tipo "{filterOptions.find(f => f.value === filter)?.label}"
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 opacity-0 animate-stagger-2">
            {filteredPlans.map((plan) => {
              const percentage = plan.goals_count > 0
                ? Math.round((plan.completed_count / plan.goals_count) * 100)
                : 0;

              const typeConfig = PLAN_TYPE_CONFIG[plan.plan_type as keyof typeof PLAN_TYPE_CONFIG] 
                || PLAN_TYPE_CONFIG.individual;
              const TypeIcon = typeConfig.icon;

              return (
                <Card key={plan.id} className="border-border/40 hover:border-border/60 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Plan Photo */}
                        <Avatar className="w-14 h-14 border-2 border-border/40 flex-shrink-0">
                          <AvatarImage src={plan.photo_url || undefined} alt={plan.title} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                            <TypeIcon className="w-6 h-6 text-primary/60" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("flex items-center gap-1.5 text-xs font-medium border rounded-lg px-2.5 py-1", typeConfig.color)}>
                              <TypeIcon className="w-3 h-3" />
                              {typeConfig.label}
                            </Badge>
                            {plan.member_name && (
                              <Badge variant="outline" className="text-xs rounded-lg">
                                {plan.member_name}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg truncate">{plan.title}</CardTitle>
                          {plan.motto && (
                            <CardDescription className="italic text-sm line-clamp-2">
                              "{plan.motto}"
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl"
                          onClick={() => handleOpenExport(plan)}
                          disabled={loadingExport}
                        >
                          {loadingExport && exportPlan?.id === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                        <ConfirmDeleteDialog
                          trigger={
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-9 w-9 rounded-xl">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                          title="Excluir plano?"
                          description="Esta ação não pode ser desfeita. Todas as metas deste plano serão excluídas permanentemente."
                          confirmText={plan.title}
                          onConfirm={() => handleDelete(plan.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold text-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{plan.completed_count} de {plan.goals_count} metas</span>
                        <span>
                          {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <Link to={`/consulta/${plan.id}`}>
                        <Button variant="outline" className="w-full mt-1 h-11 rounded-xl border-border/50 hover:border-border">
                          Ver e Editar
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {exportPlan && (
          <ExportPlanDialog
            open={exportDialogOpen}
            onOpenChange={setExportDialogOpen}
            plan={exportPlan}
            goals={exportGoals}
            areaConfigs={exportAreaConfigs}
          />
        )}
      </div>
    </AppLayout>
  );
}

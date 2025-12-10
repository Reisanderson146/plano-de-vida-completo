import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, FileText, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LifePlan {
  id: string;
  title: string;
  motto: string | null;
  created_at: string;
  goals_count: number;
  completed_count: number;
}

export default function Consulta() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<LifePlan[]>([]);

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

      // Get goals counts for each plan
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Meus Planos</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Consulte e edite seus planos de vida
            </p>
          </div>
          <Link to="/cadastro" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </Link>
        </div>

        {plans.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center">
                Nenhum plano encontrado
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 text-center">
                Crie seu primeiro plano de vida para começar
              </p>
              <Link to="/cadastro" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Plano
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const percentage = plan.goals_count > 0
                ? Math.round((plan.completed_count / plan.goals_count) * 100)
                : 0;

              return (
                <Card key={plan.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2 sm:pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{plan.title}</CardTitle>
                        {plan.motto && (
                          <CardDescription className="mt-1 italic text-xs sm:text-sm line-clamp-2">
                            "{plan.motto}"
                          </CardDescription>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Todas as metas deste plano serão excluídas permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(plan.id)} className="w-full sm:w-auto">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                        <span>{plan.completed_count} de {plan.goals_count} metas</span>
                        <span>
                          {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <Link to={`/consulta/${plan.id}`}>
                        <Button variant="outline" className="w-full mt-2 h-10 sm:h-9">
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
      </div>
    </AppLayout>
  );
}

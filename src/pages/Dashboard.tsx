import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { AreaCard } from '@/components/dashboard/AreaCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type AreaStats = Record<LifeArea, { total: number; completed: number }>;

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AreaStats>({
    espiritual: { total: 0, completed: 0 },
    intelectual: { total: 0, completed: 0 },
    familiar: { total: 0, completed: 0 },
    social: { total: 0, completed: 0 },
    financeiro: { total: 0, completed: 0 },
    profissional: { total: 0, completed: 0 },
    saude: { total: 0, completed: 0 },
  });
  const [hasPlans, setHasPlans] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const { data: goals, error } = await supabase
        .from('life_goals')
        .select('area, is_completed')
        .eq('user_id', user!.id);

      if (error) throw error;

      const newStats: AreaStats = {
        espiritual: { total: 0, completed: 0 },
        intelectual: { total: 0, completed: 0 },
        familiar: { total: 0, completed: 0 },
        social: { total: 0, completed: 0 },
        financeiro: { total: 0, completed: 0 },
        profissional: { total: 0, completed: 0 },
        saude: { total: 0, completed: 0 },
      };

      goals?.forEach((goal) => {
        const area = goal.area as LifeArea;
        if (newStats[area]) {
          newStats[area].total++;
          if (goal.is_completed) {
            newStats[area].completed++;
          }
        }
      });

      setStats(newStats);
      setHasPlans((goals?.length ?? 0) > 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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

  if (!hasPlans) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-hero flex items-center justify-center mb-4 sm:mb-6">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Bem-vindo ao Plano de Vida!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
            Você ainda não tem nenhum plano cadastrado. Comece criando seu primeiro plano de vida e defina suas metas nas 7 áreas.
          </p>
          <Link to="/cadastro">
            <Button size="lg" className="w-full sm:w-auto">
              Criar meu primeiro plano
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Acompanhe seu progresso nas 7 áreas da vida
          </p>
        </div>

        {/* Area cards with horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 min-w-max sm:min-w-0">
            {LIFE_AREAS.map((area) => (
              <AreaCard
                key={area.id}
                area={area.id}
                label={area.label}
                total={stats[area.id].total}
                completed={stats[area.id].completed}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Visão Geral do Progresso</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ProgressChart data={stats} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

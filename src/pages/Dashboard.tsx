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
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo ao Plano de Vida!
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Você ainda não tem nenhum plano cadastrado. Comece criando seu primeiro plano de vida e defina suas metas nas 7 áreas.
          </p>
          <Link to="/cadastro">
            <Button size="lg">
              Criar meu primeiro plano
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso nas 7 áreas da vida
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Visão Geral do Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={stats} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

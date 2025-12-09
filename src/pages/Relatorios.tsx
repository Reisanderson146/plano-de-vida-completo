import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { Loader2, TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type AreaStats = Record<LifeArea, { total: number; completed: number }>;

const AREA_HEX_COLORS: Record<LifeArea, string> = {
  espiritual: '#a8d5f7',
  intelectual: '#d4b8e8',
  familiar: '#f5c2d1',
  social: '#a8e0f7',
  financeiro: '#b8e6c4',
  profissional: '#f5e8a8',
  saude: '#a8e6d5',
};

export default function Relatorios() {
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
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);

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

      let total = 0;
      let completed = 0;

      goals?.forEach((goal) => {
        const area = goal.area as LifeArea;
        if (newStats[area]) {
          newStats[area].total++;
          total++;
          if (goal.is_completed) {
            newStats[area].completed++;
            completed++;
          }
        }
      });

      setStats(newStats);
      setTotalGoals(total);
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const barChartData = LIFE_AREAS.map((area) => ({
    name: area.label,
    area: area.id,
    total: stats[area.id].total,
    completed: stats[area.id].completed,
    percentage: stats[area.id].total > 0
      ? Math.round((stats[area.id].completed / stats[area.id].total) * 100)
      : 0,
  }));

  const bestArea = barChartData.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  );
  
  const worstArea = barChartData.reduce((worst, current) => 
    current.percentage < worst.percentage ? current : worst
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const overallPercentage = totalGoals > 0 
    ? Math.round((completedGoals / totalGoals) * 100) 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada do seu progresso
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Metas</p>
                  <p className="text-3xl font-bold text-foreground">{totalGoals}</p>
                </div>
                <Target className="w-10 h-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Metas Concluídas</p>
                  <p className="text-3xl font-bold text-success">{completedGoals}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Melhor Área</p>
                  <p className="text-xl font-bold text-foreground">{bestArea.name}</p>
                  <p className="text-sm text-success">{bestArea.percentage}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Área para Melhorar</p>
                  <p className="text-xl font-bold text-foreground">{worstArea.name}</p>
                  <p className="text-sm text-destructive">{worstArea.percentage}%</p>
                </div>
                <TrendingDown className="w-10 h-10 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Progresso por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Progresso']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {barChartData.map((entry) => (
                        <Cell key={entry.area} fill={AREA_HEX_COLORS[entry.area as LifeArea]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Visão Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart data={stats} />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${overallPercentage * 3.52} 352`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{overallPercentage}%</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {overallPercentage >= 80 ? 'Excelente!' : 
                   overallPercentage >= 50 ? 'Bom progresso!' : 
                   'Continue focado!'}
                </h3>
                <p className="text-muted-foreground">
                  Você completou {completedGoals} de {totalGoals} metas em todas as áreas da vida.
                  {overallPercentage < 50 && ' Foque nas áreas que precisam de mais atenção.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AreaStats {
  area: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
}

interface AISummaryProps {
  stats: AreaStats[];
  totalGoals: number;
  completedGoals: number;
  planTitle: string;
  period: string;
}

export function AISummary({ stats, totalGoals, completedGoals, planTitle, period }: AISummaryProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-balance-summary', {
        body: {
          stats,
          totalGoals,
          completedGoals,
          planTitle,
          period,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Erro ao gerar resumo',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (totalGoals === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Resumo Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Use a inteligência artificial para obter uma análise personalizada do seu progresso.
            </p>
            <Button onClick={generateSummary} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Gerar Análise com IA
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analisando seu progresso...</p>
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                {summary}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={generateSummary} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Gerar novo resumo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

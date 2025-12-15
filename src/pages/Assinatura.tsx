import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';

const benefits = [
  'Acesso completo ao app',
  'Todas as 7 áreas do plano de vida',
  'Salvamento de dados na nuvem',
  'Relatórios e gráficos de progresso',
  'Lembretes personalizados',
  'Exportação em PDF',
];

export default function Assinatura() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'premium',
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Assinatura ativada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Erro ao ativar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao Plano de Vida</h1>
            <p className="text-muted-foreground mt-2">
              Ative sua assinatura para começar sua jornada
            </p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Plano Premium
            </CardTitle>
            <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-foreground">R$ 9,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleActivate}
              disabled={loading}
              className="w-full h-12 text-lg font-semibold"
            >
              {loading ? 'Ativando...' : 'Ativar acesso (teste)'}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Ao ativar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
}

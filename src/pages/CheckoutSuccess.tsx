import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      if (!user) return;

      try {
        // Call check-subscription to sync status with Stripe
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) throw error;
        
        console.log('Subscription verified:', data);
        setSubscriptionPlan(data?.subscription_plan || 'basic');
        setLoading(false);

        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2A8C68', '#7BC8A4', '#10b981', '#34d399']
        });
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('Erro ao verificar assinatura. Por favor, aguarde alguns segundos e tente novamente.');
        setLoading(false);
      }
    };

    // Small delay to allow Stripe to process
    const timer = setTimeout(verifySubscription, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
              <div className="absolute inset-0 animate-pulse">
                <Sparkles className="w-6 h-6 text-amber-500 absolute top-0 right-4" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Verificando pagamento...</h2>
            <p className="text-muted-foreground">Aguarde enquanto confirmamos sua assinatura.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/10 via-background to-destructive/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar novamente
              </Button>
              <Button onClick={() => navigate('/')}>Ir para o Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl shadow-primary/10">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-primary" />
            </div>
            <Sparkles className="w-6 h-6 text-amber-500 absolute top-0 right-1/4 animate-pulse" />
            <Sparkles className="w-4 h-4 text-primary absolute bottom-0 left-1/4 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              🎉 Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              {subscriptionPlan === 'premium' 
                ? 'Sua assinatura Premium foi ativada com sucesso! Você tem acesso a todas as funcionalidades.'
                : 'Sua assinatura Basic foi ativada com sucesso! Você pode criar seu plano de vida agora.'}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={() => navigate('/cadastro')} 
              className="w-full h-12 text-base font-semibold"
              variant="premium"
            >
              Criar meu Plano de Vida
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              Ir para o Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

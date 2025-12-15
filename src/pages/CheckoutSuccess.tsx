import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      if (!user) return;

      try {
        // Call check-subscription to sync status with Stripe
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) throw error;
        
        console.log('Subscription verified:', data);
        setLoading(false);
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('Erro ao verificar assinatura. Por favor, aguarde alguns segundos e tente novamente.');
        setLoading(false);
      }
    };

    // Small delay to allow Stripe webhook to process
    const timer = setTimeout(verifySubscription, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A8C68]/10 via-background to-[#7BC8A4]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Verificando pagamento...</h2>
            <p className="text-muted-foreground">Aguarde enquanto confirmamos sua assinatura.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2A8C68]/10 via-background to-[#7BC8A4]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => navigate('/')}>Ir para o Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A8C68]/10 via-background to-[#7BC8A4]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#2A8C68]/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-[#2A8C68]/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[#2A8C68]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground">
              Sua assinatura Premium foi ativada com sucesso. Agora você tem acesso a todas as funcionalidades.
            </p>
          </div>

          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-gradient-to-r from-[#2A8C68] to-[#7BC8A4] hover:from-[#238058] hover:to-[#6ab893]"
          >
            Começar a usar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

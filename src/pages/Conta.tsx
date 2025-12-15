import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionInfo {
  status: string;
  plan: string | null;
}

export default function Conta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: 'inactive',
    plan: null,
  });

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_plan')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setSubscription({
        status: data.subscription_status || 'inactive',
        plan: data.subscription_plan,
      });
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive',
          subscription_plan: null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Assinatura cancelada');
      navigate('/assinatura');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const planDetails = {
    name: subscription.plan === 'premium' ? 'Premium' : 'Nenhum',
    price: subscription.plan === 'premium' ? 'R$ 9,99/mês' : '-',
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl py-8 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Conta</h1>
          <p className="text-muted-foreground">Gerencie sua assinatura e dados</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Plano {planDetails.name}</CardTitle>
                  <CardDescription>Sua assinatura atual</CardDescription>
                </div>
              </div>
              <Badge
                variant={subscription.status === 'active' ? 'default' : 'secondary'}
                className={subscription.status === 'active' ? 'bg-green-500' : ''}
              >
                {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-semibold">{planDetails.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>
            </div>

            {subscription.status === 'active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    Cancelar assinatura (teste)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Cancelar assinatura?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao cancelar, você perderá acesso às funcionalidades premium. 
                      Você pode reativar a qualquer momento.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={loading}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {subscription.status !== 'active' && (
              <Button onClick={() => navigate('/assinatura')} className="w-full">
                Ativar assinatura
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, BadgeCheck, CreditCard, Calendar, AlertTriangle, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

  const isActive = subscription.status === 'active';
  const isPremium = subscription.plan === 'premium';

  return (
    <AppLayout>
      <div className="container max-w-2xl py-8 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Assinatura</h1>
          <p className="text-muted-foreground">Gerencie seu plano e benefícios</p>
        </div>

        {/* Current Plan Card */}
        <Card className="overflow-hidden border-primary/20">
          {/* Premium Header */}
          {isPremium && isActive && (
            <div className="bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] py-4 px-6">
              <div className="flex items-center justify-center gap-2">
                <Gem className="w-5 h-5 text-white/90" />
                <span className="font-semibold text-white tracking-widest uppercase">Premium Ativo</span>
                <BadgeCheck className="w-5 h-5 text-white/90" />
              </div>
            </div>
          )}

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isPremium && isActive 
                    ? 'bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4]' 
                    : 'bg-muted'
                }`}>
                  <Gem className={`w-7 h-7 ${isPremium && isActive ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Plano {isPremium ? 'Premium' : 'Gratuito'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isPremium ? 'Acesso completo a todas as funcionalidades' : 'Funcionalidades limitadas'}
                  </p>
                </div>
              </div>
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className={isActive ? 'bg-[#2A8C68] hover:bg-[#2A8C68]' : ''}
              >
                {isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-[#A8E6CE]/10 rounded-xl">
                <CreditCard className="w-5 h-5 text-[#2A8C68]" />
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-bold text-lg">{isPremium ? 'R$ 9,99/mês' : 'Grátis'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#A8E6CE]/10 rounded-xl">
                <Calendar className="w-5 h-5 text-[#2A8C68]" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-bold text-lg">{isActive ? 'Ativo' : 'Inativo'}</p>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            {isPremium && isActive && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Seus benefícios:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    'Planejamento completo',
                    'Dados na nuvem',
                    'Relatórios de progresso',
                    'Lembretes por email',
                    'Exportação em PDF',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#2A8C68]" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {isActive ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cancelar assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Cancelar assinatura?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao cancelar, você perderá acesso a todas as funcionalidades premium. 
                      Seus dados serão mantidos e você pode reativar a qualquer momento.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter Premium</AlertDialogCancel>
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
            ) : (
              <Button onClick={() => navigate('/assinatura')} className="w-full bg-gradient-to-r from-[#2A8C68] to-[#7BC8A4] hover:from-[#238058] hover:to-[#6ab893] text-white">
                <Gem className="w-4 h-4 mr-2" />
                Ativar Premium
              </Button>
            )}

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Shield className="w-4 h-4" />
              <span>Seus dados estão seguros e protegidos</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, BadgeCheck, CreditCard, Calendar, Check, Shield, ExternalLink, Loader2, Crown, Sparkles, Zap, Target, Heart, Users, Baby, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS, getTierByProductId, SubscriptionTier } from '@/lib/subscription-tiers';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SubscriptionInfo {
  status: string;
  plan: SubscriptionTier | null;
  subscriptionEnd: string | null;
  productId: string | null;
}

interface Benefit {
  icon: LucideIcon;
  text: string;
  includedInBasic: boolean;
  highlight?: boolean;
}

// All benefits - same list for both plans, with strikethrough for Basic
const allBenefits: Benefit[] = [
  { icon: User, text: '1 Plano Individual', includedInBasic: true },
  { icon: Target, text: 'Planejamento das 7 áreas', includedInBasic: true },
  { icon: Shield, text: 'Dados seguros na nuvem', includedInBasic: true },
  { icon: Zap, text: 'Exportação em PDF', includedInBasic: true },
  { icon: Users, text: '1 Plano Familiar', includedInBasic: false },
  { icon: Baby, text: '3 Planos para Filhos', includedInBasic: false },
  { icon: Sparkles, text: 'Resumo inteligente com IA', includedInBasic: false, highlight: true },
  { icon: Check, text: 'Relatórios de progresso', includedInBasic: false },
  { icon: Heart, text: 'Lembretes por email', includedInBasic: false },
];

// Premium benefits (without individual plan)
const premiumBenefits: Benefit[] = [
  { icon: Users, text: '1 Plano Familiar', includedInBasic: false },
  { icon: Baby, text: '3 Planos para Filhos', includedInBasic: false },
  { icon: Target, text: 'Planejamento das 7 áreas', includedInBasic: true },
  { icon: Shield, text: 'Dados seguros na nuvem', includedInBasic: true },
  { icon: Zap, text: 'Exportação em PDF', includedInBasic: true },
  { icon: Sparkles, text: 'Resumo inteligente com IA', includedInBasic: false, highlight: true },
  { icon: Check, text: 'Relatórios de progresso', includedInBasic: false },
  { icon: Heart, text: 'Lembretes por email', includedInBasic: false },
];

export default function Conta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'basic' | 'premium' | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: 'inactive',
    plan: null,
    subscriptionEnd: null,
    productId: null,
  });

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (!error && data) {
        const tier = getTierByProductId(data.product_id);
        setSubscription({
          status: data.subscription_status || 'inactive',
          plan: tier,
          subscriptionEnd: data.subscription_end || null,
          productId: data.product_id || null,
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCheckout = async (tier: 'basic' | 'premium') => {
    if (!user) return;

    setCheckoutLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const isActive = subscription.status === 'active';
  const currentPlan = subscription.plan;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Assinatura</h1>
          <p className="text-muted-foreground">Escolha o plano ideal para você e sua família</p>
        </div>

        {/* Plans Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Plan */}
          <Card className={cn(
            "relative overflow-hidden transition-all duration-300",
            currentPlan === 'basic' 
              ? "border-2 border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
              : "border-border/50 hover:border-border"
          )}>
            
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Gem className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Plano Basic</h2>
                    {currentPlan === 'basic' && (
                      <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Para começar sua jornada</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center py-4 bg-muted/30 rounded-xl">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">R$ 9,99</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                {allBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        benefit.includedInBasic 
                          ? "bg-emerald-500/10" 
                          : "bg-muted/50"
                      )}>
                        {benefit.includedInBasic ? (
                          <Icon className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm",
                        benefit.includedInBasic 
                          ? "text-foreground" 
                          : "text-muted-foreground/50 line-through"
                      )}>
                        {benefit.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {!isActive ? (
                <Button 
                  onClick={() => handleCheckout('basic')} 
                  disabled={checkoutLoading !== null}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  {checkoutLoading === 'basic' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Gem className="w-4 h-4 mr-2" />
                  )}
                  Assinar Basic
                </Button>
              ) : currentPlan === 'basic' ? (
                <Button 
                  onClick={handleManageSubscription} 
                  disabled={portalLoading}
                  variant="outline" 
                  className="w-full"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gerenciar Assinatura
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  Você tem um plano superior
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={cn(
            "relative overflow-hidden transition-all duration-300",
            currentPlan === 'premium' 
              ? "border-2 border-violet-500/50 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/20" 
              : "border-2 border-violet-500/30 hover:border-violet-500/50"
          )}>
            {/* Recommended Badge */}
            {currentPlan !== 'premium' && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Plano Premium
                    </h2>
                    {currentPlan === 'premium' && (
                      <Badge variant="outline" className="border-violet-500/50 text-violet-600 text-xs">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Para toda a família</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Price */}
              <div className="text-center py-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    R$ 29,99
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <div className="mt-1 inline-flex items-center gap-1 bg-violet-500/20 text-violet-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  4 planos incluídos
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                {premiumBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className={cn(
                      "flex items-center gap-3",
                      benefit.highlight && "p-2 -mx-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        benefit.highlight 
                          ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                          : "bg-violet-500/10"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          benefit.highlight ? "text-white" : "text-violet-600"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm flex-1",
                        benefit.highlight ? "font-semibold text-foreground" : "text-foreground"
                      )}>
                        {benefit.text}
                      </span>
                      {benefit.highlight && (
                        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600">
                          Exclusivo
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {!isActive || currentPlan === 'basic' ? (
                <Button 
                  onClick={() => handleCheckout('premium')} 
                  disabled={checkoutLoading !== null}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                >
                  {checkoutLoading === 'premium' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4 mr-2" />
                  )}
                  {currentPlan === 'basic' ? 'Fazer Upgrade' : 'Assinar Premium'}
                </Button>
              ) : (
                <Button 
                  onClick={handleManageSubscription} 
                  disabled={portalLoading}
                  variant="outline" 
                  className="w-full border-violet-500/30 hover:bg-violet-500/10"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Gerenciar Assinatura
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Info */}
        {isActive && subscription.subscriptionEnd && (
          <Card className="border-border/40">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Próxima cobrança</p>
                    <p className="text-sm text-muted-foreground">{formatDate(subscription.subscriptionEnd)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento seguro via Stripe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

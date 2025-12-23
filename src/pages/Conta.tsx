import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, BadgeCheck, CreditCard, Calendar, Check, Shield, ExternalLink, Loader2, Crown, Sparkles, Zap, Target, Heart, Users, Baby, User, X, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS, getTierByProductId, SubscriptionTier } from '@/lib/subscription-tiers';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string | null;
  description: string;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
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
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'basic' | 'premium' | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: 'inactive',
    plan: null,
    subscriptionEnd: null,
    productId: null,
  });

  useEffect(() => {
    if (user) {
      loadSubscription();
      loadPayments();
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

  const loadPayments = async () => {
    if (!user) return;
    setPaymentsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('list-payments');
      
      if (!error && data?.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setPaymentsLoading(false);
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Pago</Badge>;
      case 'open':
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30">Pendente</Badge>;
      case 'uncollectible':
        return <Badge variant="destructive">Não cobrado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Plan Card Component
  const PlanCard = ({ type }: { type: 'basic' | 'premium' }) => {
    const isBasic = type === 'basic';
    const isPremium = type === 'premium';
    const isCurrent = currentPlan === type;
    const benefits = isBasic ? allBenefits : premiumBenefits;

    return (
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full",
        isCurrent && isBasic && "border-2 border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/20",
        isCurrent && isPremium && "border-2 border-violet-500/50 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/20",
        !isCurrent && isBasic && "border-border/50 hover:border-primary/30 hover:shadow-primary/5",
        !isCurrent && isPremium && "border-2 border-violet-500/30 hover:border-violet-500/50 hover:shadow-violet-500/10"
      )}>
        {/* Recommended Badge for Premium */}
        {isPremium && !isCurrent && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Recomendado
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              isBasic && "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
              isPremium && "bg-gradient-to-br from-violet-500/20 to-purple-500/20"
            )}>
              {isBasic ? (
                <Gem className="w-6 h-6 text-emerald-600" />
              ) : (
                <Crown className="w-6 h-6 text-violet-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={cn(
                  "text-xl font-bold",
                  isPremium && "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                )}>
                  Plano {isBasic ? 'Basic' : 'Premium'}
                </h2>
                {isCurrent && (
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    isBasic && "border-primary/50 text-primary",
                    isPremium && "border-violet-500/50 text-violet-600"
                  )}>
                    Atual
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isBasic ? 'Para começar sua jornada' : 'Para toda a família'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price */}
          <div className={cn(
            "text-center py-4 rounded-xl",
            isBasic && "bg-muted/30",
            isPremium && "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
          )}>
            <div className="flex items-baseline justify-center gap-1">
              <span className={cn(
                "text-3xl font-bold",
                isBasic && "text-foreground",
                isPremium && "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
              )}>
                R$ {isBasic ? '9,99' : '29,99'}
              </span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>
            {isPremium && (
              <div className="mt-1 inline-flex items-center gap-1 bg-violet-500/20 text-violet-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <Zap className="w-3 h-3" />
                4 planos incluídos
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const included = isBasic ? benefit.includedInBasic : true;
              
              return (
                <div key={index} className={cn(
                  "flex items-center gap-3",
                  benefit.highlight && isPremium && "p-2 -mx-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    included && isBasic && "bg-emerald-500/10",
                    !included && isBasic && "bg-muted/50",
                    isPremium && benefit.highlight && "bg-gradient-to-br from-violet-500 to-purple-600",
                    isPremium && !benefit.highlight && "bg-violet-500/10"
                  )}>
                    {included ? (
                      <Icon className={cn(
                        "w-4 h-4",
                        isBasic && "text-emerald-600",
                        isPremium && benefit.highlight && "text-white",
                        isPremium && !benefit.highlight && "text-violet-600"
                      )} />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm flex-1",
                    included ? "text-foreground" : "text-muted-foreground/50 line-through",
                    benefit.highlight && isPremium && "font-semibold"
                  )}>
                    {benefit.text}
                  </span>
                  {benefit.highlight && isPremium && (
                    <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600">
                      Exclusivo
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {!isActive ? (
            <Button 
              onClick={() => handleCheckout(type)} 
              disabled={checkoutLoading !== null}
              className={cn(
                "w-full text-white",
                isBasic && "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
                isPremium && "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
              )}
            >
              {checkoutLoading === type ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isBasic ? (
                <Gem className="w-4 h-4 mr-2" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Assinar {isBasic ? 'Basic' : 'Premium'}
            </Button>
          ) : isCurrent ? (
            <Button 
              onClick={handleManageSubscription} 
              disabled={portalLoading}
              variant="outline" 
              className={cn(
                "w-full",
                isPremium && "border-violet-500/30 hover:bg-violet-500/10"
              )}
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Gerenciar Assinatura
            </Button>
          ) : isBasic && currentPlan === 'premium' ? (
            <Button variant="outline" disabled className="w-full">
              Você tem um plano superior
            </Button>
          ) : (
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
              Fazer Upgrade
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl py-8 space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minha Assinatura</h1>
          <p className="text-muted-foreground">Escolha o plano ideal para você e sua família</p>
        </div>

        {/* Plans Comparison - Carousel on mobile, Grid on desktop */}
        {isMobile ? (
          <Carousel className="w-full" opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              <CarouselItem className="pl-2 md:pl-4 basis-[90%]">
                <PlanCard type="basic" />
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 basis-[90%]">
                <PlanCard type="premium" />
              </CarouselItem>
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <PlanCard type="basic" />
            <PlanCard type="premium" />
          </div>
        )}

        {/* Subscription Info */}
        {isActive && subscription.subscriptionEnd && (
          <Card className="border-border/40">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
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

        {/* Payment History */}
        {isActive && (
          <Card className="border-border/40">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pagamento encontrado
                </p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{payment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.date ? formatDate(payment.date) : 'Data não disponível'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          {getStatusBadge(payment.status)}
                        </div>
                        {payment.invoicePdf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(payment.invoicePdf!, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

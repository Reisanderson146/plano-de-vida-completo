import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, BadgeCheck, CreditCard, Calendar, Check, Shield, ExternalLink, Loader2, Crown, Sparkles, Zap, Target, Heart, Users, Baby, User, X, FileText, Download, ChevronLeft, ChevronRight, Bell, Clock, AlertTriangle, CalendarClock, Pause, Play, XCircle, HeartHandshake } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";

interface SubscriptionInfo {
  status: string;
  plan: SubscriptionTier | null;
  subscriptionEnd: string | null;
  productId: string | null;
  subscriptionStart?: string | null;
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

// Plan benefit configurations
interface PlanBenefit {
  icon: LucideIcon;
  text: string;
  included: boolean;
  highlight?: boolean;
}

const basicBenefits: PlanBenefit[] = [
  { icon: User, text: '1 Plano Individual', included: true },
  { icon: Target, text: 'Planejamento das 7 áreas', included: true },
  { icon: Shield, text: 'Dados seguros na nuvem', included: true },
  { icon: Zap, text: 'Exportação em PDF', included: true },
  { icon: Users, text: 'Plano Familiar', included: false },
  { icon: Baby, text: 'Planos para Filhos', included: false },
  { icon: Sparkles, text: 'Resumo com IA', included: false },
];

const familiarBenefits: PlanBenefit[] = [
  { icon: Users, text: '1 Plano Familiar', included: true, highlight: true },
  { icon: Baby, text: '3 Planos para Filhos', included: true, highlight: true },
  { icon: Target, text: 'Planejamento das 7 áreas', included: true },
  { icon: Shield, text: 'Dados seguros na nuvem', included: true },
  { icon: Zap, text: 'Exportação em PDF', included: true },
  { icon: HeartHandshake, text: 'Email aniversário casamento', included: true },
  { icon: Sparkles, text: 'Resumo com IA', included: true },
];

const premiumBenefits: PlanBenefit[] = [
  { icon: User, text: '1 Plano Individual', included: true },
  { icon: Users, text: '1 Plano Familiar', included: true },
  { icon: Baby, text: '3 Planos para Filhos', included: true, highlight: true },
  { icon: Target, text: 'Planejamento das 7 áreas', included: true },
  { icon: Shield, text: 'Dados seguros na nuvem', included: true },
  { icon: Zap, text: 'Exportação em PDF', included: true },
  { icon: HeartHandshake, text: 'Email aniversário casamento', included: true },
  { icon: Sparkles, text: 'Resumo com IA', included: true, highlight: true },
];

export default function Conta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'basic' | 'familiar' | 'premium' | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: 'inactive',
    plan: null,
    subscriptionEnd: null,
    productId: null,
  });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);

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

  const handleCheckout = async (tier: 'basic' | 'familiar' | 'premium') => {
    if (!user) return;

    setCheckoutLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        // Open in new tab to avoid iframe issues
        window.open(data.url, '_blank');
        toast.success('Checkout aberto em nova aba. Complete o pagamento lá!');
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

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { immediately: false }
      });

      if (error) throw error;

      toast.success(data?.message || 'Assinatura será cancelada no fim do período');
      loadSubscription();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Erro ao cancelar assinatura');
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePauseSubscription = async () => {
    setPauseLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pause-subscription', {
        body: { action: 'pause' }
      });

      if (error) throw error;

      toast.success(data?.message || 'Assinatura pausada com sucesso');
      loadSubscription();
    } catch (error: any) {
      console.error('Error pausing subscription:', error);
      toast.error(error.message || 'Erro ao pausar assinatura');
    } finally {
      setPauseLoading(false);
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
  const PlanCard = ({ type }: { type: 'basic' | 'familiar' | 'premium' }) => {
    const isBasic = type === 'basic';
    const isFamiliar = type === 'familiar';
    const isPremium = type === 'premium';
    const isCurrent = currentPlan === type;
    
    const benefits = isBasic ? basicBenefits : isFamiliar ? familiarBenefits : premiumBenefits;
    const price = isBasic ? '9,99' : isFamiliar ? '19,90' : '29,99';
    const planName = isBasic ? 'Basic' : isFamiliar ? 'Familiar' : 'Premium';
    const subtitle = isBasic ? 'Para começar sua jornada' : isFamiliar ? 'Para você e seu cônjuge' : 'Para toda a família';
    const plansIncluded = isBasic ? 1 : isFamiliar ? 4 : 5;

    const getColors = () => {
      if (isBasic) return {
        gradient: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-600',
        border: 'border-primary/50',
        shadow: 'shadow-primary/10',
        ring: 'ring-primary/20',
        hoverBorder: 'hover:border-primary/30',
        hoverShadow: 'hover:shadow-primary/5',
        bgGradient: 'bg-muted/30',
        btnGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
        trialBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        iconBg: 'bg-emerald-500/10',
        highlightBg: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10',
      };
      if (isFamiliar) return {
        gradient: 'from-rose-500/20 to-pink-500/20',
        iconColor: 'text-rose-600',
        border: 'border-rose-500/50',
        shadow: 'shadow-rose-500/10',
        ring: 'ring-rose-500/20',
        hoverBorder: 'hover:border-rose-500/30',
        hoverShadow: 'hover:shadow-rose-500/5',
        bgGradient: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20',
        btnGradient: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-500/25',
        trialBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
        iconBg: 'bg-rose-500/10',
        highlightBg: 'bg-gradient-to-r from-rose-500/10 to-pink-500/10',
      };
      return {
        gradient: 'from-violet-500/20 to-purple-500/20',
        iconColor: 'text-violet-600',
        border: 'border-violet-500/50',
        shadow: 'shadow-violet-500/10',
        ring: 'ring-violet-500/20',
        hoverBorder: 'hover:border-violet-500/50',
        hoverShadow: 'hover:shadow-violet-500/10',
        bgGradient: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20',
        btnGradient: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25',
        trialBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
        iconBg: 'bg-violet-500/10',
        highlightBg: 'bg-gradient-to-r from-violet-500/10 to-purple-500/10',
      };
    };

    const colors = getColors();

    const PlanIcon = isBasic ? Gem : isFamiliar ? HeartHandshake : Crown;

    return (
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col",
        isCurrent && `border-2 ${colors.border} shadow-lg ${colors.shadow} ring-1 ${colors.ring}`,
        !isCurrent && !isPremium && `border-border/50 ${colors.hoverBorder} ${colors.hoverShadow}`,
        !isCurrent && isPremium && `border-2 border-violet-500/30 ${colors.hoverBorder} ${colors.hoverShadow}`
      )}>
        {/* Recommended Badge for Premium */}
        {isPremium && !isCurrent && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Completo
            </Badge>
          </div>
        )}

        {/* Popular Badge for Familiar */}
        {isFamiliar && !isCurrent && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-lg">
              <Heart className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              `bg-gradient-to-br ${colors.gradient}`
            )}>
              <PlanIcon className={cn("w-6 h-6", colors.iconColor)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={cn(
                  "text-xl font-bold",
                  (isFamiliar || isPremium) && `bg-gradient-to-r ${isFamiliar ? 'from-rose-600 to-pink-600' : 'from-violet-600 to-purple-600'} bg-clip-text text-transparent`
                )}>
                  Plano {planName}
                </h2>
                {isCurrent && (
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    isBasic && "border-primary/50 text-primary",
                    isFamiliar && "border-rose-500/50 text-rose-600",
                    isPremium && "border-violet-500/50 text-violet-600"
                  )}>
                    Atual
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 space-y-6">
          {/* Price with Trial Badge */}
          <div className={cn("text-center py-4 rounded-xl relative overflow-hidden", colors.bgGradient)}>
            {/* Trial Badge */}
            <div className={cn("absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg", colors.trialBg)}>
              7 DIAS GRÁTIS
            </div>
            
            <div className="flex items-baseline justify-center gap-1">
              <span className={cn(
                "text-3xl font-bold",
                isBasic && "text-foreground",
                isFamiliar && "bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent",
                isPremium && "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
              )}>
                R$ {price}
              </span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>
            <p className={cn("text-xs font-medium mt-1", colors.iconColor)}>
              Teste grátis, cancele quando quiser
            </p>
            {!isBasic && (
              <div className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full",
                isFamiliar ? "bg-rose-500/20 text-rose-600" : "bg-violet-500/20 text-violet-600"
              )}>
                <Zap className="w-3 h-3" />
                {plansIncluded} planos incluídos
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-2 flex-1">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              
              return (
                <div key={index} className={cn(
                  "flex items-center gap-3",
                  benefit.highlight && `p-2 -mx-2 rounded-lg ${colors.highlightBg}`
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                    benefit.included ? colors.iconBg : "bg-muted/50"
                  )}>
                    {benefit.included ? (
                      <Icon className={cn("w-3.5 h-3.5", colors.iconColor)} />
                    ) : (
                      <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm flex-1",
                    benefit.included ? "text-foreground" : "text-muted-foreground/50 line-through",
                    benefit.highlight && "font-semibold"
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
              onClick={() => handleCheckout(type)} 
              disabled={checkoutLoading !== null}
              className={cn("w-full text-white", colors.btnGradient)}
            >
              {checkoutLoading === type ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlanIcon className="w-4 h-4 mr-2" />
              )}
              Começar 7 dias grátis
            </Button>
          ) : isCurrent ? (
            <Button 
              onClick={handleManageSubscription} 
              disabled={portalLoading}
              variant="outline" 
              className={cn(
                "w-full",
                isFamiliar && "border-rose-500/30 hover:bg-rose-500/10",
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
          ) : (isBasic && (currentPlan === 'familiar' || currentPlan === 'premium')) || (isFamiliar && currentPlan === 'premium') ? (
            <Button variant="outline" disabled className="w-full">
              Você tem um plano superior
            </Button>
          ) : (
            <Button 
              onClick={() => handleCheckout(type)} 
              disabled={checkoutLoading !== null}
              className={cn("w-full text-white", colors.btnGradient)}
            >
              {checkoutLoading === type ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PlanIcon className="w-4 h-4 mr-2" />
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
              <CarouselItem className="pl-2 md:pl-4 basis-[85%]">
                <PlanCard type="basic" />
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 basis-[85%]">
                <PlanCard type="familiar" />
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 basis-[85%]">
                <PlanCard type="premium" />
              </CarouselItem>
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <PlanCard type="basic" />
            <PlanCard type="familiar" />
            <PlanCard type="premium" />
          </div>
        )}

        {/* Subscription Details Card */}
        {isActive && (
          <Card className={cn(
            "border-2 overflow-hidden",
            currentPlan === 'premium' && "border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-500/5",
            currentPlan === 'familiar' && "border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-pink-500/5",
            currentPlan === 'basic' && "border-primary/30 bg-gradient-to-br from-primary/5 to-emerald-500/5"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {currentPlan === 'premium' ? (
                  <Crown className="w-5 h-5 text-violet-500" />
                ) : currentPlan === 'familiar' ? (
                  <HeartHandshake className="w-5 h-5 text-rose-500" />
                ) : (
                  <Gem className="w-5 h-5 text-primary" />
                )}
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    currentPlan === 'premium' && "bg-violet-500/20",
                    currentPlan === 'familiar' && "bg-rose-500/20",
                    currentPlan === 'basic' && "bg-primary/20"
                  )}>
                    {currentPlan === 'premium' ? (
                      <Crown className="w-5 h-5 text-violet-500" />
                    ) : currentPlan === 'familiar' ? (
                      <HeartHandshake className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Gem className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plano atual</p>
                    <p className={cn(
                      "font-semibold",
                      currentPlan === 'premium' && "text-violet-500",
                      currentPlan === 'familiar' && "text-rose-500",
                      currentPlan === 'basic' && "text-primary"
                    )}>
                      {currentPlan === 'premium' ? 'Premium' : currentPlan === 'familiar' ? 'Familiar' : 'Basic'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold text-emerald-500">Ativa</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              {subscription.subscriptionEnd && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CalendarClock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Próxima renovação</p>
                      <p className="font-medium">{formatDate(subscription.subscriptionEnd)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pagamento</p>
                      <p className="font-medium text-muted-foreground">Stripe (seguro)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Renewal Alert */}
              {subscription.subscriptionEnd && (() => {
                const daysUntilRenewal = Math.ceil(
                  (new Date(subscription.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                
                if (daysUntilRenewal <= 7 && daysUntilRenewal > 0) {
                  return (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Renovação em {daysUntilRenewal} {daysUntilRenewal === 1 ? 'dia' : 'dias'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sua assinatura será renovada automaticamente em {formatDate(subscription.subscriptionEnd)}
                        </p>
                      </div>
                      <Bell className="w-5 h-5 text-amber-500" />
                    </div>
                  );
                }
                return null;
              })()}

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
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
                  Gerenciar
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      disabled={pauseLoading}
                    >
                      {pauseLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4 mr-2" />
                      )}
                      Pausar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Pausar assinatura?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sua assinatura será pausada temporariamente. Você pode reativá-la a qualquer momento pelo portal do Stripe.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePauseSubscription} className="bg-amber-600 hover:bg-amber-700">
                        Pausar Assinatura
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sua assinatura será cancelada no fim do período atual. Você continuará tendo acesso até a data de renovação.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive hover:bg-destructive/90">
                        Confirmar Cancelamento
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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

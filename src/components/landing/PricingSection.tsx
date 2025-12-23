import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface PricingSectionProps {
  onCheckout: (tier: 'basic' | 'premium') => void;
  onLogin: () => void;
  loading: 'basic' | 'premium' | null;
}

interface Benefit {
  text: string;
  icon: LucideIcon;
  includedInBasic: boolean;
  highlight?: boolean;
}

// Benefits for Basic plan
const basicBenefits: Benefit[] = [
  { text: "1 Plano Individual", icon: User, includedInBasic: true },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedInBasic: true },
  { text: "Seus dados seguros na nuvem", icon: Shield, includedInBasic: true },
  { text: "Exportação profissional em PDF", icon: Zap, includedInBasic: true },
  { text: "1 Plano Familiar", icon: Users, includedInBasic: false },
  { text: "3 Planos para Filhos", icon: Baby, includedInBasic: false },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedInBasic: false, highlight: true },
  { text: "Relatórios e gráficos de progresso", icon: Check, includedInBasic: false },
  { text: "Lembretes por email", icon: Heart, includedInBasic: false },
];

// Benefits for Premium plan (without individual plan)
const premiumBenefits: Benefit[] = [
  { text: "1 Plano Familiar", icon: Users, includedInBasic: false },
  { text: "3 Planos para Filhos", icon: Baby, includedInBasic: false },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedInBasic: true },
  { text: "Seus dados seguros na nuvem", icon: Shield, includedInBasic: true },
  { text: "Exportação profissional em PDF", icon: Zap, includedInBasic: true },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedInBasic: false, highlight: true },
  { text: "Relatórios e gráficos de progresso", icon: Check, includedInBasic: false },
  { text: "Lembretes por email", icon: Heart, includedInBasic: false },
];

const PricingSection = ({ onCheckout, onLogin, loading }: PricingSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const plans = [
    {
      id: 'basic' as const,
      name: 'Basic',
      subtitle: 'Para Começar',
      price: 'R$ 9,99',
      description: '1 plano individual',
      icon: Gem,
      benefits: basicBenefits,
      color: 'emerald',
      recommended: false,
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      subtitle: 'Para Toda Família',
      price: 'R$ 29,99',
      description: '5 planos incluídos',
      icon: Crown,
      benefits: premiumBenefits,
      color: 'violet',
      recommended: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">
            Conferir planos
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comece sua{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Jornada
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Invista no seu futuro com um plano que cabe no seu bolso.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-md mx-auto animate-fade-in">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={scrollPrev}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-14 z-20",
              "w-12 h-12 rounded-full bg-card border border-border shadow-lg",
              "flex items-center justify-center transition-all duration-200",
              "hidden md:flex",
              !canScrollPrev ? "opacity-30 cursor-not-allowed" : "hover:bg-muted hover:scale-110 hover:shadow-xl"
            )}
            disabled={!canScrollPrev}
            aria-label="Plano anterior"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          
          <button
            onClick={scrollNext}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-14 z-20",
              "w-12 h-12 rounded-full bg-card border border-border shadow-lg",
              "flex items-center justify-center transition-all duration-200",
              "hidden md:flex",
              !canScrollNext ? "opacity-30 cursor-not-allowed" : "hover:bg-muted hover:scale-110 hover:shadow-xl"
            )}
            disabled={!canScrollNext}
            aria-label="Próximo plano"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {plans.map((plan, index) => (
                <div key={plan.id} className="flex-[0_0_100%] min-w-0 px-2">
                  <Card className={cn(
                    "relative overflow-hidden border-2 bg-card/80 backdrop-blur-sm shadow-xl transition-all duration-300",
                    plan.color === 'emerald' 
                      ? "border-primary/20 hover:border-primary/40 hover:shadow-2xl"
                      : "border-violet-500/40 shadow-violet-500/10 hover:border-violet-500/60 hover:shadow-violet-500/20"
                  )}>
                    {/* Glow Effect */}
                    <div className={cn(
                      "absolute inset-0",
                      plan.color === 'emerald'
                        ? "bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5"
                        : "bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10"
                    )} />
                    
                    {/* Recommended Badge */}
                    {plan.recommended && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white font-medium text-xs shadow-lg shadow-violet-500/30">
                          <Crown className="w-3 h-3" />
                          <span>Recomendado</span>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pt-8 pb-4 text-center relative">
                      {/* Badge */}
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-semibold mx-auto mb-4",
                        plan.color === 'emerald'
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400"
                      )}>
                        <plan.icon className="w-4 h-4" />
                        <span>{plan.name}</span>
                      </div>
                      
                      <CardTitle className={cn(
                        "text-xl font-bold mb-4",
                        plan.color === 'emerald'
                          ? "text-foreground"
                          : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                      )}>
                        {plan.subtitle}
                      </CardTitle>
                      
                      {/* Price */}
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={cn(
                          "text-4xl font-bold",
                          plan.color === 'emerald'
                            ? "text-foreground"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                        )}>
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                      
                      {plan.color === 'emerald' ? (
                        <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1 bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          <Zap className="w-3 h-3" />
                          {plan.description}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="relative space-y-6 pb-8">
                      {/* Benefits List */}
                      <ul className="space-y-3">
                        {plan.benefits.map((benefit, benefitIndex) => {
                          const isIncluded = plan.id === 'basic' ? benefit.includedInBasic : true;
                          
                          return (
                            <li 
                              key={benefitIndex} 
                              className={cn(
                                "flex items-center gap-3",
                                benefit.highlight && plan.id === 'premium' && "p-2 -mx-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                !isIncluded 
                                  ? "bg-muted/50"
                                  : benefit.highlight && plan.id === 'premium'
                                    ? "bg-gradient-to-br from-violet-500 to-purple-600"
                                    : plan.color === 'emerald'
                                      ? "bg-emerald-500/10"
                                      : "bg-violet-500/10"
                              )}>
                                {isIncluded ? (
                                  <benefit.icon className={cn(
                                    "w-3.5 h-3.5",
                                    benefit.highlight && plan.id === 'premium'
                                      ? "text-white"
                                      : plan.color === 'emerald'
                                        ? "text-emerald-600"
                                        : "text-violet-600"
                                  )} />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm flex-1",
                                !isIncluded 
                                  ? "text-muted-foreground/50 line-through"
                                  : benefit.highlight ? "font-semibold text-foreground" : "text-foreground"
                              )}>
                                {benefit.text}
                              </span>
                              {benefit.highlight && plan.id === 'premium' && (
                                <span className="text-[10px] bg-violet-500/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full">
                                  Exclusivo
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>

                      {/* CTA Button */}
                      <div className="pt-4">
                        <Button
                          size="lg"
                          onClick={() => onCheckout(plan.id)}
                          disabled={loading !== null}
                          className={cn(
                            "w-full py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]",
                            plan.color === 'emerald'
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                              : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/25"
                          )}
                        >
                          {loading === plan.id ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processando...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <plan.icon className="w-5 h-5" />
                              <span>Assinar {plan.name}</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {plans.map((plan, index) => (
              <button
                key={plan.id}
                onClick={() => scrollTo(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  selectedIndex === index 
                    ? plan.color === 'emerald' ? "bg-primary scale-125" : "bg-violet-500 scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ver plano ${plan.name}`}
              />
            ))}
          </div>

          {/* Plan indicator text with swipe hint on mobile */}
          <div className="text-center mt-3">
            <p className="text-sm text-muted-foreground">
              Plano {plans[selectedIndex]?.name}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 md:hidden">
              ← Deslize para ver outros planos →
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 hidden md:block">
              Clique nas setas ou nos pontos para navegar
            </p>
          </div>
        </div>

        {/* Already Subscriber Button - More Visible */}
        <div className="text-center mt-8">
          <div className="inline-flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Já possui uma conta?</p>
            <Button
              variant="outline"
              size="lg"
              onClick={onLogin}
              className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary font-semibold px-8"
            >
              <Check className="w-4 h-4 mr-2" />
              Já sou assinante - Entrar
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span>Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
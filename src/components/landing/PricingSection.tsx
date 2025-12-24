import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2, ChevronLeft, ChevronRight, ChevronDown, X, BarChart3, Calendar, FileText, Bell, Download, History, Eye, BookOpen, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

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

// All features - shown in both plans (with strikethrough for Basic exclusives)
const allBenefits: Benefit[] = [
  { text: "1 Plano Individual", icon: User, includedInBasic: true },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedInBasic: true },
  { text: "Dashboard com seu progresso", icon: BarChart3, includedInBasic: true },
  { text: "Consulta visual do plano", icon: Eye, includedInBasic: true },
  { text: "Dados seguros na nuvem", icon: Shield, includedInBasic: true },
  { text: "Exportação em PDF", icon: Download, includedInBasic: true },
  { text: "Visão por períodos de vida", icon: Calendar, includedInBasic: true },
  { text: "Histórico de metas concluídas", icon: History, includedInBasic: true },
  { text: "1 Plano Familiar", icon: Users, includedInBasic: false, highlight: true },
  { text: "3 Planos para Filhos", icon: Baby, includedInBasic: false, highlight: true },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedInBasic: false, highlight: true },
  { text: "Lembretes por email", icon: Bell, includedInBasic: false },
];

const plans = [
  {
    id: 'basic' as const,
    name: 'Basic',
    subtitle: 'Para Começar',
    price: 'R$ 9,99',
    description: '1 plano individual',
    icon: Gem,
    benefits: allBenefits,
    color: 'emerald',
    recommended: false,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    subtitle: 'Para Toda Família',
    price: 'R$ 29,99',
    description: '4 planos incluídos',
    icon: Crown,
    benefits: allBenefits,
    color: 'violet',
    recommended: true,
  },
];

// Smooth spring animation for cards
const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.92,
    rotateY: direction > 0 ? 8 : -8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      mass: 1,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.92,
    rotateY: direction < 0 ? 8 : -8,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 35,
    },
  }),
};

// Staggered benefit animations with spring physics
const benefitVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      delay: 0.1 + i * 0.04,
    },
  }),
  exit: { 
    opacity: 0, 
    x: 15, 
    scale: 0.96,
    transition: { 
      type: "spring" as const,
      stiffness: 500,
      damping: 30,
    }
  },
};

const benefitsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

// Tooltip descriptions for each benefit
const benefitTooltips: Record<string, string> = {
  "1 Plano Individual": "Crie metas para todas as 7 áreas da sua vida pessoal",
  "Planejamento das 7 áreas da vida": "Espiritual, Intelectual, Familiar, Social, Financeiro, Profissional e Saúde",
  "Dashboard com seu progresso": "Visualize gráficos e métricas do seu avanço em tempo real",
  "Consulta visual do plano": "Veja seu plano completo em formato de tabela interativa",
  "Dados seguros na nuvem": "Seus dados criptografados e acessíveis de qualquer dispositivo",
  "Exportação em PDF": "Baixe seu plano em formato profissional para impressão",
  "Visão por períodos de vida": "Organize suas metas por fases: 1, 5, 10+ anos",
  "Guia de uso do sistema": "Tutorial completo para aproveitar todos os recursos",
  "1 Plano Familiar": "Planeje o futuro da família em conjunto com seu parceiro(a)",
  "3 Planos para Filhos": "Crie planos individuais para cada filho acompanhar suas metas",
  "Resumo inteligente com IA": "Análise do seu progresso com sugestões personalizadas de melhoria",
  "Dashboard com gráficos detalhados": "Relatórios visuais avançados do seu progresso",
  "Relatórios e balanço de progresso": "Análise aprofundada por área e período de vida",
  "Exportação profissional em PDF": "Design premium para compartilhar ou imprimir",
  "Lembretes por email": "Receba notificações das metas importantes no seu email",
  "Histórico de metas concluídas": "Acompanhe todas as conquistas que você já realizou",
};

const PricingSection = ({ onCheckout, onLogin, loading }: PricingSectionProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showAllDescriptions, setShowAllDescriptions] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      setDirection(-1);
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      setDirection(1);
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      setDirection(index > selectedIndex ? 1 : -1);
      emblaApi.scrollTo(index);
    }
  }, [emblaApi, selectedIndex]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    if (newIndex !== selectedIndex) {
      setDirection(newIndex > selectedIndex ? 1 : -1);
    }
    setSelectedIndex(newIndex);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi, selectedIndex]);

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

  const currentPlan = plans[selectedIndex];

  return (
    <section id="pricing" className="py-12 md:py-16 px-4 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Escolha seu plano</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Invista no seu{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Futuro
            </span>
          </h2>
          
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Comece sua jornada de transformação
          </p>
        </motion.div>

        {/* Side by Side Plans */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group"
            >
              {/* Glow effect on hover */}
              <motion.div 
                className={cn(
                  "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                  plan.color === 'emerald' ? "bg-primary/20" : "bg-violet-500/20"
                )}
              />
              
              {/* Recommended Badge */}
              {plan.recommended && (
                <motion.div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                  initial={{ scale: 0, y: 10 }}
                  whileInView={{ scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white font-medium text-xs shadow-lg shadow-violet-500/30">
                    <Crown className="w-3 h-3" />
                    <span>Mais Popular</span>
                  </div>
                </motion.div>
              )}
              
              <Card className={cn(
                "relative overflow-hidden border-2 bg-card shadow-lg transition-all duration-300",
                plan.color === 'emerald' 
                  ? "border-primary/20 hover:border-primary/50 hover:shadow-primary/10"
                  : "border-violet-500/30 hover:border-violet-500/60 hover:shadow-violet-500/15",
                plan.recommended && "pt-2"
              )}>
                {/* Animated gradient background */}
                <motion.div 
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    plan.color === 'emerald'
                      ? "bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5"
                      : "bg-gradient-to-br from-violet-500/8 via-transparent to-purple-500/8"
                  )}
                />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={false}
                  animate={{
                    background: [
                      "linear-gradient(90deg, transparent 0%, transparent 100%)",
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                      "linear-gradient(90deg, transparent 0%, transparent 100%)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <CardHeader className="pt-6 pb-3 text-center relative">
                  {/* Plan Icon with animation */}
                  <motion.div 
                    className={cn(
                      "inline-flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3",
                      plan.color === 'emerald'
                        ? "bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary"
                        : "bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-500"
                    )}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <plan.icon className="w-6 h-6" />
                  </motion.div>
                  
                  <CardTitle className={cn(
                    "text-lg font-bold mb-1",
                    plan.color === 'emerald'
                      ? "text-foreground"
                      : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                  )}>
                    {plan.name}
                  </CardTitle>
                  
                  <p className="text-xs text-muted-foreground mb-3">{plan.subtitle}</p>
                  
                  {/* Price */}
                  <motion.div 
                    className="flex items-baseline justify-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={cn(
                      "text-3xl font-bold",
                      plan.color === 'emerald'
                        ? "text-foreground"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                    )}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative space-y-3 pb-6 px-4">
                  {/* All benefits - show all features with proper styling */}
                  <div className="space-y-2">
                    {plan.benefits.map((benefit, i) => {
                      const isIncluded = plan.id === 'premium' || benefit.includedInBasic;
                      const isPremiumExclusive = !benefit.includedInBasic;
                      
                      return (
                        <motion.div 
                          key={i}
                          className="flex items-center gap-2 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + i * 0.03 }}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                            isIncluded
                              ? plan.color === 'emerald' 
                                ? "bg-primary/20 text-primary" 
                                : isPremiumExclusive
                                  ? "bg-violet-500/30 text-violet-400"
                                  : "bg-violet-500/20 text-violet-500"
                              : "bg-muted/50 text-muted-foreground/30"
                          )}>
                            {isIncluded ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            isIncluded 
                              ? isPremiumExclusive && plan.id === 'premium'
                                ? "text-foreground font-medium"
                                : "text-foreground"
                              : "text-muted-foreground/50 line-through decoration-muted-foreground/30"
                          )}>
                            {benefit.text}
                          </span>
                          {isPremiumExclusive && plan.id === 'premium' && benefit.highlight && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium">
                              IA
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => onCheckout(plan.id)}
                      disabled={loading === plan.id}
                      className={cn(
                        "w-full font-semibold py-5 mt-4 transition-all duration-300",
                        plan.color === 'emerald'
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
                          : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                      )}
                    >
                      {loading === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Começar Agora
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          className="max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-4">
            <button
              onClick={() => setShowAllDescriptions(!showAllDescriptions)}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Info className="w-4 h-4" />
              {showAllDescriptions ? "Ocultar comparação" : "Ver comparação detalhada"}
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-300",
                showAllDescriptions && "rotate-180"
              )} />
            </button>
          </div>

          <AnimatePresence>
            {showAllDescriptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-3 bg-muted/50 border-b border-border/60">
                    <div className="p-3 text-sm font-medium text-muted-foreground">Recurso</div>
                    <div className="p-3 text-sm font-medium text-center text-primary">Basic</div>
                    <div className="p-3 text-sm font-medium text-center text-violet-500">Premium</div>
                  </div>
                  
                  {/* Rows */}
                  {[
                    { name: "Plano Individual", basic: true, premium: true },
                    { name: "Plano Familiar", basic: false, premium: true },
                    { name: "Planos para Filhos", basic: "—", premium: "3 planos" },
                    { name: "7 Áreas da Vida", basic: true, premium: true },
                    { name: "Dashboard", basic: true, premium: true },
                    { name: "Exportação PDF", basic: true, premium: true },
                    { name: "Resumo com IA", basic: false, premium: true },
                    { name: "Lembretes por Email", basic: false, premium: true },
                  ].map((row, i) => (
                    <motion.div
                      key={row.name}
                      className="grid grid-cols-3 border-b border-border/30 last:border-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="p-3 text-sm text-foreground">{row.name}</div>
                      <div className="p-3 text-center">
                        {typeof row.basic === 'boolean' ? (
                          row.basic ? (
                            <Check className="w-4 h-4 text-primary mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.basic}</span>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        {typeof row.premium === 'boolean' ? (
                          row.premium ? (
                            <Check className="w-4 h-4 text-violet-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs text-violet-500 font-medium">{row.premium}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Already Subscriber & Trust Badges */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={onLogin}
            className="text-primary hover:text-primary/80 hover:bg-primary/5"
          >
            <Check className="w-4 h-4 mr-2" />
            Já sou assinante - Entrar
          </Button>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-primary" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
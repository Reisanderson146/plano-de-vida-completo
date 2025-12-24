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

// Benefits for Basic plan
const basicBenefits: Benefit[] = [
  { text: "1 Plano Individual", icon: User, includedInBasic: true },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedInBasic: true },
  { text: "Dashboard com seu progresso", icon: BarChart3, includedInBasic: true },
  { text: "Consulta visual do plano", icon: Eye, includedInBasic: true },
  { text: "Dados seguros na nuvem", icon: Shield, includedInBasic: true },
  { text: "Exportação em PDF", icon: Download, includedInBasic: true },
  { text: "Visão por períodos de vida", icon: Calendar, includedInBasic: true },
  { text: "Histórico de metas concluídas", icon: History, includedInBasic: true },
  { text: "1 Plano Familiar", icon: Users, includedInBasic: false },
  { text: "3 Planos para Filhos", icon: Baby, includedInBasic: false },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedInBasic: false, highlight: true },
  { text: "Lembretes por email", icon: Bell, includedInBasic: false },
];

// Benefits for Premium plan - NO individual plan, only Family + Kids
const premiumBenefits: Benefit[] = [
  { text: "1 Plano Familiar", icon: Users, includedInBasic: false, highlight: true },
  { text: "3 Planos para Filhos", icon: Baby, includedInBasic: false, highlight: true },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedInBasic: false, highlight: true },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedInBasic: true },
  { text: "Dashboard com gráficos detalhados", icon: BarChart3, includedInBasic: true },
  { text: "Consulta visual do plano", icon: Eye, includedInBasic: true },
  { text: "Dados seguros na nuvem", icon: Shield, includedInBasic: true },
  { text: "Exportação profissional em PDF", icon: Download, includedInBasic: true },
  { text: "Visão por períodos de vida", icon: Calendar, includedInBasic: true },
  { text: "Histórico de metas concluídas", icon: History, includedInBasic: true },
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
    benefits: basicBenefits,
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
    benefits: premiumBenefits,
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showAllDescriptions, setShowAllDescriptions] = useState(false);

  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < plans.length - 1;

  const scrollPrev = useCallback(() => {
    if (canScrollPrev) {
      setDirection(-1);
      setSelectedIndex(prev => prev - 1);
    }
  }, [canScrollPrev]);

  const scrollNext = useCallback(() => {
    if (canScrollNext) {
      setDirection(1);
      setSelectedIndex(prev => prev + 1);
    }
  }, [canScrollNext]);

  const scrollTo = useCallback((index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  }, [selectedIndex]);

  const currentPlan = plans[selectedIndex];

  // Animation variants for card transitions
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 15 : -15,
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
        mass: 0.8,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 15 : -15,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 35,
      },
    }),
  };

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

        {/* Carousel Plans with Animation */}
        <div className="mb-8 max-w-md mx-auto relative">
          {/* Navigation Buttons */}
          <motion.button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Anterior"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Próximo"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Animated Card Container */}
          <div className="overflow-hidden px-14 md:px-0 min-h-[580px] relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={selectedIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                <div className="relative group pt-4">
                  {/* Animated Glow effect */}
                  <motion.div 
                    className={cn(
                      "absolute -inset-2 rounded-2xl blur-xl",
                      currentPlan.color === 'emerald' ? "bg-primary/20" : "bg-violet-500/25"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  />
                  
                  {/* Recommended Badge */}
                  {currentPlan.recommended && (
                    <motion.div 
                      className="absolute -top-0 left-1/2 -translate-x-1/2 z-10"
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    >
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white font-medium text-xs shadow-lg shadow-violet-500/30">
                        <Crown className="w-3 h-3" />
                        <span>Mais Popular</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <Card className={cn(
                    "relative overflow-hidden border-2 bg-card shadow-xl",
                    currentPlan.color === 'emerald' 
                      ? "border-primary/30 shadow-primary/10"
                      : "border-violet-500/40 shadow-violet-500/15",
                    currentPlan.recommended && "mt-2"
                  )}>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                    />

                    <CardHeader className="pt-6 pb-3 text-center relative">
                      <motion.div 
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-14 rounded-xl mx-auto mb-3",
                          currentPlan.color === 'emerald'
                            ? "bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary"
                            : "bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-500"
                        )}
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <currentPlan.icon className="w-7 h-7" />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <CardTitle className={cn(
                          "text-xl font-bold mb-1",
                          currentPlan.color === 'emerald'
                            ? "text-foreground"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                        )}>
                          {currentPlan.name}
                        </CardTitle>
                        
                        <p className="text-sm text-muted-foreground mb-4">{currentPlan.subtitle}</p>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-baseline justify-center gap-1"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <span className={cn(
                          "text-4xl font-bold",
                          currentPlan.color === 'emerald'
                            ? "text-foreground"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                        )}>
                          {currentPlan.price}
                        </span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </motion.div>
                    </CardHeader>

                    <CardContent className="space-y-2 pb-6 px-5">
                      {currentPlan.benefits.map((benefit, i) => {
                        const isIncluded = currentPlan.id === 'premium' || benefit.includedInBasic;
                        const isPremiumExclusive = !benefit.includedInBasic;
                        
                        return (
                          <motion.div 
                            key={i} 
                            className="flex items-center gap-2 text-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.04 }}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                              isIncluded
                                ? currentPlan.color === 'emerald' 
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
                                ? isPremiumExclusive && currentPlan.id === 'premium'
                                  ? "text-foreground font-medium"
                                  : "text-foreground"
                                : "text-muted-foreground/50 line-through decoration-muted-foreground/30"
                            )}>
                              {benefit.text}
                            </span>
                            {isPremiumExclusive && currentPlan.id === 'premium' && benefit.highlight && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium">
                                IA
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button
                          onClick={() => onCheckout(currentPlan.id)}
                          disabled={loading === currentPlan.id}
                          className={cn(
                            "w-full font-semibold py-6 mt-4 text-base",
                            currentPlan.color === 'emerald'
                              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                              : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                          )}
                        >
                          {loading === currentPlan.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Começar Agora
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-6">
            {plans.map((plan, index) => (
              <motion.button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  selectedIndex === index 
                    ? "bg-primary w-8 h-3" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-3 h-3"
                )}
                aria-label={`Ir para plano ${plan.name}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Swipe hint on mobile */}
          <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
            Use as setas para comparar os planos
          </p>
        </div>

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
            variant="outline"
            onClick={onLogin}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 py-5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/20"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
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
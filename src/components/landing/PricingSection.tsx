import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2, ChevronLeft, ChevronRight, ChevronDown, X, BarChart3, Calendar, FileText, Bell, Download, History, Eye, BookOpen, Info, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

// Countdown hook for urgency timer
const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    // Set end time to midnight of current day (resets daily)
    const getEndTime = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    };
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = getEndTime();
      const difference = endTime - now;
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return timeLeft;
};

interface PricingSectionProps {
  onCheckout: (tier: 'basic' | 'premium') => void;
  onLogin: () => void;
  onSignup: () => void;
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
    subtitle: 'Para Você',
    price: 'R$ 9,99',
    description: '1 plano individual',
    icon: Gem,
    benefits: basicBenefits,
    color: 'emerald',
    recommended: false,
    tagline: 'Organize sua vida pessoal',
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    subtitle: 'Para a Família',
    price: 'R$ 29,99',
    description: '4 planos incluídos',
    icon: Crown,
    benefits: premiumBenefits,
    color: 'violet',
    recommended: true,
    tagline: 'Planejamento completo para todos',
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

const PricingSection = ({ onCheckout, onLogin, onSignup, loading }: PricingSectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showAllDescriptions, setShowAllDescriptions] = useState(false);
  const countdown = useCountdown();

  const scrollPrev = useCallback(() => {
    setDirection(-1);
    setSelectedIndex(prev => prev === 0 ? plans.length - 1 : prev - 1);
  }, []);

  const scrollNext = useCallback(() => {
    setDirection(1);
    setSelectedIndex(prev => prev === plans.length - 1 ? 0 : prev + 1);
  }, []);

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
          {/* Animated Card Container with Swipe Support */}
          <div className="overflow-hidden min-h-[580px] relative touch-pan-y">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={selectedIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 50;
                  const velocityThreshold = 200;
                  
                  if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
                    // Swiped left - go to next (loop)
                    setDirection(1);
                    setSelectedIndex(prev => prev === plans.length - 1 ? 0 : prev + 1);
                  } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                    // Swiped right - go to previous (loop)
                    setDirection(-1);
                    setSelectedIndex(prev => prev === 0 ? plans.length - 1 : prev - 1);
                  }
                }}
                className="w-full cursor-grab active:cursor-grabbing"
              >
                <div className="relative group pt-6">
                  {/* Enhanced Glow effect with animation */}
                  <motion.div 
                    className={cn(
                      "absolute -inset-3 rounded-3xl blur-2xl",
                      currentPlan.color === 'emerald' 
                        ? "bg-gradient-to-br from-primary/30 via-emerald-500/20 to-teal-500/30" 
                        : "bg-gradient-to-br from-violet-500/40 via-purple-500/30 to-fuchsia-500/40"
                    )}
                    animate={currentPlan.recommended ? {
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.02, 1],
                    } : { opacity: 0.6 }}
                    transition={currentPlan.recommended ? {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                  />
                  
                  {/* Recommended Badge - Enhanced */}
                  {currentPlan.recommended && (
                    <motion.div 
                      className="absolute -top-1 left-1/2 -translate-x-1/2 z-10"
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                    >
                      <div className="relative">
                        {/* Badge glow */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-md"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="relative flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full text-white font-bold text-xs shadow-xl shadow-violet-500/40 border border-white/20">
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          >
                            <Crown className="w-4 h-4" />
                          </motion.div>
                          <span>Mais Popular</span>
                          <Sparkles className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <Card className={cn(
                    "relative overflow-hidden border-2 bg-card shadow-2xl",
                    currentPlan.color === 'emerald' 
                      ? "border-primary/40 shadow-primary/15"
                      : "border-violet-500/50 shadow-violet-500/20",
                    currentPlan.recommended && "mt-3"
                  )}>
                    {/* Decorative corner elements */}
                    <div className={cn(
                      "absolute top-0 right-0 w-32 h-32 opacity-10",
                      currentPlan.color === 'emerald'
                        ? "bg-gradient-to-bl from-primary to-transparent"
                        : "bg-gradient-to-bl from-violet-500 to-transparent"
                    )} />
                    <div className={cn(
                      "absolute bottom-0 left-0 w-24 h-24 opacity-10",
                      currentPlan.color === 'emerald'
                        ? "bg-gradient-to-tr from-emerald-500 to-transparent"
                        : "bg-gradient-to-tr from-purple-500 to-transparent"
                    )} />

                    {/* Animated shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                      initial={{ x: "-200%" }}
                      animate={{ x: "200%" }}
                      transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
                    />

                    <CardHeader className="pt-8 pb-4 text-center relative">
                      {/* Icon with enhanced styling */}
                      <motion.div 
                        className={cn(
                          "inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4 relative",
                          currentPlan.color === 'emerald'
                            ? "bg-gradient-to-br from-primary/20 via-emerald-500/15 to-teal-500/20 text-primary border border-primary/20"
                            : "bg-gradient-to-br from-violet-500/25 via-purple-500/20 to-fuchsia-500/25 text-violet-500 border border-violet-500/30"
                        )}
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        {/* Icon inner glow */}
                        <motion.div
                          className={cn(
                            "absolute inset-0 rounded-2xl blur-sm",
                            currentPlan.color === 'emerald' ? "bg-primary/20" : "bg-violet-500/30"
                          )}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <currentPlan.icon className="w-8 h-8 relative z-10" />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <CardTitle className={cn(
                          "text-2xl font-bold mb-1",
                          currentPlan.color === 'emerald'
                            ? "text-foreground"
                            : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
                        )}>
                          {currentPlan.name}
                        </CardTitle>
                        
                        <p className="text-sm text-muted-foreground mb-1">{currentPlan.subtitle}</p>
                        
                        {/* Tagline */}
                        <p className={cn(
                          "text-xs font-medium mb-3",
                          currentPlan.color === 'emerald' ? "text-primary/80" : "text-violet-500/80"
                        )}>
                          {currentPlan.tagline}
                        </p>
                        
                        {/* Trial Badge with Countdown - Clean Design */}
                        <motion.div
                          className="flex flex-col items-center gap-2 mb-4"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.35, type: "spring" }}
                        >
                          {/* Main badge */}
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold",
                            currentPlan.color === 'emerald'
                              ? "bg-primary text-primary-foreground"
                              : "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                          )}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>7 DIAS GRÁTIS</span>
                          </div>
                          
                          {/* Countdown - Subtle and elegant */}
                          <div className={cn(
                            "flex items-center gap-1.5 text-[11px]",
                            currentPlan.color === 'emerald' ? "text-primary/70" : "text-violet-500/70"
                          )}>
                            <Clock className="w-3 h-3" />
                            <span>Expira em</span>
                            <div className="flex items-center gap-0.5 font-mono font-semibold">
                              <span className={cn(
                                "tabular-nums",
                                currentPlan.color === 'emerald' ? "text-primary" : "text-violet-500"
                              )}>
                                {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                      
                      {/* Price - Enhanced */}
                      <motion.div 
                        className="flex items-baseline justify-center gap-1"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <span className={cn(
                          "text-5xl font-extrabold tracking-tight",
                          currentPlan.color === 'emerald'
                            ? "text-foreground"
                            : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
                        )}>
                          {currentPlan.price}
                        </span>
                        <span className="text-muted-foreground text-sm font-medium">/mês</span>
                      </motion.div>
                      
                      <p className={cn(
                        "text-xs mt-2 font-medium",
                        currentPlan.color === 'emerald' ? "text-emerald-600/80" : "text-violet-600/80"
                      )}>
                        Teste grátis, cancele quando quiser
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-2.5 pb-6 px-5">
                      {/* Benefits divider */}
                      <div className={cn(
                        "h-px w-full mb-4",
                        currentPlan.color === 'emerald'
                          ? "bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                          : "bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
                      )} />
                      
                      {currentPlan.benefits.map((benefit, i) => {
                        const isIncluded = currentPlan.id === 'premium' || benefit.includedInBasic;
                        const isPremiumExclusive = !benefit.includedInBasic;
                        
                        return (
                          <motion.div 
                            key={i} 
                            className={cn(
                              "flex items-center gap-2.5 text-sm py-1 px-2 rounded-lg transition-colors",
                              isIncluded && isPremiumExclusive && currentPlan.id === 'premium' && "bg-violet-500/5"
                            )}
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
                                    ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30 text-violet-400"
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
                              <motion.span 
                                className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 font-bold border border-violet-500/20"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                ✨ IA
                              </motion.span>
                            )}
                          </motion.div>
                        );
                      })}
                      
                      {/* CTA Button - Enhanced */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="pt-4"
                      >
                        <Button
                          onClick={() => onCheckout(currentPlan.id)}
                          disabled={loading === currentPlan.id}
                          className={cn(
                            "w-full font-bold py-6 text-base relative overflow-hidden group",
                            currentPlan.color === 'emerald'
                              ? "bg-gradient-to-r from-primary via-emerald-600 to-teal-600 hover:from-primary/90 hover:via-emerald-600/90 hover:to-teal-600/90 text-primary-foreground shadow-lg shadow-primary/25"
                              : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/30"
                          )}
                        >
                          {/* Button shimmer */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            initial={{ x: "-200%" }}
                            whileHover={{ x: "200%" }}
                            transition={{ duration: 0.6 }}
                          />
                          
                          {loading === currentPlan.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <Zap className="w-5 h-5" />
                              Começar 7 dias grátis
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
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

        {/* Trust Badges */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
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
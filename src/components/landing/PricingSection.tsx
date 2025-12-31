import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2, ChevronLeft, ChevronRight, ChevronDown, X, BarChart3, Calendar, FileText, Bell, Download, History, Eye, BookOpen, Info, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// Countdown hook for urgency timer
const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
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
  onCheckout: (tier: 'basic' | 'familiar' | 'premium') => void;
  onLogin: () => void;
  onSignup: () => void;
  loading: 'basic' | 'familiar' | 'premium' | null;
}

interface Benefit {
  text: string;
  icon: LucideIcon;
  includedIn: ('basic' | 'familiar' | 'premium')[];
  highlight?: boolean;
}

// All benefits with which plans include them
const allBenefits: Benefit[] = [
  { text: "1 Plano Individual", icon: User, includedIn: ['basic'] },
  { text: "1 Plano Familiar", icon: Users, includedIn: ['familiar', 'premium'], highlight: true },
  { text: "1 Plano para Filho", icon: Baby, includedIn: ['familiar'], highlight: true },
  { text: "3 Planos para Filhos", icon: Baby, includedIn: ['premium'], highlight: true },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedIn: ['familiar', 'premium'], highlight: true },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Dashboard com seu progresso", icon: BarChart3, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Consulta visual do plano", icon: Eye, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Dados seguros na nuvem", icon: Shield, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Exportação em PDF", icon: Download, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Visão por períodos de vida", icon: Calendar, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Histórico de metas concluídas", icon: History, includedIn: ['basic', 'familiar', 'premium'] },
  { text: "Notificações personalizadas", icon: Bell, includedIn: ['familiar', 'premium'] },
];

const plans = [
  {
    id: 'basic' as const,
    name: 'Basic',
    subtitle: 'Para Você',
    price: 'R$ 9,99',
    description: '1 plano individual',
    icon: Gem,
    color: 'emerald',
    recommended: false,
    tagline: 'Organize sua vida pessoal',
    badge: 'Essencial',
  },
  {
    id: 'familiar' as const,
    name: 'Familiar',
    subtitle: 'Para o Casal',
    price: 'R$ 15,90',
    description: '2 planos incluídos',
    icon: Heart,
    color: 'rose',
    recommended: false,
    tagline: 'Planeje junto com seu cônjuge',
    badge: 'Popular',
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    subtitle: 'Para a Família',
    price: 'R$ 29,99',
    description: '4 planos incluídos + IA',
    icon: Crown,
    color: 'violet',
    recommended: true,
    tagline: 'Para você e toda a família',
    badge: 'Completo',
  },
];

// Tooltip descriptions for each benefit
const benefitTooltips: Record<string, string> = {
  "1 Plano Individual": "Crie metas para todas as 7 áreas da sua vida pessoal",
  "Planejamento das 7 áreas da vida": "Espiritual, Intelectual, Familiar, Social, Financeiro, Profissional e Saúde",
  "Dashboard com seu progresso": "Visualize gráficos e métricas do seu avanço em tempo real",
  "Consulta visual do plano": "Veja seu plano completo em formato de tabela interativa",
  "Dados seguros na nuvem": "Seus dados criptografados e acessíveis de qualquer dispositivo",
  "Exportação em PDF": "Baixe seu plano em formato profissional para impressão",
  "Visão por períodos de vida": "Organize suas metas por fases: 1, 5, 10+ anos",
  "1 Plano Familiar": "Planeje o futuro da família em conjunto com seu parceiro(a)",
  "1 Plano para Filho": "Crie um plano individual para seu filho acompanhar suas metas",
  "3 Planos para Filhos": "Crie planos individuais para cada filho acompanhar suas metas",
  "Resumo inteligente com IA": "Análise do seu progresso com sugestões personalizadas de melhoria",
  "Lembretes por email": "Receba notificações das metas importantes no seu email",
  "Histórico de metas concluídas": "Acompanhe todas as conquistas que você já realizou",
  "Email de aniversário de casamento": "Receba mensagens especiais no aniversário de casamento",
};

const getColorClasses = (color: string) => {
  switch (color) {
    case 'emerald':
      return {
        glow: "bg-gradient-to-br from-primary/30 via-emerald-500/20 to-teal-500/30",
        border: "border-primary/40 shadow-primary/15",
        icon: "bg-gradient-to-br from-primary/20 via-emerald-500/15 to-teal-500/20 text-primary border border-primary/20",
        iconGlow: "bg-primary/20",
        title: "text-foreground",
        badge: "bg-primary text-primary-foreground",
        button: "bg-gradient-to-r from-primary via-emerald-600 to-teal-600 hover:from-primary/90 hover:via-emerald-600/90 hover:to-teal-600/90 text-primary-foreground shadow-lg shadow-primary/25",
        check: "bg-primary/20 text-primary",
        highlight: "text-primary/80",
      };
    case 'rose':
      return {
        glow: "bg-gradient-to-br from-rose-500/30 via-pink-500/20 to-red-500/30",
        border: "border-rose-500/40 shadow-rose-500/15",
        icon: "bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-red-500/20 text-rose-500 border border-rose-500/20",
        iconGlow: "bg-rose-500/20",
        title: "bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-clip-text text-transparent",
        badge: "bg-gradient-to-r from-rose-500 to-pink-500 text-white",
        button: "bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 hover:from-rose-600 hover:via-pink-600 hover:to-red-600 text-white shadow-lg shadow-rose-500/25",
        check: "bg-rose-500/20 text-rose-500",
        highlight: "text-rose-500/80",
      };
    case 'violet':
      return {
        glow: "bg-gradient-to-br from-violet-500/40 via-purple-500/30 to-fuchsia-500/40",
        border: "border-violet-500/50 shadow-violet-500/20",
        icon: "bg-gradient-to-br from-violet-500/25 via-purple-500/20 to-fuchsia-500/25 text-violet-500 border border-violet-500/30",
        iconGlow: "bg-violet-500/30",
        title: "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent",
        badge: "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
        button: "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/30",
        check: "bg-violet-500/20 text-violet-500",
        highlight: "text-violet-500/80",
      };
    default:
      return {
        glow: "bg-gradient-to-br from-primary/30 via-emerald-500/20 to-teal-500/30",
        border: "border-primary/40 shadow-primary/15",
        icon: "bg-gradient-to-br from-primary/20 via-emerald-500/15 to-teal-500/20 text-primary border border-primary/20",
        iconGlow: "bg-primary/20",
        title: "text-foreground",
        badge: "bg-primary text-primary-foreground",
        button: "bg-gradient-to-r from-primary via-emerald-600 to-teal-600 hover:from-primary/90 hover:via-emerald-600/90 hover:to-teal-600/90 text-primary-foreground shadow-lg shadow-primary/25",
        check: "bg-primary/20 text-primary",
        highlight: "text-primary/80",
      };
  }
};

const PricingSection = ({ onCheckout, onLogin, onSignup, loading }: PricingSectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState(1); // Start with Familiar
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
  const colorClasses = getColorClasses(currentPlan.color);

  // Filter benefits for current plan
  const planBenefits = allBenefits.filter(b => b.includedIn.includes(currentPlan.id));

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
          <div className="overflow-hidden min-h-[540px] md:min-h-[620px] relative touch-pan-y">
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
                    setDirection(1);
                    setSelectedIndex(prev => prev === plans.length - 1 ? 0 : prev + 1);
                  } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                    setDirection(-1);
                    setSelectedIndex(prev => prev === 0 ? plans.length - 1 : prev - 1);
                  }
                }}
                className="w-full cursor-grab active:cursor-grabbing"
              >
                <div className="relative group pt-6">
                  {/* Enhanced Glow effect with animation */}
                  <motion.div 
                    className={cn("absolute -inset-3 rounded-3xl blur-2xl", colorClasses.glow)}
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
                  
                  {/* Plan Badge - Above Card */}
                  <motion.div 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 z-10"
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                  >
                    <div className="relative">
                      {currentPlan.recommended && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-md"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div className={cn(
                        "relative flex items-center gap-1.5 px-5 py-2 rounded-full text-white font-bold text-xs shadow-xl border border-white/20",
                        currentPlan.color === 'emerald' && "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/40",
                        currentPlan.color === 'rose' && "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/40",
                        currentPlan.color === 'violet' && "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-violet-500/40"
                      )}>
                        {currentPlan.recommended && (
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          >
                            <Crown className="w-4 h-4" />
                          </motion.div>
                        )}
                        {!currentPlan.recommended && currentPlan.color === 'emerald' && <Gem className="w-4 h-4" />}
                        {!currentPlan.recommended && currentPlan.color === 'rose' && <Heart className="w-4 h-4" />}
                        <span>{currentPlan.badge}</span>
                        {currentPlan.recommended && <Sparkles className="w-3 h-3" />}
                      </div>
                    </div>
                  </motion.div>
                  
                  <Card className={cn(
                    "relative overflow-hidden border-2 bg-card shadow-2xl",
                    colorClasses.border,
                    currentPlan.recommended && "mt-3"
                  )}>
                    {/* Decorative corner elements */}
                    <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10", colorClasses.glow)} />
                    <div className={cn("absolute bottom-0 left-0 w-24 h-24 opacity-10", colorClasses.glow)} />

                    {/* Animated shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                      initial={{ x: "-200%" }}
                      animate={{ x: "200%" }}
                      transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
                    />

                    <CardHeader className="pt-6 md:pt-8 pb-3 md:pb-4 text-center relative px-4 md:px-6">
                      {/* Icon with enhanced styling */}
                      <motion.div 
                        className={cn("inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl mx-auto mb-3 md:mb-4 relative", colorClasses.icon)}
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <motion.div
                          className={cn("absolute inset-0 rounded-xl blur-sm", colorClasses.iconGlow)}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <currentPlan.icon className="w-7 h-7 md:w-8 md:h-8 relative z-10" />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <CardTitle className={cn("text-xl md:text-2xl font-bold mb-0.5 md:mb-1", colorClasses.title)}>
                          {currentPlan.name}
                        </CardTitle>
                        
                        <p className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">{currentPlan.subtitle}</p>
                        
                        <p className={cn("text-[11px] md:text-xs font-medium mb-2 md:mb-3", colorClasses.highlight)}>
                          {currentPlan.tagline}
                        </p>
                        
                        {/* Trial Badge with Countdown */}
                        <motion.div
                          className="flex flex-col items-center gap-1.5 mb-3"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.35, type: "spring" }}
                        >
                          <div className={cn("inline-flex items-center gap-1.5 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold", colorClasses.badge)}>
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                            <span>7 DIAS GRÁTIS</span>
                          </div>
                          
                          <div className={cn("flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs", colorClasses.highlight)}>
                            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span>Expira em</span>
                            <span className="font-mono font-semibold tabular-nums">
                              {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m {String(countdown.seconds).padStart(2, '0')}s
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                      
                      {/* Price */}
                      <motion.div 
                        className="flex items-baseline justify-center gap-1"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <span className={cn("text-4xl md:text-5xl font-extrabold tracking-tight", colorClasses.title)}>
                          {currentPlan.price}
                        </span>
                        <span className="text-muted-foreground text-xs md:text-sm font-medium">/mês</span>
                      </motion.div>
                      
                      <p className={cn("text-[10px] md:text-xs mt-1 md:mt-2 font-medium", colorClasses.highlight)}>
                        Teste grátis, cancele quando quiser
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-1.5 md:space-y-2 pb-5 md:pb-6 px-4 md:px-6 min-h-[280px] md:min-h-[320px] flex flex-col">
                      {/* Benefits divider */}
                      <div className={cn(
                        "h-px w-full mb-3",
                        "bg-gradient-to-r from-transparent via-border to-transparent"
                      )} />
                      
                      {planBenefits.map((benefit, i) => (
                        <motion.div 
                          key={i} 
                          className={cn(
                            "flex items-center gap-2 md:gap-2.5 text-xs md:text-sm py-0.5 md:py-1 px-1.5 md:px-2 rounded-md transition-colors",
                            benefit.highlight && "bg-muted/50"
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.04 }}
                        >
                          <div className={cn("w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0", colorClasses.check)}>
                            <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          </div>
                          <span className={cn("text-xs md:text-sm text-foreground leading-tight", benefit.highlight && "font-medium")}>
                            {benefit.text}
                          </span>
                          {benefit.highlight && currentPlan.id === 'premium' && benefit.text.includes('IA') && (
                            <motion.span 
                              className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-500 font-bold border border-violet-500/20"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              ✨ IA
                            </motion.span>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* CTA Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="pt-3 md:pt-4 mt-auto"
                      >
                        <Button
                          onClick={() => onCheckout(currentPlan.id)}
                          disabled={loading === currentPlan.id}
                          className={cn("w-full font-bold py-5 md:py-6 text-sm md:text-base relative overflow-hidden group", colorClasses.button)}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            initial={{ x: "-200%" }}
                            whileHover={{ x: "200%" }}
                            transition={{ duration: 0.6 }}
                          />
                          
                          {loading === currentPlan.id ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                          ) : (
                            <span className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2">
                              <Zap className="w-4 h-4 md:w-5 md:h-5" />
                              Começar 7 dias grátis
                              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
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
            Deslize para comparar os planos
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
                  <div className="grid grid-cols-4 bg-muted/50 border-b border-border/60">
                    <div className="p-3 text-sm font-medium text-muted-foreground">Recurso</div>
                    <div className="p-3 text-sm font-medium text-center text-primary">Basic</div>
                    <div className="p-3 text-sm font-medium text-center text-rose-500">Familiar</div>
                    <div className="p-3 text-sm font-medium text-center text-violet-500">Premium</div>
                  </div>
                  
                  {/* Rows */}
                  {[
                    { name: "Plano Individual", basic: true, familiar: true, premium: true },
                    { name: "Plano Familiar", basic: false, familiar: true, premium: true },
                    { name: "Planos para Filhos", basic: "—", familiar: "—", premium: "2 planos" },
                    { name: "7 Áreas da Vida", basic: true, familiar: true, premium: true },
                    { name: "Dashboard", basic: true, familiar: true, premium: true },
                    { name: "Exportação PDF", basic: true, familiar: true, premium: true },
                    { name: "Resumo com IA", basic: false, familiar: false, premium: true },
                    { name: "Lembretes por Email", basic: false, familiar: true, premium: true },
                    { name: "Email Aniversário", basic: false, familiar: true, premium: true },
                  ].map((row, i) => (
                    <motion.div
                      key={row.name}
                      className="grid grid-cols-4 border-b border-border/30 last:border-0"
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
                        {typeof row.familiar === 'boolean' ? (
                          row.familiar ? (
                            <Check className="w-4 h-4 text-rose-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.familiar}</span>
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

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";

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

// Benefits for Premium plan
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

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.9,
    rotateY: direction > 0 ? 10 : -10,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.9,
    rotateY: direction < 0 ? 10 : -10,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const benefitVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
  exit: { 
    opacity: 0, 
    x: 20, 
    scale: 0.95,
    transition: { duration: 0.2 }
  },
};

const benefitsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
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
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          animate={{
            background: selectedIndex === 0 
              ? "radial-gradient(circle, rgba(42, 140, 104, 0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
          }}
          transition={{ duration: 0.5 }}
        />
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
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-md mx-auto px-12 md:px-16" style={{ perspective: "1000px" }}>
          {/* Navigation Arrows */}
          <motion.button
            onClick={scrollPrev}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border shadow-lg",
              "flex items-center justify-center",
              !canScrollPrev && "opacity-30 cursor-not-allowed"
            )}
            disabled={!canScrollPrev}
            aria-label="Plano anterior"
            whileHover={canScrollPrev ? { scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" } : {}}
            whileTap={canScrollPrev ? { scale: 0.95 } : {}}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </motion.button>
          
          <motion.button
            onClick={scrollNext}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-border shadow-lg",
              "flex items-center justify-center",
              !canScrollNext && "opacity-30 cursor-not-allowed"
            )}
            disabled={!canScrollNext}
            aria-label="Próximo plano"
            whileHover={canScrollNext ? { scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" } : {}}
            whileTap={canScrollNext ? { scale: 0.95 } : {}}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </motion.button>

          {/* Animated Card Display */}
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={selectedIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full relative"
              >
                {/* Recommended Badge - positioned above the card */}
                {currentPlan.recommended && (
                  <motion.div 
                    className="flex justify-center mb-3"
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white font-medium text-sm shadow-lg shadow-violet-500/30">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Recomendado</span>
                    </div>
                  </motion.div>
                )}
                <Card className={cn(
                  "relative overflow-hidden border-2 bg-card/80 backdrop-blur-sm shadow-xl",
                  currentPlan.color === 'emerald' 
                    ? "border-primary/30 shadow-emerald-500/10"
                    : "border-violet-500/40 shadow-violet-500/20"
                )}>
                  {/* Animated Glow Effect */}
                  <motion.div 
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: currentPlan.color === 'emerald'
                        ? "linear-gradient(135deg, rgba(42, 140, 104, 0.08) 0%, transparent 50%, rgba(16, 185, 129, 0.08) 100%)"
                        : "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, transparent 50%, rgba(168, 85, 247, 0.12) 100%)"
                    }}
                  />
                  

                  <CardHeader className="pt-8 pb-4 text-center relative">
                    {/* Badge */}
                    <motion.div 
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-semibold mx-auto mb-4",
                        currentPlan.color === 'emerald'
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-600 dark:text-violet-400"
                      )}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <currentPlan.icon className="w-4 h-4" />
                      <span>{currentPlan.name}</span>
                    </motion.div>
                    
                    <CardTitle className={cn(
                      "text-xl font-bold mb-4",
                      currentPlan.color === 'emerald'
                        ? "text-foreground"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                    )}>
                      {currentPlan.subtitle}
                    </CardTitle>
                    
                    {/* Price with animation */}
                    <motion.div 
                      className="flex items-baseline justify-center gap-1"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                    >
                      <span className={cn(
                        "text-4xl font-bold",
                        currentPlan.color === 'emerald'
                          ? "text-foreground"
                          : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                      )}>
                        {currentPlan.price}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                    </motion.div>
                    
                    {currentPlan.color === 'emerald' ? (
                      <p className="text-xs text-muted-foreground mt-2">{currentPlan.description}</p>
                    ) : (
                      <motion.div 
                        className="mt-2 inline-flex items-center gap-1 bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Zap className="w-3 h-3" />
                        {currentPlan.description}
                      </motion.div>
                    )}
                  </CardHeader>

                  <CardContent className="relative space-y-6 pb-8">
                    {/* Benefits List with staggered animation */}
                    <motion.ul 
                      className="space-y-3"
                      key={`benefits-${selectedIndex}`}
                      variants={benefitsContainerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {currentPlan.benefits.map((benefit, benefitIndex) => {
                        const isIncluded = currentPlan.id === 'basic' ? benefit.includedInBasic : true;
                        
                        return (
                          <motion.li 
                            key={`${currentPlan.id}-${benefitIndex}`}
                            custom={benefitIndex}
                            variants={benefitVariants}
                            whileHover={isIncluded ? { 
                              x: 6, 
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            } : {}}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-200",
                              benefit.highlight && currentPlan.id === 'premium' 
                                ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                                : isIncluded 
                                  ? "cursor-pointer hover:bg-muted/50" 
                                  : "opacity-60"
                            )}
                          >
                            <motion.div 
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200",
                                !isIncluded 
                                  ? "bg-muted/50"
                                  : benefit.highlight && currentPlan.id === 'premium'
                                    ? "bg-gradient-to-br from-violet-500 to-purple-600"
                                    : currentPlan.color === 'emerald'
                                      ? "bg-emerald-500/10"
                                      : "bg-violet-500/10"
                              )}
                              whileHover={isIncluded ? { scale: 1.15, rotate: 5 } : {}}
                            >
                              {isIncluded ? (
                                <benefit.icon className={cn(
                                  "w-3.5 h-3.5",
                                  benefit.highlight && currentPlan.id === 'premium'
                                    ? "text-white"
                                    : currentPlan.color === 'emerald'
                                      ? "text-emerald-600"
                                      : "text-violet-600"
                                )} />
                              ) : (
                                <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                              )}
                            </motion.div>
                            <span className={cn(
                              "text-sm flex-1",
                              !isIncluded 
                                ? "text-muted-foreground/50 line-through"
                                : benefit.highlight ? "font-semibold text-foreground" : "text-foreground"
                            )}>
                              {benefit.text}
                            </span>
                            {benefit.highlight && currentPlan.id === 'premium' && (
                              <motion.span 
                                className="text-[10px] bg-violet-500/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + benefitIndex * 0.05, type: "spring" }}
                              >
                                Exclusivo
                              </motion.span>
                            )}
                          </motion.li>
                        );
                      })}
                    </motion.ul>

                    {/* CTA Button */}
                    <motion.div 
                      className="pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        size="lg"
                        onClick={() => onCheckout(currentPlan.id)}
                        disabled={loading !== null}
                        className={cn(
                          "w-full py-6 text-lg font-semibold shadow-lg transition-all duration-300",
                          currentPlan.color === 'emerald'
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/25"
                        )}
                      >
                        {loading === currentPlan.id ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processando...</span>
                          </div>
                        ) : (
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <currentPlan.icon className="w-5 h-5" />
                            <span>Assinar {currentPlan.name}</span>
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hidden Embla container for swipe detection */}
          <div className="absolute inset-0 z-10 opacity-0 pointer-events-none" ref={emblaRef}>
            <div className="flex h-full touch-pan-y">
              {plans.map((plan) => (
                <div key={plan.id} className="flex-[0_0_100%] min-w-0" />
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {plans.map((plan, index) => (
              <motion.button
                key={plan.id}
                onClick={() => scrollTo(index)}
                className={cn(
                  "rounded-full transition-colors duration-300",
                  selectedIndex === index 
                    ? plan.color === 'emerald' ? "bg-primary" : "bg-violet-500"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                animate={{
                  width: selectedIndex === index ? 24 : 12,
                  height: 12,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                aria-label={`Ver plano ${plan.name}`}
              />
            ))}
          </div>

          {/* Plan indicator text with swipe hint on mobile */}
          <div className="text-center mt-3">
            <motion.p 
              className="text-sm font-medium text-foreground"
              key={selectedIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Plano {plans[selectedIndex]?.name}
            </motion.p>
            <p className="text-xs text-muted-foreground/70 mt-1 md:hidden">
              ← Deslize para ver outros planos →
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 hidden md:block">
              Clique nas setas ou nos pontos para navegar
            </p>
          </div>
        </div>

        {/* Already Subscriber Button */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
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
        </motion.div>

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
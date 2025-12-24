import { useState, useCallback, useEffect } from "react";
import { FileText, Target, BarChart3, Brain, FileDown, Cloud, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Crie seu Plano de Vida",
    description: "Organize suas metas nas 7 áreas da vida com um sistema intuitivo e visual. Importe planos existentes em Excel ou PDF.",
    highlight: "Importação inteligente",
    color: "from-blue-500 to-cyan-500",
    bgColor: "rgba(59, 130, 246, 0.15)",
  },
  {
    icon: Target,
    title: "Acompanhe suas Metas",
    description: "Marque metas como realizadas, acompanhe o progresso de cada área e celebre cada conquista com animações motivacionais.",
    highlight: "Celebração de conquistas",
    color: "from-emerald-500 to-green-500",
    bgColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: BarChart3,
    title: "Painel Completo",
    description: "Visualize seu progresso em gráficos interativos. Veja quais áreas estão bem e quais precisam de mais atenção.",
    highlight: "Gráficos interativos",
    color: "from-violet-500 to-purple-500",
    bgColor: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: Brain,
    title: "Resumo Inteligente com IA",
    description: "Nossa inteligência artificial analisa seu progresso e gera resumos personalizados com insights valiosos sobre sua jornada.",
    highlight: "Powered by IA",
    color: "from-amber-500 to-orange-500",
    bgColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: FileDown,
    title: "Exportação em PDF",
    description: "Exporte seu plano de vida completo em PDF profissional, perfeito para imprimir, compartilhar ou guardar como registro.",
    highlight: "Design premium",
    color: "from-rose-500 to-pink-500",
    bgColor: "rgba(244, 63, 94, 0.15)",
  },
  {
    icon: Cloud,
    title: "Dados na Nuvem",
    description: "Seus planos e metas ficam seguros na nuvem. Acesse de qualquer dispositivo, a qualquer momento.",
    highlight: "100% seguro",
    color: "from-slate-500 to-gray-600",
    bgColor: "rgba(100, 116, 139, 0.15)",
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

const FeaturesSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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

  const currentFeature = features[selectedIndex];

  return (
    <section id="features" className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          animate={{
            background: `radial-gradient(circle, ${currentFeature?.bgColor || 'rgba(42, 140, 104, 0.15)'} 0%, transparent 70%)`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Funcionalidades{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Poderosas
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para planejar, acompanhar e alcançar suas metas de vida.
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative max-w-sm mx-auto" style={{ perspective: "1000px" }}>
          {/* Navigation Arrows */}
          <motion.button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center"
            aria-label="Funcionalidade anterior"
            whileHover={{ scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          
          <motion.button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center"
            aria-label="Próxima funcionalidade"
            whileHover={{ scale: 1.1, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
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
                className="w-full"
              >
                <div className="group relative">
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${currentFeature.color} rounded-2xl`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative bg-card border border-border/50 rounded-2xl p-6 h-full">
                    {/* Icon with animation */}
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center mb-4`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    >
                      <currentFeature.icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Content with staggered animation */}
                    <motion.h3 
                      className="text-xl font-semibold text-foreground mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      {currentFeature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground text-sm leading-relaxed mb-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentFeature.description}
                    </motion.p>

                    {/* Highlight Badge */}
                    <motion.div 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25, type: "spring" }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{currentFeature.highlight}</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hidden Embla container for swipe detection */}
          <div className="absolute inset-0 z-10 opacity-0 pointer-events-none" ref={emblaRef}>
            <div className="flex h-full touch-pan-y">
              {features.map((_, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0" />
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "rounded-full transition-colors duration-300",
                  selectedIndex === index 
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                animate={{
                  width: selectedIndex === index ? 24 : 10,
                  height: 10,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                aria-label={`Ver ${feature.title}`}
              />
            ))}
          </div>

          {/* Feature indicator */}
          <div className="text-center mt-3">
            <motion.p 
              className="text-sm font-medium text-foreground"
              key={selectedIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentFeature?.title}
            </motion.p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              ← Deslize para ver mais →
            </p>
          </div>
        </div>

        {/* Desktop Grid with hover animations */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <motion.div 
                className="relative bg-card border border-border/50 rounded-2xl p-6 h-full hover:border-primary/30 transition-colors duration-300"
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 }
                }}
              >
                {/* Icon */}
                <motion.div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>

                {/* Highlight Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
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
        <div className="md:hidden relative max-w-sm mx-auto px-4" style={{ perspective: "1000px" }}>
          {/* Swipe-enabled Card Display */}
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {features.map((feature, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-2">
                  <div className="group relative h-[280px]">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-10`} />
                    <div className="relative bg-card border border-border/50 rounded-2xl p-6 h-full flex flex-col">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 flex-shrink-0`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                        {feature.description}
                      </p>

                      {/* Highlight Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{feature.highlight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  selectedIndex === index 
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5"
                )}
                aria-label={`Ver ${feature.title}`}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Deslize para ver mais funcionalidades
          </p>
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
import { BookOpen } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

const versiculos = [
  {
    texto: "Um dia faz declaração a outro dia, e uma noite mostra sabedoria a outra noite.",
    referencia: "Salmo 19:2",
  },
  {
    texto: "O coração do homem pode traçar o seu caminho, mas o Senhor lhe dirige os passos.",
    referencia: "Provérbios 16:9",
  },
  {
    texto: "Instruiremos e ensinaremos a ti o caminho que deves seguir; guiar-te-emos com os nossos olhos.",
    referencia: "Salmo 32:8",
  },
  {
    texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    referencia: "Jeremias 29:11",
  },
];

const VersiculosSection = () => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
  }, [autoplayPlugin.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
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

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Sabedoria Bíblica</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Versículos que{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Inspiram
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Palavra de Deus é a base para uma vida de propósito e sabedoria.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Embla Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
              {versiculos.map((versiculo, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 px-4"
                >
                  <div className="group relative h-[200px] md:h-[180px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <blockquote className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-center">
                      <div className="absolute top-4 left-4 text-5xl md:text-6xl text-primary/10 font-serif">"</div>
                      <p className="text-foreground italic leading-relaxed mb-4 relative z-10 pt-2 text-base md:text-lg text-center line-clamp-4">
                        {versiculo.texto}
                      </p>
                      <footer className="flex items-center justify-center gap-2">
                        <div className="w-6 md:w-8 h-0.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full" />
                        <span className="text-primary font-semibold text-xs md:text-sm">{versiculo.referencia}</span>
                        <div className="w-6 md:w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-primary rounded-full" />
                      </footer>
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {versiculos.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  selectedIndex === index 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir para versículo ${index + 1}`}
              />
            ))}
          </div>

          {/* Swipe hint on mobile */}
          <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
            Deslize para ver mais versículos
          </p>
        </div>
      </div>
    </section>
  );
};

export default VersiculosSection;
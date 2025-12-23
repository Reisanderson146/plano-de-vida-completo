import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Scale,
  Target,
  Lightbulb,
  Sparkles,
  Rocket,
  Trophy,
  Heart,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { isSoundEnabled, getSoundVolume } from '@/hooks/useSoundSettings';

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  tips?: string[];
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Plano de Vida!',
    subtitle: 'Sua jornada de transformação começa agora',
    description: 'Você está prestes a descobrir uma ferramenta poderosa para organizar, planejar e conquistar todos os seus objetivos de vida.',
    icon: Rocket,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    accentColor: 'violet',
    tips: ['Planeje com clareza', 'Acompanhe seu progresso', 'Celebre suas conquistas']
  },
  {
    id: 'dashboard',
    title: 'Painel de Controle',
    subtitle: 'Sua central de comando',
    description: 'Visualize todo o seu progresso de forma clara e intuitiva. Gráficos, estatísticas e insights para você saber exatamente onde está e para onde vai.',
    icon: LayoutDashboard,
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    accentColor: 'blue',
    tips: ['Veja seu progresso geral', 'Acompanhe metas pendentes', 'Mantenha sua sequência']
  },
  {
    id: 'plans',
    title: 'Planos de Vida',
    subtitle: 'Organize seus sonhos',
    description: 'Crie planos personalizados para você, seu casal ou sua família. Cada plano é único e adaptado às suas necessidades específicas.',
    icon: FileText,
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    accentColor: 'emerald',
    tips: ['Individual, Casal ou Família', 'Organize por períodos', 'Personalize suas áreas']
  },
  {
    id: 'goals',
    title: 'Metas nas 7 Áreas',
    subtitle: 'Equilíbrio em todas as dimensões',
    description: 'Defina metas nas 7 áreas essenciais da vida: Espiritual, Intelectual, Física, Familiar, Social, Profissional e Financeira.',
    icon: Target,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accentColor: 'orange',
    tips: ['Espiritual & Intelectual', 'Física & Familiar', 'Social, Profissional & Financeira']
  },
  {
    id: 'reports',
    title: 'Relatórios Detalhados',
    subtitle: 'Dados que inspiram ação',
    description: 'Analise seu progresso com gráficos interativos e relatórios completos. Compare períodos e identifique oportunidades de melhoria.',
    icon: BarChart3,
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    accentColor: 'rose',
    tips: ['Gráficos de evolução', 'Comparativos por período', 'Exportação em PDF']
  },
  {
    id: 'balance',
    title: 'Balanço & Reflexão',
    subtitle: 'Insights com inteligência artificial',
    description: 'Faça pausas para refletir sobre sua jornada. Use o resumo de IA para obter insights personalizados e orientações para os próximos passos.',
    icon: Scale,
    gradient: 'from-indigo-500 via-blue-500 to-violet-500',
    accentColor: 'indigo',
    tips: ['Resumo com IA', 'Anotações pessoais', 'Reflexões periódicas']
  },
  {
    id: 'start',
    title: 'Pronto para Começar?',
    subtitle: 'O primeiro passo é o mais importante',
    description: 'Sua transformação começa agora! Crie seu primeiro plano de vida e comece a definir suas metas. Cada pequeno passo conta.',
    icon: Trophy,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accentColor: 'amber',
    tips: ['Crie seu primeiro plano', 'Defina suas metas', 'Celebre cada vitória!']
  }
];

interface InteractiveTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function InteractiveTour({ onComplete, isOpen }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const { user } = useAuth();

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    
    if (currentStep < tourSteps.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleComplete();
    }
  }, [currentStep, isAnimating]);

  const handlePrevious = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    
    setDirection('prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 300);
  }, [currentStep, isAnimating]);

  // Play celebration sound
  const playCelebrationSound = () => {
    if (!isSoundEnabled()) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const volume = getSoundVolume();
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(volume * 0.4, audioContext.currentTime);

      // Grand celebration fanfare
      const fanfareNotes = [
        { freq: 523.25, time: 0, duration: 0.15 },
        { freq: 659.25, time: 0.1, duration: 0.15 },
        { freq: 783.99, time: 0.2, duration: 0.15 },
        { freq: 1046.50, time: 0.3, duration: 0.3 },
        { freq: 1318.51, time: 0.5, duration: 0.4 },
      ];

      fanfareNotes.forEach(({ freq, time, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + time);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + time + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
        
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + duration + 0.05);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Fire celebration confetti
  const fireCelebrationConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from left
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
        disableForReducedMotion: true,
      });

      // Confetti from right
      confetti({
        particleCount: Math.floor(particleCount),
        startVelocity: 30,
        spread: 60,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
        disableForReducedMotion: true,
      });
    }, 250);
  };

  const handleComplete = () => {
    if (user?.id) {
      localStorage.setItem(`tour_completed_${user.id}`, 'true');
    }
    
    // Fire celebration effects
    fireCelebrationConfetti();
    playCelebrationSound();
    
    onComplete();
  };

  const handleSkip = () => {
    if (user?.id) {
      localStorage.setItem(`tour_completed_${user.id}`, 'true');
    }
    onComplete();
  };

  const goToStep = (index: number) => {
    if (isAnimating || index === currentStep) return;
    setDirection(index > currentStep ? 'next' : 'prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'Escape') handleSkip();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrevious]);

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Animated backdrop with gradient */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={handleSkip}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-2 h-2 rounded-full opacity-20",
              `bg-gradient-to-r ${step.gradient}`
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Tour Container */}
      <div 
        className={cn(
          "relative z-10 w-full max-w-3xl transition-all duration-300",
          isAnimating && direction === 'next' && "opacity-0 translate-x-8",
          isAnimating && direction === 'prev' && "opacity-0 -translate-x-8"
        )}
      >
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute -top-2 -right-2 md:top-4 md:right-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg z-20 hover:bg-background"
          onClick={handleSkip}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Card with gradient border */}
        <div className={cn(
          "relative rounded-3xl p-[2px] shadow-2xl",
          `bg-gradient-to-br ${step.gradient}`
        )}>
          <div className="bg-background rounded-[22px] overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-muted">
              <div 
                className={cn(
                  "h-full transition-all duration-500 ease-out rounded-full",
                  `bg-gradient-to-r ${step.gradient}`
                )}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-10">
              {/* Header with Icon */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8">
                {/* Large animated icon */}
                <div className={cn(
                  "relative flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center",
                  `bg-gradient-to-br ${step.gradient}`
                )}>
                  <StepIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                  
                  {/* Pulsing ring effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-3xl animate-ping opacity-20",
                    `bg-gradient-to-br ${step.gradient}`
                  )} style={{ animationDuration: '2s' }} />
                  
                  {/* Sparkle decorations */}
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                  <Zap className="absolute -bottom-1 -left-1 w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Title and subtitle */}
                <div className="text-center md:text-left flex-1">
                  <p className={cn(
                    "text-sm font-semibold uppercase tracking-wider mb-2",
                    `bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`
                  )}>
                    {step.subtitle}
                  </p>
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                    {step.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Passo {currentStep + 1} de {tourSteps.length}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 text-center md:text-left">
                {step.description}
              </p>

              {/* Tips section */}
              {step.tips && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                  {step.tips.map((tip, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border bg-muted/30 transition-all hover:scale-[1.02]",
                        "hover:shadow-md"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        `bg-gradient-to-br ${step.gradient}`
                      )}>
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step indicators */}
              <div className="flex justify-center gap-2 mb-8">
                {tourSteps.map((s, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300 hover:opacity-80",
                      index === currentStep 
                        ? `w-10 bg-gradient-to-r ${step.gradient}` 
                        : index < currentStep 
                          ? 'w-2.5 bg-primary/60' 
                          : 'w-2.5 bg-muted-foreground/30'
                    )}
                    aria-label={`Ir para passo ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground order-3 sm:order-1"
                >
                  Pular tour
                </Button>
                
                <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="gap-2 flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className={cn(
                      "gap-2 flex-1 sm:flex-initial text-white shadow-lg transition-all hover:scale-105",
                      `bg-gradient-to-r ${step.gradient} hover:opacity-90`
                    )}
                  >
                    {isLastStep ? (
                      <>
                        <Rocket className="w-5 h-5" />
                        Começar Agora!
                      </>
                    ) : (
                      <>
                        Próximo
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard hints for desktop */}
        <div className="hidden md:flex justify-center mt-4 gap-4 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded text-[10px]">←</kbd>
            <kbd className="px-2 py-1 bg-muted rounded text-[10px]">→</kbd>
            Navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded text-[10px]">Enter</kbd>
            Avançar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted rounded text-[10px]">Esc</kbd>
            Fechar
          </span>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>,
    document.body
  );
}

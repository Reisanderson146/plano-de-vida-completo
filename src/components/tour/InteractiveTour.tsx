import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  position?: 'center' | 'top' | 'bottom';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Plano de Vida! 🎉',
    description: 'Este é o seu sistema completo para planejar e acompanhar seus objetivos de vida. Vamos fazer um tour rápido pelas principais funcionalidades!',
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Aqui você tem uma visão geral do seu progresso em todas as áreas da vida. Veja quantas metas você já completou e acompanhe sua evolução ao longo do tempo.',
    icon: LayoutDashboard,
    position: 'center'
  },
  {
    id: 'plans',
    title: 'Planos de Vida',
    description: 'Crie e gerencie seus planos de vida. Você pode ter planos individuais, para casais ou família. Defina metas para cada área da vida e organize por períodos.',
    icon: FileText,
    position: 'center'
  },
  {
    id: 'goals',
    title: 'Metas e Objetivos',
    description: 'Dentro de cada plano, cadastre suas metas nas 7 áreas: Espiritual, Intelectual, Física, Familiar, Social, Profissional e Financeira. Use metas SMART para melhores resultados!',
    icon: Target,
    position: 'center'
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Acompanhe seu progresso com relatórios detalhados. Veja gráficos de evolução, compare períodos e identifique quais áreas precisam de mais atenção.',
    icon: BarChart3,
    position: 'center'
  },
  {
    id: 'balance',
    title: 'Balanço',
    description: 'Faça uma reflexão periódica sobre seu progresso. Use o resumo de IA para obter insights personalizados e mantenha anotações sobre sua jornada.',
    icon: Scale,
    position: 'center'
  },
  {
    id: 'tips',
    title: 'Dicas para Começar',
    description: '1. Crie seu primeiro plano de vida\n2. Defina metas para cada área\n3. Revise semanalmente seu progresso\n4. Use lembretes para não esquecer\n5. Celebre cada conquista!',
    icon: Lightbulb,
    position: 'center'
  }
];

interface InteractiveTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function InteractiveTour({ onComplete, isOpen }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (user?.id) {
      localStorage.setItem(`tour_completed_${user.id}`, 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Tour Card */}
      <Card className="relative z-10 w-[90vw] max-w-md mx-4 shadow-2xl border-primary/20 animate-scale-in">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardHeader className="pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <StepIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Passo {currentStep + 1} de {tourSteps.length}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {step.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-2 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Pular tour
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === tourSteps.length - 1 ? 'Começar!' : 'Próximo'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardFooter>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {tourSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-primary w-4' 
                  : index < currentStep 
                    ? 'bg-primary/50' 
                    : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>,
    document.body
  );
}

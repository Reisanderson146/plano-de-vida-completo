import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Brain, Heart, Users, DollarSign, Briefcase, Cross, Check, Sparkles, TrendingUp, AlertTriangle, FileText, X, BarChart3, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const demoSlides = [
  { id: 'welcome', title: 'Bem-vindo', subtitle: 'Conheça o Plano de Vida', component: WelcomeDemo },
  { id: 'cadastro', title: 'Crie seu Plano', subtitle: 'Configure em minutos', component: CadastroDemo },
  { id: 'plano', title: 'Suas Metas', subtitle: 'Acompanhe o progresso', component: PlanoDemo },
  { id: 'dashboard', title: 'Dashboard', subtitle: 'Visão geral completa', component: DashboardDemo },
  { id: 'balanco', title: 'Balanço + IA', subtitle: 'Insights inteligentes', component: BalancoDemo },
  { id: 'relatorios', title: 'Relatórios', subtitle: 'Gráficos detalhados', component: RelatoriosDemo },
];

function WelcomeDemo() {
  const areas = [
    { icon: Cross, name: 'Espiritual', color: 'bg-purple-500' },
    { icon: Brain, name: 'Intelectual', color: 'bg-blue-500' },
    { icon: Heart, name: 'Familiar', color: 'bg-pink-500' },
    { icon: Users, name: 'Social', color: 'bg-orange-500' },
    { icon: DollarSign, name: 'Financeiro', color: 'bg-green-500' },
    { icon: Briefcase, name: 'Profissional', color: 'bg-indigo-500' },
    { icon: Dumbbell, name: 'Saúde', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col justify-center">
      <div className="text-center mb-2">
        <h3 className="text-sm font-bold text-gray-800 mb-1">7 Áreas da Vida</h3>
        <p className="text-[10px] text-gray-500">Planeje cada aspecto importante</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {areas.slice(0, 4).map((area, i) => (
          <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${area.color} flex items-center justify-center mb-1`}>
              <area.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[8px] text-gray-600 text-center font-medium">{area.name}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {areas.slice(4).map((area, i) => (
          <div key={i} className="flex flex-col items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${area.color} flex items-center justify-center mb-1`}>
              <area.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[8px] text-gray-600 text-center font-medium">{area.name}</span>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-lg p-3 text-center mt-2">
        <p className="text-[10px] text-[#2A8C68] font-medium">
          ✨ Organize sua vida de forma completa
        </p>
      </div>
    </div>
  );
}

function CadastroDemo() {
  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Target, label: 'Individual', active: true },
          { icon: Heart, label: 'Familiar', active: false },
          { icon: Users, label: 'Filho(a)', active: false }
        ].map((type, i) => (
          <div key={i} className={`p-2 rounded-lg border text-center transition-all ${type.active ? 'border-[#2A8C68] bg-[#A8E6CE]/20 scale-105 shadow-sm' : 'border-gray-200'}`}>
            <type.icon className={`w-4 h-4 mx-auto mb-1 ${type.active ? 'text-[#2A8C68]' : 'text-gray-400'}`} />
            <span className={`text-[9px] font-medium ${type.active ? 'text-[#2A8C68]' : 'text-gray-500'}`}>{type.label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 flex-1">
        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
          <span className="text-[8px] text-gray-500 uppercase tracking-wide">Nome do Plano</span>
          <p className="text-[11px] font-semibold text-gray-800">Meu Plano 2025</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
          <span className="text-[8px] text-gray-500 uppercase tracking-wide">Lema</span>
          <p className="text-[10px] text-gray-700 italic">"Constância que constrói propósito"</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Ano Inicial', value: '2025' },
          { label: 'Sua Idade', value: '32' },
          { label: 'Duração', value: '5 anos' }
        ].map((item, i) => (
          <div key={i} className="bg-gradient-to-br from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-lg p-2.5 text-center border border-[#A8E6CE]/30">
            <span className="text-[7px] text-gray-500 uppercase">{item.label}</span>
            <p className="text-sm font-bold text-[#2A8C68]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanoDemo() {
  const areas = [
    { icon: Cross, name: 'Espiritual', color: 'bg-purple-500', progress: 75 },
    { icon: Brain, name: 'Intelectual', color: 'bg-blue-500', progress: 100 },
    { icon: Heart, name: 'Familiar', color: 'bg-pink-500', progress: 50 },
    { icon: Users, name: 'Social', color: 'bg-orange-500', progress: 66 },
  ];

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center gap-2 bg-gradient-to-r from-[#A8E6CE]/20 to-transparent rounded-lg p-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">JP</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-xs">Meu Plano 2025</h3>
          <p className="text-[9px] text-gray-500">15 de 19 metas realizadas</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-[#2A8C68]">78%</span>
        </div>
      </div>
      
      <div className="bg-[#A8E6CE]/20 rounded-lg p-2.5 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#2A8C68]" />
        <Progress value={78} className="h-2.5 flex-1" />
        <span className="text-[10px] font-bold text-[#2A8C68]">15/19</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 flex-1">
        {areas.map((area, i) => (
          <div key={i} className="rounded-xl p-2.5 bg-gray-50 border border-gray-100 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-6 h-6 rounded-lg ${area.color} flex items-center justify-center`}>
                <area.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[9px] font-medium text-gray-700 flex-1">{area.name}</span>
              <span className={`text-[10px] font-bold ${area.progress === 100 ? 'text-green-600' : 'text-gray-600'}`}>
                {area.progress}%
              </span>
            </div>
            <Progress value={area.progress} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardDemo() {
  const areas = [
    { name: 'Espiritual', color: '#8b5cf6', value: 85 },
    { name: 'Intelectual', color: '#3b82f6', value: 90 },
    { name: 'Familiar', color: '#ec4899', value: 70 },
    { name: 'Social', color: '#f97316', value: 60 },
  ];

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Total', value: '21', color: 'text-gray-700' },
          { label: 'Feitas', value: '16', color: 'text-[#2A8C68]' },
          { label: 'Boas', value: '5', color: 'text-blue-600' },
          { label: 'Atenção', value: '2', color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
            <span className="text-[7px] text-gray-500 uppercase">{stat.label}</span>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center flex-1 border border-gray-100">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 90,35 90,75 50,95 10,75 10,35" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="50,25 75,40 75,70 50,82 25,70 25,40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="50,40 60,47 60,63 50,70 40,63 40,47" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="50,18 82,38 78,72 50,88 22,72 18,38" fill="#A8E6CE" fillOpacity="0.5" stroke="#2A8C68" strokeWidth="2" />
          </svg>
        </div>
        <div className="ml-4 space-y-1">
          {areas.map((area, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
              <span className="text-[9px] text-gray-600">{area.name}</span>
              <span className="text-[8px] font-bold text-gray-700">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-xl p-2.5 border border-[#A8E6CE]/30">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#2A8C68" strokeWidth="4" strokeDasharray="125.7" strokeDashoffset="30" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#2A8C68]">76%</span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#2A8C68]">Excelente progresso!</p>
          <p className="text-[9px] text-gray-500">16 de 21 metas realizadas</p>
        </div>
      </div>
    </div>
  );
}

function BalancoDemo() {
  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* AI Summary highlight */}
      <div className="bg-gradient-to-br from-[#2A8C68]/10 via-[#A8E6CE]/20 to-[#7BC8A4]/10 rounded-xl p-3 border border-[#7BC8A4]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#A8E6CE]/20 rounded-full blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-bold text-[#2A8C68]">Resumo com IA</span>
            <Sparkles className="w-3.5 h-3.5 text-[#7BC8A4] ml-auto" />
          </div>
          <p className="text-[9px] text-gray-700 leading-relaxed">
            <span className="text-green-600 font-semibold">✓ Pontos fortes:</span> Espiritual e Intelectual em ótimo progresso.
          </p>
          <p className="text-[9px] text-gray-700 leading-relaxed mt-1">
            <span className="text-orange-600 font-semibold">⚠ Melhorar:</span> Social e Saúde precisam de atenção.
          </p>
        </div>
      </div>
      
      {/* Areas needing attention */}
      <div className="bg-orange-50 rounded-xl p-2.5 border border-orange-100 flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[9px] font-semibold text-orange-700">Precisam de Atenção</span>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Social', color: '#f97316', value: 45 },
            { name: 'Saúde', color: '#ef4444', value: 50 },
          ].map((area, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/80 rounded-lg p-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
              <span className="text-[9px] text-gray-700 flex-1">{area.name}</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${area.value}%`, backgroundColor: area.color }} />
              </div>
              <span className="text-[8px] font-bold text-gray-600 w-7">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 h-8 text-[9px] rounded-lg border-gray-200">
          <FileText className="w-3.5 h-3.5 mr-1" />
          Exportar PDF
        </Button>
        <Button size="sm" className="flex-1 h-8 text-[9px] bg-[#2A8C68] hover:bg-[#238058] rounded-lg">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Gerar Resumo
        </Button>
      </div>
    </div>
  );
}

function RelatoriosDemo() {
  const areas = [
    { name: 'Espiritual', value: 85, color: '#8b5cf6' },
    { name: 'Intelectual', value: 90, color: '#3b82f6' },
    { name: 'Familiar', value: 70, color: '#ec4899' },
    { name: 'Social', value: 55, color: '#f97316' },
    { name: 'Financeiro', value: 75, color: '#10b981' },
  ];

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Total', value: '21', icon: Target },
          { label: 'Feitas', value: '16', icon: Check },
          { label: 'Melhor', value: 'Intel.', icon: TrendingUp },
          { label: 'Focar', value: 'Social', icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
            <stat.icon className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#2A8C68]" />
            <p className="text-[10px] font-bold text-gray-800">{stat.value}</p>
            <span className="text-[7px] text-gray-500 uppercase">{stat.label}</span>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-xl p-3 flex-1 border border-gray-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-semibold text-gray-700">Progresso por Área</span>
          <span className="text-[8px] text-[#2A8C68] bg-[#A8E6CE]/30 px-2 py-0.5 rounded-full font-medium">2025</span>
        </div>
        <div className="space-y-2">
          {areas.map((area, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[8px] text-gray-600 w-14 truncate">{area.name}</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${area.value}%`, backgroundColor: area.color }} 
                />
              </div>
              <span className="text-[8px] font-bold text-gray-700 w-7">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 bg-[#A8E6CE]/20 rounded-lg p-2">
        <BarChart3 className="w-4 h-4 text-[#2A8C68]" />
        <span className="text-[9px] text-[#2A8C68] font-medium">Relatórios completos disponíveis</span>
      </div>
    </div>
  );
}

interface DemoCarouselProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DemoCarousel({ open, onOpenChange }: DemoCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    if (!open || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setSlideDirection('right');
      setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open, isAutoPlaying]);

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setIsAutoPlaying(true);
    }
  }, [open]);

  const goToSlide = (index: number) => {
    setSlideDirection(index > currentSlide ? 'right' : 'left');
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setSlideDirection('right');
    setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setSlideDirection('left');
    setCurrentSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length);
    setIsAutoPlaying(false);
  };

  const CurrentComponent = demoSlides[currentSlide].component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-[92vw] p-0 gap-0 border-0 bg-transparent shadow-none overflow-hidden [&>button]:hidden">
        <div className="relative bg-gradient-to-br from-[#1a5c42] via-[#2A8C68] to-[#1a5c42] rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
          {/* Glow effects */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#A8E6CE]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-[#7BC8A4]/20 rounded-full blur-2xl" />
          
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header */}
          <div className="px-5 pt-5 pb-3 text-center relative">
            <h2 className="text-lg font-bold text-white">{demoSlides[currentSlide].title}</h2>
            <p className="text-white/70 text-xs">{demoSlides[currentSlide].subtitle}</p>
          </div>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-1.5 pb-3">
            {demoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/30 w-1.5 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Content - Fixed height */}
          <div className="px-4 pb-3 overflow-hidden">
            <div 
              key={currentSlide}
              className="bg-white rounded-2xl p-4 shadow-xl min-h-[320px] flex flex-col"
              style={{
                animation: `${slideDirection === 'right' ? 'slideInRight' : 'slideInLeft'} 0.35s ease-out`
              }}
            >
              <CurrentComponent />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-white/60 text-xs font-medium">
              {currentSlide + 1} / {demoSlides.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Skip Button */}
          <div className="px-4 pb-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-medium"
            >
              Pular demonstração
            </Button>
          </div>
        </div>

        <style>{`
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
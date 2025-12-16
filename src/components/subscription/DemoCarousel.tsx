import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Brain, Heart, Users, DollarSign, Briefcase, Cross, Check, Sparkles, TrendingUp, AlertTriangle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const demoSlides = [
  { id: 'cadastro', title: 'Crie seu Plano', subtitle: 'Configure em minutos', component: CadastroDemo },
  { id: 'plano', title: 'Suas Metas', subtitle: 'Acompanhe o progresso', component: PlanoDemo },
  { id: 'dashboard', title: 'Dashboard', subtitle: 'Visão geral completa', component: DashboardDemo },
  { id: 'relatorios', title: 'Relatórios', subtitle: 'Gráficos detalhados', component: RelatoriosDemo },
  { id: 'balanco', title: 'Análise IA', subtitle: 'Insights inteligentes', component: BalancoDemo },
];

function CadastroDemo() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Target, label: 'Individual', active: true },
          { icon: Heart, label: 'Familiar', active: false },
          { icon: Users, label: 'Filho(a)', active: false }
        ].map((type, i) => (
          <div key={i} className={`p-2 rounded-lg border text-center transition-all ${type.active ? 'border-[#2A8C68] bg-[#A8E6CE]/20 scale-105' : 'border-gray-200'}`}>
            <type.icon className={`w-4 h-4 mx-auto mb-1 ${type.active ? 'text-[#2A8C68]' : 'text-gray-400'}`} />
            <span className={`text-[9px] font-medium ${type.active ? 'text-[#2A8C68]' : 'text-gray-500'}`}>{type.label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-[8px] text-gray-500 uppercase">Nome do Plano</span>
          <p className="text-[11px] font-semibold text-gray-800">Meu Plano 2025</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-[8px] text-gray-500 uppercase">Lema</span>
          <p className="text-[10px] text-gray-700 italic">"Constância que constrói propósito"</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Ano', value: '2025' },
          { label: 'Idade', value: '32' },
          { label: 'Anos', value: '5' }
        ].map((item, i) => (
          <div key={i} className="bg-[#A8E6CE]/20 rounded-lg p-2 text-center">
            <span className="text-[8px] text-gray-500">{item.label}</span>
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] flex items-center justify-center">
          <span className="text-white text-xs font-bold">JP</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-xs">Meu Plano 2025</h3>
          <p className="text-[9px] text-gray-500">15/19 metas</p>
        </div>
        <span className="text-lg font-bold text-[#2A8C68]">78%</span>
      </div>
      <div className="bg-[#A8E6CE]/20 rounded-lg p-2 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#2A8C68]" />
        <Progress value={78} className="h-2 flex-1" />
        <span className="text-[9px] font-bold text-[#2A8C68]">15/19</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {areas.map((area, i) => (
          <div key={i} className="rounded-lg p-2 bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-5 h-5 rounded ${area.color} flex items-center justify-center`}>
                <area.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[9px] font-medium text-gray-700">{area.name}</span>
              <span className={`text-[9px] font-bold ml-auto ${area.progress === 100 ? 'text-green-600' : 'text-gray-600'}`}>
                {area.progress}%
              </span>
            </div>
            <Progress value={area.progress} className="h-1" />
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
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Metas', value: '21' },
          { label: 'Feitas', value: '16' },
          { label: 'Boas', value: '5' },
          { label: 'Atenção', value: '2' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#A8E6CE]/20 rounded-lg p-1.5 text-center">
            <p className="text-sm font-bold text-[#2A8C68]">{stat.value}</p>
            <span className="text-[8px] text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 90,35 90,75 50,95 10,75 10,35" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="50,25 75,40 75,70 50,82 25,70 25,40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="50,40 60,47 60,63 50,70 40,63 40,47" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <polygon points="50,18 82,38 78,72 50,88 22,72 18,38" fill="#A8E6CE" fillOpacity="0.4" stroke="#2A8C68" strokeWidth="2" />
          </svg>
        </div>
        <div className="ml-3 space-y-0.5">
          {areas.map((area, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
              <span className="text-[8px] text-gray-600">{area.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-[#A8E6CE]/20 rounded-lg p-2">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#2A8C68" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="24" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#2A8C68]">76%</span>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#2A8C68]">Excelente!</p>
          <p className="text-[8px] text-gray-500">16 de 21 metas</p>
        </div>
      </div>
    </div>
  );
}

function RelatoriosDemo() {
  const areas = [
    { name: 'Espiritual', value: 85, color: '#8b5cf6' },
    { name: 'Intelectual', value: 90, color: '#3b82f6' },
    { name: 'Familiar', value: 70, color: '#ec4899' },
    { name: 'Social', value: 60, color: '#f97316' },
    { name: 'Financeiro', value: 75, color: '#10b981' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Total', value: '21', icon: Target },
          { label: 'Feitas', value: '16', icon: Check },
          { label: 'Melhor', value: 'Intel.', icon: TrendingUp },
          { label: 'Focar', value: 'Social', icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
            <stat.icon className="w-3 h-3 mx-auto mb-0.5 text-[#2A8C68]" />
            <p className="text-[10px] font-bold text-gray-800">{stat.value}</p>
            <span className="text-[7px] text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-semibold text-gray-700">Progresso por Área</span>
          <span className="text-[8px] text-[#2A8C68] bg-[#A8E6CE]/30 px-1.5 py-0.5 rounded">2025</span>
        </div>
        <div className="space-y-1.5">
          {areas.map((area, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[7px] text-gray-600 w-12 truncate">{area.name}</span>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${area.value}%`, backgroundColor: area.color }} />
              </div>
              <span className="text-[7px] font-bold text-gray-700 w-6">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BalancoDemo() {
  const needsAttention = [
    { name: 'Social', color: '#f97316', value: 45 },
    { name: 'Saúde', color: '#ef4444', value: 50 },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-[#A8E6CE]/40 to-[#7BC8A4]/30 rounded-lg p-2.5 border border-[#7BC8A4]/30">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2A8C68]" />
          <span className="text-[10px] font-bold text-[#2A8C68]">Resumo IA</span>
        </div>
        <p className="text-[9px] text-gray-700 leading-relaxed">
          <span className="text-green-600 font-medium">✓</span> Espiritual e Intelectual em ótimo progresso.
          <br />
          <span className="text-orange-600 font-medium">⚠</span> Social e Saúde precisam de atenção.
        </p>
      </div>
      <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-[9px] font-semibold text-red-700">Precisam de Atenção</span>
        </div>
        <div className="space-y-1.5">
          {needsAttention.map((area, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/60 rounded p-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: area.color }} />
              <span className="text-[9px] text-gray-700 flex-1">{area.name}</span>
              <div className="w-14 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${area.value}%`, backgroundColor: area.value < 50 ? '#ef4444' : '#f59e0b' }} />
              </div>
              <span className="text-[8px] font-bold text-gray-600">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 h-7 text-[8px] rounded-lg">
          <FileText className="w-3 h-3 mr-1" />
          PDF
        </Button>
        <Button size="sm" className="flex-1 h-7 text-[8px] bg-[#2A8C68] rounded-lg">
          <Sparkles className="w-3 h-3 mr-1" />
          Novo Resumo
        </Button>
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
      <DialogContent className="max-w-xs w-[90vw] p-0 gap-0 border-0 bg-transparent shadow-none overflow-hidden [&>button]:hidden">
        <div className="relative bg-gradient-to-br from-[#2A8C68] via-[#3d9d78] to-[#7BC8A4] rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
          {/* Close Button - Improved */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-50 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header */}
          <div className="px-4 pt-4 pb-2 text-center">
            <h2 className="text-base font-bold text-white transition-all duration-300">{demoSlides[currentSlide].title}</h2>
            <p className="text-white/80 text-[10px]">{demoSlides[currentSlide].subtitle}</p>
          </div>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-1.5 pb-2">
            {demoSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Content with slide animation */}
          <div className="px-3 pb-2 overflow-hidden">
            <div 
              key={currentSlide}
              className={`bg-white rounded-xl p-3 shadow-lg transition-all duration-300 ${
                slideDirection === 'right' 
                  ? 'animate-[slideInRight_0.3s_ease-out]' 
                  : 'animate-[slideInLeft_0.3s_ease-out]'
              }`}
              style={{
                animation: `${slideDirection === 'right' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out`
              }}
            >
              <CurrentComponent />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-3 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="text-white hover:bg-white/20 h-7 px-2 text-[10px]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white/70 text-[10px]">
              {currentSlide + 1} / {demoSlides.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="text-white hover:bg-white/20 h-7 px-2 text-[10px]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip Button */}
          <div className="px-3 pb-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-8 text-[10px] text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
            >
              Pular demonstração
            </Button>
          </div>
        </div>

        {/* Custom animation styles */}
        <style>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Brain, Heart, Users, DollarSign, Briefcase, Dumbbell, Cross, Check, Sparkles, Calendar, TrendingUp, AlertTriangle, LayoutGrid, List, Play, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Demo data with better looking values
const demoSlides = [
  {
    id: 'cadastro',
    title: 'Crie seu Plano de Vida',
    subtitle: 'Configure seu plano personalizado em minutos',
    component: CadastroDemo
  },
  {
    id: 'plano',
    title: 'Gerencie suas Metas',
    subtitle: 'Acompanhe o progresso das 7 áreas da vida',
    component: PlanoDemo
  },
  {
    id: 'relatorios',
    title: 'Relatórios Completos',
    subtitle: 'Visualize seu progresso com gráficos detalhados',
    component: RelatoriosDemo
  },
  {
    id: 'balanco',
    title: 'Análise Inteligente',
    subtitle: 'IA que te ajuda a identificar pontos de melhoria',
    component: BalancoDemo
  },
];

function CadastroDemo() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
      <div className="text-center mb-2">
        <span className="text-xs text-[#2A8C68] font-medium bg-[#A8E6CE]/30 px-3 py-1 rounded-full">Passo 1</span>
      </div>

      {/* Plan Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Target, label: 'Individual', desc: 'Plano pessoal', active: true },
          { icon: Heart, label: 'Familiar', desc: 'Para casal', active: false },
          { icon: Users, label: 'Filho(a)', desc: 'Para filhos', active: false }
        ].map((type, i) => (
          <div key={i} className={`p-3 rounded-xl border-2 text-center transition-all ${type.active ? 'border-[#2A8C68] bg-[#A8E6CE]/20 scale-105' : 'border-gray-200 hover:border-gray-300'}`}>
            <type.icon className={`w-6 h-6 mx-auto mb-2 ${type.active ? 'text-[#2A8C68]' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium block ${type.active ? 'text-[#2A8C68]' : 'text-gray-600'}`}>{type.label}</span>
            <span className="text-[10px] text-gray-500">{type.desc}</span>
          </div>
        ))}
      </div>

      {/* Form Fields Preview */}
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Nome do Plano</span>
          <p className="text-sm font-semibold text-gray-800 mt-1">Meu Plano de Vida 2025</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Lema Motivacional</span>
          <p className="text-sm font-medium text-gray-700 mt-1 italic">"Constância que constrói propósito"</p>
        </div>
      </div>

      {/* Period Config */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-xl p-3 text-center">
          <span className="text-[10px] text-gray-600">Ano Inicial</span>
          <p className="text-lg font-bold text-[#2A8C68]">2025</p>
        </div>
        <div className="bg-gradient-to-br from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-xl p-3 text-center">
          <span className="text-[10px] text-gray-600">Sua Idade</span>
          <p className="text-lg font-bold text-[#2A8C68]">32</p>
        </div>
        <div className="bg-gradient-to-br from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-xl p-3 text-center">
          <span className="text-[10px] text-gray-600">Período</span>
          <p className="text-lg font-bold text-[#2A8C68]">5 anos</p>
        </div>
      </div>
    </div>
  );
}

function PlanoDemo() {
  const areas = [
    { icon: Cross, name: 'Espiritual', color: 'bg-purple-500', bgColor: 'bg-purple-50', progress: 75, goals: '3/4' },
    { icon: Brain, name: 'Intelectual', color: 'bg-blue-500', bgColor: 'bg-blue-50', progress: 100, goals: '2/2' },
    { icon: Heart, name: 'Familiar', color: 'bg-pink-500', bgColor: 'bg-pink-50', progress: 50, goals: '1/2' },
    { icon: Users, name: 'Social', color: 'bg-orange-500', bgColor: 'bg-orange-50', progress: 66, goals: '2/3' },
    { icon: DollarSign, name: 'Financeiro', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', progress: 80, goals: '4/5' },
    { icon: Briefcase, name: 'Profissional', color: 'bg-cyan-500', bgColor: 'bg-cyan-50', progress: 100, goals: '3/3' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">JP</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-base">Meu Plano 2025</h3>
          <p className="text-xs text-gray-500">19 metas cadastradas</p>
        </div>
        <div className="text-right bg-[#A8E6CE]/30 px-3 py-1 rounded-full">
          <span className="text-xl font-bold text-[#2A8C68]">78%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-xl p-3 flex items-center gap-3">
        <Target className="w-5 h-5 text-[#2A8C68]" />
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">Progresso Total</span>
            <span className="text-xs font-bold text-[#2A8C68]">15/19 metas</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>
      </div>

      {/* Area Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {areas.map((area, i) => (
          <div key={i} className={`rounded-xl p-3 ${area.bgColor} border border-white/50 shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${area.color} flex items-center justify-center shadow-sm`}>
                <area.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{area.name}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">{area.goals} metas</span>
              <span className={`text-sm font-bold ${area.progress === 100 ? 'text-green-600' : 'text-gray-700'}`}>
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

function RelatoriosDemo() {
  const areas = [
    { name: 'Espiritual', value: 85, color: '#8b5cf6' },
    { name: 'Intelectual', value: 90, color: '#3b82f6' },
    { name: 'Familiar', value: 70, color: '#ec4899' },
    { name: 'Social', value: 60, color: '#f97316' },
    { name: 'Financeiro', value: 75, color: '#10b981' },
    { name: 'Profissional', value: 80, color: '#06b6d4' },
    { name: 'Saúde', value: 65, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: '21', icon: Target, color: 'bg-[#A8E6CE]/30' },
          { label: 'Concluídas', value: '16', icon: Check, color: 'bg-green-100' },
          { label: 'Melhor', value: 'Intel.', icon: TrendingUp, color: 'bg-blue-100' },
          { label: 'Melhorar', value: 'Social', icon: AlertTriangle, color: 'bg-orange-100' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-2 text-center`}>
            <stat.icon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
            <p className="text-sm font-bold text-gray-800">{stat.value}</p>
            <span className="text-[9px] text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Progresso por Área</span>
          <span className="text-xs text-[#2A8C68] font-medium bg-[#A8E6CE]/30 px-2 py-0.5 rounded-full">2025</span>
        </div>
        <div className="space-y-2">
          {areas.map((area, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-16 truncate">{area.name}</span>
              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ width: `${area.value}%`, backgroundColor: area.color }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-700 w-8">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-xl p-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="#2A8C68" strokeWidth="5" strokeDasharray="163.4" strokeDashoffset="39" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-[#2A8C68]">76%</span>
        </div>
        <div>
          <p className="text-base font-bold text-[#2A8C68]">Excelente progresso!</p>
          <p className="text-xs text-gray-600">Você completou 16 de 21 metas este ano</p>
        </div>
      </div>
    </div>
  );
}

function BalancoDemo() {
  const needsAttention = [
    { name: 'Social', color: '#f97316', value: 45 },
    { name: 'Saúde', color: '#ef4444', value: 50 },
    { name: 'Financeiro', color: '#10b981', value: 55 },
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
      {/* AI Summary */}
      <div className="bg-gradient-to-r from-[#A8E6CE]/40 to-[#7BC8A4]/30 rounded-xl p-4 border border-[#7BC8A4]/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[#2A8C68]">Resumo Inteligente (IA)</span>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">
          <span className="font-semibold text-green-600">✓ Pontos fortes:</span> Espiritual e Intelectual em ótimo progresso.
          <br />
          <span className="font-semibold text-orange-600">⚠ Atenção:</span> Social e Saúde precisam de mais dedicação este mês.
        </p>
      </div>

      {/* Areas Needing Attention */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-red-700">Áreas que Precisam de Atenção</span>
        </div>
        <div className="space-y-2">
          {needsAttention.map((area, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/60 rounded-lg p-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
              <span className="text-xs text-gray-700 flex-1 font-medium">{area.name}</span>
              <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ width: `${area.value}%`, backgroundColor: area.value < 50 ? '#ef4444' : '#f59e0b' }}
                />
              </div>
              <span className="text-xs font-bold text-gray-600 w-8">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button size="sm" variant="outline" className="flex-1 h-10 text-xs rounded-xl">
          <Calendar className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
        <Button size="sm" className="flex-1 h-10 text-xs bg-[#2A8C68] hover:bg-[#238058] rounded-xl">
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Novo Resumo
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

  useEffect(() => {
    if (!open || !isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [open, isAutoPlaying]);

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setIsAutoPlaying(true);
    }
  }, [open]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length);
    setIsAutoPlaying(false);
  };

  const CurrentComponent = demoSlides[currentSlide].component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#2A8C68] via-[#3d9d78] to-[#7BC8A4] rounded-2xl overflow-hidden">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {demoSlides[currentSlide].title}
            </h2>
            <p className="text-white/80 text-sm">
              {demoSlides[currentSlide].subtitle}
            </p>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center justify-center gap-2 pb-4">
            {demoSlides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-1.5 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Slide Content */}
          <div className="px-4 sm:px-6 pb-6">
            <div className="transition-all duration-300">
              <CurrentComponent />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 pb-4">
            <Button
              variant="ghost"
              onClick={prevSlide}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Anterior
            </Button>
            <span className="text-white/70 text-sm">
              {currentSlide + 1} / {demoSlides.length}
            </span>
            <Button
              variant="ghost"
              onClick={nextSlide}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              Próximo
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

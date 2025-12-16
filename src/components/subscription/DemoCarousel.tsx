import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Brain, Heart, Users, DollarSign, Briefcase, Dumbbell, Cross, Check, Sparkles, Calendar, TrendingUp, AlertTriangle, LayoutGrid, List, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Demo data with better looking values
const demoSlides = [
  {
    id: 'cadastro',
    title: 'Crie seu Plano de Vida',
    component: CadastroDemo
  },
  {
    id: 'plano',
    title: 'Gerencie suas Metas',
    component: PlanoDemo
  },
  {
    id: 'relatorios',
    title: 'Relatórios Completos',
    component: RelatoriosDemo
  },
  {
    id: 'balanco',
    title: 'Análise de Progresso',
    component: BalancoDemo
  },
];

function CadastroDemo() {
  return (
    <div className="bg-white rounded-lg p-3 space-y-3">
      <div className="text-center">
        <h3 className="font-semibold text-[#2A8C68] text-sm">Novo Plano de Vida</h3>
        <p className="text-[10px] text-muted-foreground">Defina suas metas para os próximos anos</p>
      </div>

      {/* Plan Type Selection */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Target, label: 'Individual', active: true },
          { icon: Heart, label: 'Familiar', active: false },
          { icon: Users, label: 'Filho(a)', active: false }
        ].map((type, i) => (
          <div key={i} className={`p-2 rounded-lg border text-center ${type.active ? 'border-[#2A8C68] bg-[#A8E6CE]/20' : 'border-gray-200'}`}>
            <type.icon className={`w-4 h-4 mx-auto mb-1 ${type.active ? 'text-[#2A8C68]' : 'text-gray-400'}`} />
            <span className={`text-[9px] ${type.active ? 'text-[#2A8C68] font-medium' : 'text-gray-500'}`}>{type.label}</span>
          </div>
        ))}
      </div>

      {/* Form Fields Preview */}
      <div className="space-y-2">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-[9px] text-gray-500">Nome do Plano</span>
          <p className="text-xs font-medium text-gray-700">Meu Plano 2025</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-[9px] text-gray-500">Lema Motivacional</span>
          <p className="text-xs font-medium text-gray-700 italic">"Constância que constrói propósito"</p>
        </div>
      </div>

      {/* Period Config */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#A8E6CE]/10 rounded-lg p-2 text-center">
          <span className="text-[9px] text-gray-500">Ano Inicial</span>
          <p className="text-xs font-bold text-[#2A8C68]">2025</p>
        </div>
        <div className="bg-[#A8E6CE]/10 rounded-lg p-2 text-center">
          <span className="text-[9px] text-gray-500">Sua Idade</span>
          <p className="text-xs font-bold text-[#2A8C68]">32</p>
        </div>
        <div className="bg-[#A8E6CE]/10 rounded-lg p-2 text-center">
          <span className="text-[9px] text-gray-500">Período</span>
          <p className="text-xs font-bold text-[#2A8C68]">5 anos</p>
        </div>
      </div>
    </div>
  );
}

function PlanoDemo() {
  const areas = [
    { icon: Cross, name: 'Espiritual', color: 'bg-purple-500', progress: 75, goals: '3/4' },
    { icon: Brain, name: 'Intelectual', color: 'bg-blue-500', progress: 100, goals: '2/2' },
    { icon: Heart, name: 'Familiar', color: 'bg-pink-500', progress: 50, goals: '1/2' },
    { icon: Users, name: 'Social', color: 'bg-orange-500', progress: 66, goals: '2/3' },
  ];

  return (
    <div className="bg-white rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] flex items-center justify-center">
          <span className="text-white text-xs font-bold">JP</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#2A8C68] text-sm">Meu Plano 2025</h3>
          <p className="text-[9px] text-muted-foreground">8 metas • 6 concluídas</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-[#2A8C68]">75%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#A8E6CE]/20 rounded-full p-2 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#2A8C68]" />
        <span className="text-[10px] text-gray-600">Progresso Total</span>
        <div className="flex-1">
          <Progress value={75} className="h-2" />
        </div>
        <span className="text-[10px] font-bold text-[#2A8C68]">6/8</span>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1">
        <Button size="sm" className="h-6 px-2 text-[9px] bg-[#2A8C68]">
          <LayoutGrid className="w-3 h-3 mr-1" />
          Grid
        </Button>
        <Button size="sm" variant="outline" className="h-6 px-2 text-[9px]">
          <List className="w-3 h-3 mr-1" />
          Lista
        </Button>
        <div className="flex-1" />
        <Button size="sm" className="h-6 px-2 text-[9px] bg-[#2A8C68]">
          <Play className="w-3 h-3 mr-1" />
          Modo Foco
        </Button>
      </div>

      {/* Area Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        {areas.map((area, i) => (
          <div key={i} className={`rounded-lg p-2 ${area.color}/10 border border-${area.color}/20`}>
            <div className="flex items-center gap-1 mb-1">
              <div className={`w-5 h-5 rounded-md ${area.color} flex items-center justify-center`}>
                <area.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-700">{area.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-500">{area.goals} metas</span>
              <span className={`text-[10px] font-bold ${area.progress === 100 ? 'text-green-600' : 'text-[#2A8C68]'}`}>
                {area.progress}%
              </span>
            </div>
            <Progress value={area.progress} className="h-1 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatoriosDemo() {
  const areas = [
    { name: 'Espiritual', value: 85, color: 'bg-purple-500' },
    { name: 'Intelectual', value: 90, color: 'bg-blue-500' },
    { name: 'Familiar', value: 70, color: 'bg-pink-500' },
    { name: 'Social', value: 60, color: 'bg-orange-500' },
    { name: 'Financeiro', value: 75, color: 'bg-emerald-500' },
    { name: 'Profissional', value: 80, color: 'bg-cyan-500' },
    { name: 'Saúde', value: 65, color: 'bg-red-500' },
  ];

  return (
    <div className="bg-white rounded-lg p-3 space-y-3">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-1">
        {[
          { label: 'Total', value: '21', icon: Target },
          { label: 'Concluídas', value: '16', icon: Check },
          { label: 'Melhor', value: 'Intel.', icon: TrendingUp },
          { label: 'Melhorar', value: 'Social', icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-1.5 text-center">
            <stat.icon className="w-3 h-3 mx-auto mb-0.5 text-[#2A8C68]" />
            <p className="text-[10px] font-bold text-gray-800">{stat.value}</p>
            <span className="text-[8px] text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-gray-700">Progresso por Área</span>
          <span className="text-[9px] text-[#2A8C68] font-medium">2025</span>
        </div>
        <div className="space-y-1.5">
          {areas.map((area, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[8px] text-gray-600 w-12 truncate">{area.name}</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${area.color} rounded-full transition-all`} 
                  style={{ width: `${area.value}%` }}
                />
              </div>
              <span className="text-[8px] font-medium text-gray-700 w-6">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-3 bg-[#A8E6CE]/20 rounded-lg p-2">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="#2A8C68" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="24" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#2A8C68]">76%</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#2A8C68]">Excelente!</p>
          <p className="text-[9px] text-gray-600">16 de 21 metas concluídas</p>
        </div>
      </div>
    </div>
  );
}

function BalancoDemo() {
  const needsAttention = [
    { name: 'Social', color: 'bg-orange-500', value: 45 },
    { name: 'Saúde', color: 'bg-red-500', value: 50 },
    { name: 'Financeiro', color: 'bg-emerald-500', value: 55 },
  ];

  return (
    <div className="bg-white rounded-lg p-3 space-y-3">
      {/* AI Summary */}
      <div className="bg-gradient-to-r from-[#A8E6CE]/30 to-[#7BC8A4]/20 rounded-lg p-2">
        <div className="flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3 text-[#2A8C68]" />
          <span className="text-[10px] font-semibold text-[#2A8C68]">Resumo Inteligente</span>
        </div>
        <p className="text-[9px] text-gray-700 leading-relaxed">
          <strong>Pontos fortes:</strong> Espiritual e Intelectual em ótimo progresso.
          <br />
          <strong>Atenção:</strong> Social e Saúde precisam de mais dedicação.
        </p>
      </div>

      {/* Areas Needing Attention */}
      <div className="bg-red-50 rounded-lg p-2">
        <div className="flex items-center gap-1 mb-2">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-[10px] font-semibold text-red-700">Áreas que Precisam de Atenção</span>
        </div>
        <div className="space-y-1.5">
          {needsAttention.map((area, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${area.color}`} />
              <span className="text-[9px] text-gray-700 flex-1">{area.name}</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${area.value < 50 ? 'bg-red-400' : 'bg-yellow-400'}`} 
                  style={{ width: `${area.value}%` }}
                />
              </div>
              <span className="text-[8px] font-medium text-gray-600">{area.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Year Filter & Export */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
          <Calendar className="w-3 h-3 text-gray-500" />
          <span className="text-[9px] text-gray-600">Ano 2025</span>
        </div>
        <Button size="sm" variant="outline" className="h-6 px-2 text-[9px]">
          Exportar PDF
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 h-7 text-[9px]">
          Salvar anotação
        </Button>
        <Button size="sm" className="flex-1 h-7 text-[9px] bg-[#2A8C68]">
          <Sparkles className="w-3 h-3 mr-1" />
          Gerar Resumo IA
        </Button>
      </div>
    </div>
  );
}

export default function DemoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

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
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-0 overflow-hidden rounded-2xl shadow-lg bg-white/95 backdrop-blur">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2A8C68] to-[#7BC8A4] px-4 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-sm font-semibold">{demoSlides[currentSlide].title}</h3>
              <div className="flex items-center gap-1">
                {demoSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <div className="p-3 min-h-[280px]">
            <CurrentComponent />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-3 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="h-7 px-2 text-[#2A8C68] hover:bg-[#A8E6CE]/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[10px] text-muted-foreground">
              {currentSlide + 1} / {demoSlides.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="h-7 px-2 text-[#2A8C68] hover:bg-[#A8E6CE]/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

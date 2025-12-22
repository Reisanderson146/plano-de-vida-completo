import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Scale, 
  Target,
  CheckCircle2,
  Plus,
  Eye,
  Edit,
  Sparkles,
  Download,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Play,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const guideSteps = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Sua central de controle e visão geral do progresso',
    content: {
      overview: 'O Dashboard é a tela inicial do sistema. Aqui você tem uma visão completa do seu progresso em todos os planos de vida.',
      features: [
        { title: 'Visão Geral', description: 'Veja o total de metas cadastradas e quantas já foram concluídas.' },
        { title: 'Progresso por Área', description: 'Acompanhe seu avanço em cada área da vida (Espiritual, Familiar, Saúde, etc.).' },
        { title: 'Metas Recentes', description: 'Visualize as últimas metas adicionadas ou concluídas.' },
        { title: 'Gráficos de Evolução', description: 'Analise seu progresso através de gráficos visuais.' },
      ],
      example: 'Exemplo: João abriu o Dashboard e viu que tinha 45 metas no total, sendo 28 já concluídas (62%). Ele notou que a área "Saúde" estava com apenas 30% de conclusão e decidiu focar mais nela.',
      tips: [
        'Acesse o Dashboard diariamente para manter o foco nos seus objetivos.',
        'Use os cards de resumo para identificar áreas que precisam de mais atenção.',
      ],
      link: '/',
    },
  },
  {
    id: 'planos',
    title: 'Planos de Vida',
    icon: FileText,
    description: 'Crie e gerencie seus planos de vida individuais ou familiares',
    content: {
      overview: 'Na seção Planos você cria e gerencia todos os seus planos de vida. Pode ter planos individuais, familiares ou para filhos.',
      features: [
        { title: 'Criar Novo Plano', description: 'Clique em "Novo Plano" para iniciar um novo plano de vida.' },
        { title: 'Tipos de Plano', description: 'Escolha entre Individual, Familiar ou para Filho(a).' },
        { title: 'Personalização', description: 'Adicione foto, lema e personalize as áreas do seu plano.' },
        { title: 'Metas por Período', description: 'Organize suas metas por ano e idade, facilitando o acompanhamento ao longo da vida.' },
      ],
      example: 'Exemplo: Maria criou um plano "Familiar" para ela e seu esposo. Adicionou metas como "Fazer viagem em família" para 2025 e "Quitar financiamento" para 2027. Ela também criou um plano separado para acompanhar os objetivos da filha.',
      tips: [
        'Comece com um plano individual antes de criar planos para a família.',
        'Revise e atualize suas metas a cada 3 meses.',
        'Use o lema para se manter motivado - ele aparece no topo do seu plano.',
      ],
      link: '/consulta',
    },
  },
  {
    id: 'metas',
    title: 'Cadastro de Metas',
    icon: Target,
    description: 'Como adicionar e organizar suas metas de vida',
    content: {
      overview: 'Dentro de cada plano, você pode cadastrar metas específicas para cada área da vida e período.',
      features: [
        { title: '10 Áreas da Vida', description: 'Espiritual, Familiar, Conjugal, Saúde, Intelectual, Financeiro, Pessoal, Social, Profissional e Lazer.' },
        { title: 'Metas por Período', description: 'Defina metas para curto prazo (1 ano), médio prazo (5 anos) ou longo prazo (10+ anos).' },
        { title: 'Marcar Conclusão', description: 'Clique na checkbox para marcar uma meta como concluída.' },
        { title: 'Editar e Excluir', description: 'Você pode editar o texto ou remover metas a qualquer momento.' },
      ],
      example: 'Exemplo: Pedro definiu para a área "Financeiro" as seguintes metas: "Criar reserva de emergência de 6 meses" (2024), "Investir 15% da renda mensal" (2025) e "Alcançar independência financeira" (2040).',
      tips: [
        'Seja específico e mensurável nas suas metas (ex: "Ler 12 livros por ano" ao invés de "Ler mais").',
        'Comece com 2-3 metas por área - você pode adicionar mais depois.',
        'Celebre cada meta concluída! O sistema registra a data de conclusão.',
      ],
      link: '/consulta',
    },
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    icon: BarChart3,
    description: 'Analise seu progresso com relatórios detalhados',
    content: {
      overview: 'A seção de Relatórios oferece análises detalhadas do seu progresso com gráficos e estatísticas.',
      features: [
        { title: 'Filtros por Período', description: 'Analise o progresso por ano, trimestre ou período personalizado.' },
        { title: 'Gráficos Comparativos', description: 'Compare o desempenho entre diferentes áreas da vida.' },
        { title: 'Evolução Temporal', description: 'Veja como seu progresso evoluiu ao longo do tempo.' },
        { title: 'Exportar Relatórios', description: 'Baixe seus relatórios em PDF para guardar ou compartilhar.' },
      ],
      example: 'Exemplo: Ana usou os relatórios para descobrir que nos últimos 6 meses ela teve 80% de conclusão nas metas de Saúde, mas apenas 20% nas metas Financeiras. Isso a ajudou a rebalancear seu foco.',
      tips: [
        'Revise os relatórios mensalmente para ajustar suas prioridades.',
        'Compare períodos diferentes para identificar padrões de comportamento.',
      ],
      link: '/relatorios',
    },
  },
  {
    id: 'balanco',
    title: 'Balanço',
    icon: Scale,
    description: 'Faça reflexões periódicas sobre seu progresso',
    content: {
      overview: 'O Balanço é uma ferramenta poderosa para reflexão. Use para analisar seu progresso periodicamente e registrar insights.',
      features: [
        { title: 'Análise por Plano', description: 'Selecione qual plano de vida deseja analisar.' },
        { title: 'Filtro por Período', description: 'Escolha o período que deseja avaliar (ano, semestre, etc.).' },
        { title: 'Resumo Inteligente', description: 'Use a IA para gerar uma análise automática do seu progresso.' },
        { title: 'Anotações de Reflexão', description: 'Registre suas reflexões, aprendizados e próximos passos.' },
        { title: 'Áreas de Atenção', description: 'Veja quais áreas precisam de mais dedicação.' },
      ],
      example: 'Exemplo: No final de 2024, Carlos fez seu balanço anual. A IA gerou um resumo mostrando que ele tinha 65% de conclusão geral. Ele anotou: "Preciso dedicar mais tempo à área Familiar. Definir horários fixos para a família em 2025".',
      tips: [
        'Faça um balanço ao final de cada trimestre ou semestre.',
        'Salve os resumos da IA como anotações para consultar depois.',
        'Use as reflexões para ajustar metas do próximo período.',
      ],
      link: '/balanco',
    },
  },
];

const quickStartSteps = [
  { step: 1, title: 'Crie seu primeiro plano', description: 'Vá em Planos → Novo Plano e escolha "Individual"', icon: Plus },
  { step: 2, title: 'Adicione suas metas', description: 'Preencha metas para cada área da vida', icon: Edit },
  { step: 3, title: 'Acompanhe o progresso', description: 'Use o Dashboard para ver sua evolução', icon: Eye },
  { step: 4, title: 'Marque conclusões', description: 'Clique nas metas concluídas para registrar', icon: CheckCircle2 },
  { step: 5, title: 'Faça reflexões', description: 'Use o Balanço para refletir periodicamente', icon: Sparkles },
];

export default function Guia() {
  const [activeTab, setActiveTab] = useState('inicio');

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Guia do Sistema</h1>
              <p className="text-muted-foreground">Aprenda a usar o Plano de Vida passo a passo</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="inicio" className="rounded-lg">
              <Play className="w-4 h-4 mr-2" />
              Início Rápido
            </TabsTrigger>
            <TabsTrigger value="telas" className="rounded-lg">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Telas do Sistema
            </TabsTrigger>
            <TabsTrigger value="dicas" className="rounded-lg">
              <Lightbulb className="w-4 h-4 mr-2" />
              Dicas
            </TabsTrigger>
          </TabsList>

          {/* Quick Start Tab */}
          <TabsContent value="inicio" className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Comece em 5 Passos
                </CardTitle>
                <CardDescription>
                  Siga estes passos para começar a usar o sistema de forma eficiente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickStartSteps.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.step}
                        className="flex items-start gap-4 p-4 rounded-xl bg-background/60 border border-border/30 hover:bg-background/80 transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/consulta">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Meu Primeiro Plano
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('telas')}>
                    Ver Guia Completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Video placeholder */}
            <Card className="border-border/40">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tutorial em Vídeo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Em breve teremos um vídeo tutorial completo para você acompanhar
                </p>
                <Badge variant="secondary">Em breve</Badge>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Screens Tab */}
          <TabsContent value="telas" className="space-y-6">
            <div className="grid gap-6">
              {guideSteps.map((guide, index) => {
                const Icon = guide.icon;
                return (
                  <Card key={guide.id} className="border-border/40 overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{guide.title}</CardTitle>
                            <CardDescription>{guide.description}</CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={guide.content.link}>
                            Acessar
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Overview */}
                      <div>
                        <p className="text-foreground leading-relaxed">{guide.content.overview}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Funcionalidades
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {guide.content.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-foreground">{feature.title}:</span>{' '}
                                <span className="text-muted-foreground">{feature.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Example */}
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Exemplo Prático
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed">{guide.content.example}</p>
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Dicas
                        </h4>
                        <ul className="space-y-1">
                          {guide.content.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-amber-500">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="dicas" className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Metas SMART
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Defina metas que sejam:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2"><Badge variant="outline">S</Badge> Específicas</li>
                    <li className="flex gap-2"><Badge variant="outline">M</Badge> Mensuráveis</li>
                    <li className="flex gap-2"><Badge variant="outline">A</Badge> Alcançáveis</li>
                    <li className="flex gap-2"><Badge variant="outline">R</Badge> Relevantes</li>
                    <li className="flex gap-2"><Badge variant="outline">T</Badge> Temporais</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Frequência de Revisão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span><strong>Diário:</strong> Dashboard rápido</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span><strong>Semanal:</strong> Marcar conclusões</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span><strong>Mensal:</strong> Análise de relatórios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span><strong>Trimestral:</strong> Balanço completo</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Estrutura do Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Organize seu plano com:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 2-5 metas por área da vida</li>
                    <li>• Metas de curto prazo (1 ano)</li>
                    <li>• Metas de médio prazo (3-5 anos)</li>
                    <li>• Metas de longo prazo (10+ anos)</li>
                    <li>• Um lema motivacional</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Exportação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Você pode exportar seu plano e relatórios em PDF para:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Imprimir e deixar visível</li>
                    <li>• Compartilhar com cônjuge/família</li>
                    <li>• Guardar como backup</li>
                    <li>• Apresentar em reuniões de família</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Dica de Ouro</h3>
                    <p className="text-muted-foreground">
                      O segredo do sucesso não está em ter um plano perfeito, mas em revisar e ajustar constantemente. 
                      <strong className="text-foreground"> Constância que constrói resultados!</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

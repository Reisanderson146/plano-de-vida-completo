import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useExportReport } from '@/hooks/useExportReport';
import { LIFE_AREAS } from '@/lib/constants';
import { Loader2, Target, CheckCircle2, AlertTriangle, TrendingDown, Plus, FileText, Calendar, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AreaStats {
  area: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
}

interface BalanceNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const AREA_HEX_COLORS: Record<string, string> = {
  espiritual: '#8b5cf6',
  intelectual: '#3b82f6',
  familiar: '#ec4899',
  social: '#f97316',
  financeiro: '#22c55e',
  profissional: '#06b6d4',
  saude: '#ef4444',
};

const getStatusColor = (percentage: number) => {
  if (percentage >= 70) return '#22c55e'; // Verde
  if (percentage >= 40) return '#eab308'; // Amarelo
  return '#ef4444'; // Vermelho
};

const getStatusLabel = (percentage: number) => {
  if (percentage >= 70) return { text: 'Bom', emoji: '🟢' };
  if (percentage >= 40) return { text: 'Atenção', emoji: '🟡' };
  return { text: 'Melhorar', emoji: '🔴' };
};

export default function Balanco() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { exportToPDF, exportToExcel } = useExportReport();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AreaStats[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [balanceNotes, setBalanceNotes] = useState<BalanceNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedYear]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all goals to get available years
      const { data: allGoals } = await supabase
        .from('life_goals')
        .select('period_year')
        .eq('user_id', user.id);

      if (allGoals) {
        const uniqueYears = [...new Set(allGoals.map(g => g.period_year))].sort((a, b) => a - b);
        setYears(uniqueYears);
      }

      // Fetch goals based on filter
      let query = supabase
        .from('life_goals')
        .select('*')
        .eq('user_id', user.id);

      if (selectedYear !== 'all') {
        query = query.eq('period_year', parseInt(selectedYear));
      }

      const { data: goals } = await query;

      // Calculate stats per area
      const areaStats: AreaStats[] = LIFE_AREAS.map(area => {
        const areaGoals = goals?.filter(g => g.area === area.id) || [];
        const completed = areaGoals.filter(g => g.is_completed).length;
        const total = areaGoals.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          area: area.id,
          label: area.label,
          total,
          completed,
          percentage,
        };
      });

      setStats(areaStats);

      // Fetch balance notes
      const yearPrefix = selectedYear !== 'all' ? `[Balanço ${selectedYear}]` : '[Balanço';
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, content, created_at')
        .eq('user_id', user.id)
        .like('title', `${yearPrefix}%`)
        .order('created_at', { ascending: false });

      setBalanceNotes(notes || []);
    } catch (error) {
      console.error('Error loading balance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBalanceNote = async () => {
    if (!user || !newNoteContent.trim()) return;

    setSavingNote(true);
    const year = selectedYear !== 'all' ? selectedYear : new Date().getFullYear();
    const title = newNoteTitle.trim() || `Reflexão de ${format(new Date(), 'dd/MM/yyyy')}`;
    const fullTitle = `[Balanço ${year}] ${title}`;

    try {
      const { error } = await supabase.from('notes').insert({
        user_id: user.id,
        title: fullTitle,
        content: newNoteContent,
        area: null,
      });

      if (error) throw error;

      toast({
        title: 'Anotação salva!',
        description: 'Sua reflexão de balanço foi registrada.',
      });

      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNoteForm(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a anotação.',
        variant: 'destructive',
      });
    } finally {
      setSavingNote(false);
    }
  };

  const totalGoals = stats.reduce((sum, s) => sum + s.total, 0);
  const completedGoals = stats.reduce((sum, s) => sum + s.completed, 0);
  const goodAreas = stats.filter(s => s.percentage >= 70 && s.total > 0).length;
  const needsImprovementAreas = stats.filter(s => s.percentage < 40 && s.total > 0).length;

  const chartData = stats.map(s => ({
    name: s.label,
    value: s.percentage,
    fill: getStatusColor(s.percentage),
    areaColor: AREA_HEX_COLORS[s.area],
  }));

  const areasNeedingAttention = stats
    .filter(s => s.percentage < 40 && s.total > 0)
    .sort((a, b) => a.percentage - b.percentage);

  const overallPercentage = totalGoals > 0 
    ? Math.round((completedGoals / totalGoals) * 100) 
    : 0;

  const handleExport = (formatType: 'pdf' | 'excel') => {
    const exportData = {
      title: 'Balanço - Plano de Vida',
      subtitle: selectedYear !== 'all' ? `Período: ${selectedYear}` : 'Todos os períodos',
      areas: stats,
      totalGoals,
      completedGoals,
      overallPercentage,
      notes: balanceNotes.map(note => ({
        title: note.title.replace(/^\[Balanço \d+\] /, ''),
        content: note.content,
        date: format(new Date(note.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      })),
    };

    try {
      if (formatType === 'pdf') {
        exportToPDF(exportData);
      } else {
        exportToExcel(exportData);
      }
      toast({
        title: 'Exportação concluída!',
        description: `Balanço exportado em ${formatType.toUpperCase()} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o balanço.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Fechando para Balanço</h1>
            <p className="text-muted-foreground mt-1">Analise seu progresso por período</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total de Metas</p>
                  <p className="text-xl font-bold">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                  <p className="text-xl font-bold">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Áreas Boas</p>
                  <p className="text-xl font-bold text-green-500">{goodAreas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precisam Melhorar</p>
                  <p className="text-xl font-bold text-red-500">{needsImprovementAreas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Análise por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalGoals === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta encontrada para o período selecionado.</p>
              </div>
            ) : (
              <div className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 60, left: 80, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value: number) => `${value}% ${getStatusLabel(value).emoji}`}
                        style={{ fontSize: 12, fontWeight: 500 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">≥70% Bom</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">40-69% Atenção</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">&lt;40% Melhorar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Areas Needing Attention */}
        {areasNeedingAttention.length > 0 && (
          <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Áreas que Precisam de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {areasNeedingAttention.map(area => (
                  <li key={area.area} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: AREA_HEX_COLORS[area.area] }}
                      />
                      <span className="font-medium">{area.label}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {area.completed}/{area.total} metas ({area.percentage}%)
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Balance Notes Section */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Anotações do Balanço
            </CardTitle>
            {!showNoteForm && (
              <Button size="sm" onClick={() => setShowNoteForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Nova Anotação
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New Note Form */}
            {showNoteForm && (
              <div className="p-4 rounded-lg border border-border bg-background/50 space-y-3">
                <Input
                  placeholder="Título da reflexão (opcional)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Escreva suas reflexões sobre o período..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowNoteForm(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={saveBalanceNote} 
                    disabled={!newNoteContent.trim() || savingNote}
                  >
                    {savingNote && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </div>
            )}

            {/* Notes List */}
            {balanceNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma anotação de balanço ainda.</p>
                <p className="text-sm">Registre suas reflexões sobre o período.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balanceNotes.map(note => (
                  <div key={note.id} className="p-4 rounded-lg border border-border bg-background/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{note.title.replace(/^\[Balanço \d+\] /, '')}</h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(note.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

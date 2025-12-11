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
import { LIFE_AREAS, AREA_HEX_COLORS } from '@/lib/constants';
import { Loader2, Target, CheckCircle2, AlertTriangle, TrendingDown, Plus, FileText, Folder, User, Users, Baby, Pencil, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { format, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { DateRangeFilter, getYearRangeFromDateRange } from '@/components/filters/DateRangeFilter';
import { DateRange } from 'react-day-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface LifePlan {
  id: string;
  title: string;
  plan_type: string;
  member_name: string | null;
}

const PLAN_TYPE_CONFIG = {
  individual: { label: 'Individual', icon: User },
  familiar: { label: 'Familiar', icon: Users },
  filho: { label: 'Filho(a)', icon: Baby },
};

const getStatusColor = (percentage: number) => {
  if (percentage >= 70) return '#22c55e';
  if (percentage >= 40) return '#eab308';
  return '#ef4444';
};

const getStatusLabel = (percentage: number) => {
  if (percentage >= 70) return { text: 'Bom', emoji: '🟢' };
  if (percentage >= 40) return { text: 'Atenção', emoji: '🟡' };
  return { text: 'Melhorar', emoji: '🔴' };
};

export default function Balanco() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { exportToPDF } = useExportReport();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AreaStats[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date())
  });
  const [plans, setPlans] = useState<LifePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [balanceNotes, setBalanceNotes] = useState<BalanceNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<BalanceNote | null>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedPlanId) {
      loadData();
    }
  }, [user, dateRange, selectedPlanId]);

  const loadPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('life_plans')
        .select('id, title, plan_type, member_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!user || !selectedPlanId) return;
    setLoading(true);

    try {
      let query = supabase
        .from('life_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('life_plan_id', selectedPlanId);

      const yearRange = getYearRangeFromDateRange(dateRange);
      if (yearRange.min !== undefined) {
        query = query.gte('period_year', yearRange.min);
      }
      if (yearRange.max !== undefined) {
        query = query.lte('period_year', yearRange.max);
      }

      const { data: goals } = await query;

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

      const filterLabel = getDateRangeLabel(dateRange);
      const yearPrefix = `[Balanço ${filterLabel}]`;
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, content, created_at')
        .eq('user_id', user.id)
        .like('title', !dateRange?.from ? '[Balanço%' : `${yearPrefix}%`)
        .order('created_at', { ascending: false });

      setBalanceNotes(notes || []);
    } catch (error) {
      console.error('Error loading balance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeLabel = (range: DateRange | undefined): string => {
    if (!range?.from) return 'Todos os períodos';
    if (!range.to) return format(range.from, 'yyyy', { locale: ptBR });
    const fromYear = range.from.getFullYear();
    const toYear = range.to.getFullYear();
    if (fromYear === toYear) return `${fromYear}`;
    return `${fromYear} - ${toYear}`;
  };

  const saveBalanceNote = async () => {
    if (!user || !newNoteContent.trim()) return;

    setSavingNote(true);
    const filterLabel = getDateRangeLabel(dateRange);
    const title = newNoteTitle.trim() || `Reflexão de ${format(new Date(), 'dd/MM/yyyy')}`;
    const fullTitle = `[Balanço ${filterLabel}] ${title}`;

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ title: fullTitle, content: newNoteContent })
          .eq('id', editingNote.id);

        if (error) throw error;

        toast({
          title: 'Anotação atualizada!',
          description: 'Sua reflexão foi atualizada com sucesso.',
        });
      } else {
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
      }

      setNewNoteTitle('');
      setNewNoteContent('');
      setShowNoteForm(false);
      setEditingNote(null);
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

  const handleEditNote = (note: BalanceNote) => {
    setEditingNote(note);
    setNewNoteTitle(note.title.replace(/^\[Balanço [^\]]+\] /, ''));
    setNewNoteContent(note.content);
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Anotação excluída!',
        description: 'A anotação foi removida com sucesso.',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a anotação.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    setNewNoteTitle('');
    setNewNoteContent('');
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

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleExport = () => {
    const exportData = {
      title: 'Balanço - Plano de Vida',
      subtitle: `Período: ${getDateRangeLabel(dateRange)}`,
      areas: stats,
      totalGoals,
      completedGoals,
      overallPercentage,
      notes: balanceNotes.map(note => ({
        title: note.title.replace(/^\[Balanço [^\]]+\] /, ''),
        content: note.content,
        date: format(new Date(note.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      })),
    };

    try {
      exportToPDF(exportData);
      toast({
        title: 'Exportação concluída!',
        description: 'Balanço exportado em PDF com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o balanço.',
        variant: 'destructive',
      });
    }
  };

  if (loading && plans.length === 0) {
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
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Fechando para Balanço</h1>
            <p className="text-muted-foreground mt-1">Analise seu progresso anual por plano e período</p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Plan Filter */}
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <Folder className="w-4 h-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map(plan => {
                  const config = PLAN_TYPE_CONFIG[plan.plan_type as keyof typeof PLAN_TYPE_CONFIG] || PLAN_TYPE_CONFIG.individual;
                  const PlanIcon = config.icon;
                  return (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center gap-2">
                        <PlanIcon className="w-4 h-4" />
                        <span>{plan.title}</span>
                        {plan.member_name && <span className="text-muted-foreground">({plan.member_name})</span>}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
            />

            {/* Export Button */}
            <div className="flex gap-2 sm:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex-1 sm:flex-none"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Selected Plan and Period Badge */}
          {selectedPlan && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Analisando:</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                {(() => {
                  const config = PLAN_TYPE_CONFIG[selectedPlan.plan_type as keyof typeof PLAN_TYPE_CONFIG] || PLAN_TYPE_CONFIG.individual;
                  const PlanIcon = config.icon;
                  return <PlanIcon className="w-3 h-3" />;
                })()}
                {selectedPlan.title}
                {selectedPlan.member_name && ` - ${selectedPlan.member_name}`}
              </Badge>
              <Badge variant="outline">
                {getDateRangeLabel(dateRange)}
              </Badge>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total de Metas</p>
                  <p className="text-xl sm:text-2xl font-bold">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-xl sm:text-2xl font-bold">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Áreas Boas</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-500">{goodAreas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-red-500/10">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Precisam Melhorar</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-500">{needsImprovementAreas}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Análise por Área
              <Badge variant="outline" className="ml-auto font-normal">
                {getDateRangeLabel(dateRange)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[350px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : totalGoals === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta encontrada para o período selecionado.</p>
                <p className="text-sm mt-1">Tente selecionar outro período ou adicione metas ao seu plano.</p>
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
                        formatter={(value: number) => `${value}%`}
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
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Áreas que Precisam de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {areasNeedingAttention.map(area => (
                  <li key={area.area} className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50">
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
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
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
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={saveBalanceNote} 
                    disabled={!newNoteContent.trim() || savingNote}
                  >
                    {savingNote && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    {editingNote ? 'Atualizar' : 'Salvar'}
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
                      <h4 className="font-medium text-sm flex-1">{note.title.replace(/^\[Balanço [^\]]+\] /, '')}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(note.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditNote(note)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A anotação será excluída permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
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
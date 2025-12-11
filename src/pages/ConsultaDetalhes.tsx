import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LifePlanTable } from '@/components/life-plan/LifePlanTable';
import { ExportPlanDialog } from '@/components/life-plan/ExportPlanDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Pencil, Save, X, Settings, Download, FileText } from 'lucide-react';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { AreaCustomizationEditor, AreaConfig } from '@/components/life-plan/AreaCustomizationEditor';
import { usePlanAreaCustomizations } from '@/hooks/usePlanAreaCustomizations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LifePlan {
  id: string;
  title: string;
  motto: string | null;
}

interface Goal {
  id: string;
  life_plan_id: string;
  period_year: number;
  age: number;
  area: LifeArea;
  goal_text: string;
  is_completed: boolean;
}

export default function ConsultaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { customizations, saveAllCustomizations, refetch: refetchCustomizations } = usePlanAreaCustomizations(id);
  
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<LifePlan | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editMotto, setEditMotto] = useState('');
  const [titleError, setTitleError] = useState('');
  const [areasDialogOpen, setAreasDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [areaConfigs, setAreaConfigs] = useState<AreaConfig[]>(
    LIFE_AREAS.map(a => ({ id: a.id, label: a.label, color: AREA_HEX_COLORS[a.id] }))
  );
  const [areasOpen, setAreasOpen] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadPlan();
    }
  }, [user, id]);

  useEffect(() => {
    if (customizations.length > 0) {
      setAreaConfigs(
        LIFE_AREAS.map(a => {
          const custom = customizations.find(c => c.area_id === a.id);
          return {
            id: a.id,
            label: custom?.custom_label || a.label,
            color: custom?.custom_color || AREA_HEX_COLORS[a.id],
          };
        })
      );
    }
  }, [customizations]);

  const loadPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('life_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (planError) throw planError;

      setPlan(planData);
      setEditTitle(planData.title);
      setEditMotto(planData.motto || '');

      const { data: goalsData, error: goalsError } = await supabase
        .from('life_goals')
        .select('*')
        .eq('life_plan_id', id)
        .order('period_year', { ascending: true });

      if (goalsError) throw goalsError;

      setGoals(goalsData as Goal[]);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: 'Erro ao carregar plano',
        description: 'Não foi possível carregar o plano de vida.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('life_goals')
        .update(updates)
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('life_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== goalId));
      toast({ title: 'Meta excluída!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('life_goals')
        .insert({
          ...goal,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      setGoals([...goals, data as Goal]);
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) {
      setTitleError('O título é obrigatório');
      return;
    }

    const { data: existingPlans, error: checkError } = await supabase
      .from('life_plans')
      .select('id, title')
      .eq('user_id', user!.id)
      .neq('id', id)
      .ilike('title', editTitle.trim());

    if (checkError) {
      console.error('Error checking title:', checkError);
    } else if (existingPlans && existingPlans.length > 0) {
      setTitleError('Já existe um plano com este nome. Escolha um nome diferente.');
      return;
    }

    try {
      const { error } = await supabase
        .from('life_plans')
        .update({ title: editTitle.trim(), motto: editMotto || null })
        .eq('id', id);

      if (error) throw error;

      setPlan({ ...plan!, title: editTitle.trim(), motto: editMotto || null });
      setEditingTitle(false);
      setTitleError('');
      toast({ title: 'Plano atualizado!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveAreaConfigs = async () => {
    try {
      await saveAllCustomizations(id!, areaConfigs);
      await refetchCustomizations();
      setAreasDialogOpen(false);
      toast({ title: 'Áreas atualizadas!' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar áreas',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!plan) {
    return (
      <AppLayout>
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Plano não encontrado</h2>
          <p className="text-muted-foreground mb-6">O plano solicitado não existe ou você não tem permissão para acessá-lo.</p>
          <Link to="/consulta">
            <Button className="rounded-xl">Voltar para consulta</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to="/consulta">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          {editingTitle ? (
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setTitleError('');
                  }}
                  placeholder="Nome do plano"
                  className={`text-lg sm:text-2xl font-bold h-12 rounded-xl ${titleError ? 'border-destructive' : ''}`}
                />
                <Button size="icon" onClick={handleSaveTitle} className="h-10 w-10 rounded-xl flex-shrink-0">
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { setEditingTitle(false); setTitleError(''); }} className="h-10 w-10 rounded-xl flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {titleError && <p className="text-xs text-destructive">{titleError}</p>}
              <Input
                value={editMotto}
                onChange={(e) => setEditMotto(e.target.value)}
                placeholder="Lema (opcional)"
                className="text-muted-foreground h-10 rounded-xl"
              />
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">{plan.title}</h1>
                <Button size="icon" variant="ghost" onClick={() => setEditingTitle(true)} className="h-9 w-9 rounded-xl flex-shrink-0">
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              {plan.motto && (
                <p className="text-sm sm:text-base text-muted-foreground italic truncate mt-1">"{plan.motto}"</p>
              )}
            </div>
          )}
          
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} className="h-10 rounded-xl border-border/50">
              <Download className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAreasDialogOpen(true)} className="h-10 rounded-xl border-border/50">
              <Settings className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Personalizar</span>
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        {goals.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1.5 rounded-lg">
              {goals.filter(g => g.goal_text.trim()).length} metas cadastradas
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 rounded-lg">
              {goals.filter(g => g.is_completed).length} concluídas
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 rounded-lg text-success border-success/30">
              {goals.filter(g => g.goal_text.trim()).length > 0 
                ? Math.round((goals.filter(g => g.is_completed).length / goals.filter(g => g.goal_text.trim()).length) * 100)
                : 0}% progresso
            </Badge>
          </div>
        )}

        {/* Life Plan Table */}
        <LifePlanTable
          goals={goals}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          onAddGoal={handleAddGoal}
          lifePlanId={plan.id}
          editable={true}
        />

        {/* Export Dialog */}
        <ExportPlanDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          plan={plan}
          goals={goals}
          areaConfigs={areaConfigs}
        />

        {/* Areas Customization Dialog */}
        <Dialog open={areasDialogOpen} onOpenChange={setAreasDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Personalizar Áreas do Plano</DialogTitle>
            </DialogHeader>
            <AreaCustomizationEditor
              areas={areaConfigs}
              onAreasChange={setAreaConfigs}
              isOpen={areasOpen}
              onOpenChange={setAreasOpen}
            />
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setAreasDialogOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleSaveAreaConfigs} className="rounded-xl">Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

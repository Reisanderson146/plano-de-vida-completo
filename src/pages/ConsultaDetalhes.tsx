import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LifePlanTable } from '@/components/life-plan/LifePlanTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Pencil, Save, X, Settings } from 'lucide-react';
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
  const [areasDialogOpen, setAreasDialogOpen] = useState(false);
  const [areaConfigs, setAreaConfigs] = useState<AreaConfig[]>(
    LIFE_AREAS.map(a => ({ id: a.id, label: a.label, color: AREA_HEX_COLORS[a.id] }))
  );
  const [areasOpen, setAreasOpen] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadPlan();
    }
  }, [user, id]);

  // Update area configs when customizations are loaded
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

  useEffect(() => {
    if (user && id) {
      loadPlan();
    }
  }, [user, id]);

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
    try {
      const { error } = await supabase
        .from('life_plans')
        .update({ title: editTitle, motto: editMotto || null })
        .eq('id', id);

      if (error) throw error;

      setPlan({ ...plan!, title: editTitle, motto: editMotto || null });
      setEditingTitle(false);
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
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Plano não encontrado</h2>
          <Link to="/consulta">
            <Button>Voltar para consulta</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link to="/consulta">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </Link>
          
          {editingTitle ? (
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg sm:text-2xl font-bold h-10 sm:h-12"
                />
                <Button size="icon" onClick={handleSaveTitle} className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingTitle(false)} className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={editMotto}
                onChange={(e) => setEditMotto(e.target.value)}
                placeholder="Lema (opcional)"
                className="text-muted-foreground h-9 sm:h-10"
              />
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">{plan.title}</h1>
                <Button size="icon" variant="ghost" onClick={() => setEditingTitle(true)} className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              {plan.motto && (
                <p className="text-sm sm:text-base text-muted-foreground italic truncate">"{plan.motto}"</p>
              )}
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={() => setAreasDialogOpen(true)} className="flex-shrink-0">
            <Settings className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Personalizar Áreas</span>
          </Button>
        </div>

        <LifePlanTable
          goals={goals}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          onAddGoal={handleAddGoal}
          lifePlanId={plan.id}
          editable={true}
        />

        {/* Areas Customization Dialog */}
        <Dialog open={areasDialogOpen} onOpenChange={setAreasDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Personalizar Áreas do Plano</DialogTitle>
            </DialogHeader>
            <AreaCustomizationEditor
              areas={areaConfigs}
              onAreasChange={setAreaConfigs}
              isOpen={areasOpen}
              onOpenChange={setAreasOpen}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAreasDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveAreaConfigs}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pencil, Save, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAreaCustomizations } from '@/hooks/useAreaCustomizations';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Goal {
  id: string;
  life_plan_id: string;
  period_year: number;
  age: number;
  area: LifeArea;
  goal_text: string;
  is_completed: boolean;
}

interface LifePlanTableProps {
  goals: Goal[];
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  lifePlanId: string;
  editable?: boolean;
}

interface PeriodRow {
  year: number;
  age: number;
  goals: Record<LifeArea, Goal | null>;
}

export function LifePlanTable({ goals, onUpdateGoal, onDeleteGoal, onAddGoal, lifePlanId, editable = false }: LifePlanTableProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingRow, setAddingRow] = useState(false);
  const [newRowYear, setNewRowYear] = useState(new Date().getFullYear());
  const [newRowAge, setNewRowAge] = useState(30);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const [addGoalDialog, setAddGoalDialog] = useState<{ year: number; age: number; area: LifeArea } | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const { toast } = useToast();
  const { getAreaLabel, getAreaColor } = useAreaCustomizations();

  // Group goals by period
  const periodsMap = new Map<string, PeriodRow>();
  goals.forEach((goal) => {
    const key = `${goal.period_year}-${goal.age}`;
    if (!periodsMap.has(key)) {
      periodsMap.set(key, {
        year: goal.period_year,
        age: goal.age,
        goals: {
          espiritual: null, intelectual: null, familiar: null, social: null,
          financeiro: null, profissional: null, saude: null,
        },
      });
    }
    const period = periodsMap.get(key)!;
    period.goals[goal.area as LifeArea] = goal;
  });

  const periods = Array.from(periodsMap.values()).sort((a, b) => a.year - b.year);

  const handleStartEdit = (goal: Goal) => {
    setEditingCell(goal.id);
    setEditValue(goal.goal_text);
  };

  const handleSaveEdit = async (goalId: string) => {
    await onUpdateGoal(goalId, { goal_text: editValue });
    setEditingCell(null);
    setEditValue('');
    toast({ title: 'Meta atualizada!' });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleToggleComplete = async (goal: Goal) => {
    await onUpdateGoal(goal.id, { is_completed: !goal.is_completed });
    toast({ 
      title: goal.is_completed ? 'Check-in removido' : 'Check-in realizado!',
      description: goal.is_completed ? 'Meta desmarcada' : 'Parabéns por alcançar sua meta!'
    });
  };

  const handleAddGoalConfirm = async () => {
    if (!addGoalDialog) return;
    await onAddGoal({
      life_plan_id: lifePlanId,
      period_year: addGoalDialog.year,
      age: addGoalDialog.age,
      area: addGoalDialog.area,
      goal_text: newGoalText,
      is_completed: false,
    });
    toast({ title: 'Meta adicionada!' });
    setAddGoalDialog(null);
    setNewGoalText('');
  };

  const handleConfirmAddRow = async () => {
    for (const area of LIFE_AREAS) {
      await onAddGoal({
        life_plan_id: lifePlanId,
        period_year: newRowYear,
        age: newRowAge,
        area: area.id,
        goal_text: '',
        is_completed: false,
      });
    }
    setAddingRow(false);
    toast({ title: 'Período adicionado!' });
  };

  const togglePeriod = (key: string) => {
    const newExpanded = new Set(expandedPeriods);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedPeriods(newExpanded);
  };

  const getCompletedCount = (period: PeriodRow) => {
    return LIFE_AREAS.filter(area => period.goals[area.id]?.is_completed).length;
  };

  // Mobile card view
  const MobileView = () => (
    <div className="space-y-3 md:hidden">
      {periods.map((period) => {
        const key = `${period.year}-${period.age}`;
        const isExpanded = expandedPeriods.has(key);
        const completedCount = getCompletedCount(period);

        return (
          <Collapsible key={key} open={isExpanded} onOpenChange={() => togglePeriod(key)}>
            <Card className="shadow-md">
              <CollapsibleTrigger asChild>
                <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">{period.year}</div>
                        <div className="text-xs text-muted-foreground">{period.age} anos</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{completedCount}/7 metas</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 px-3 pb-3 space-y-2">
                  {LIFE_AREAS.map((area) => {
                    const goal = period.goals[area.id];
                    const isEditing = goal && editingCell === goal.id;
                    const areaColor = getAreaColor(area.id);

                    return (
                      <div key={area.id} className="rounded-lg p-3" style={{ backgroundColor: `${areaColor}20` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: areaColor }} />
                            <span className="text-sm font-medium text-foreground">{getAreaLabel(area.id)}</span>
                          </div>
                          {goal && <Checkbox checked={goal.is_completed} onCheckedChange={() => handleToggleComplete(goal)} className="h-5 w-5" />}
                        </div>
                        
                        {goal ? (
                          isEditing ? (
                            <div className="space-y-2">
                              <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} maxLength={1000} className="text-sm bg-background min-h-[80px]" />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveEdit(goal.id)}><Save className="w-3 h-3 mr-1" />Salvar</Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-sm text-foreground flex-1 whitespace-pre-wrap", goal.is_completed && "line-through opacity-70")}>
                                {goal.goal_text || <span className="italic text-muted-foreground">Sem meta definida</span>}
                              </p>
                              {editable && (
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button size="icon" variant="ghost" onClick={() => handleStartEdit(goal)} className="h-7 w-7"><Pencil className="w-3 h-3" /></Button>
                                  <Button size="icon" variant="ghost" onClick={() => onDeleteGoal(goal.id)} className="h-7 w-7"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                                </div>
                              )}
                            </div>
                          )
                        ) : editable && (
                          <Button variant="ghost" size="sm" className="w-full text-muted-foreground h-8 text-xs" onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: area.id }); setNewGoalText(''); }}>
                            <Plus className="w-3 h-3 mr-1" />Adicionar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
      {periods.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma meta cadastrada ainda</CardContent></Card>}
    </div>
  );

  // Desktop table view
  const DesktopView = () => (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-border shadow-md">
      <table className="w-full">
        <thead>
          <tr className="gradient-hero">
            <th className="text-primary-foreground font-semibold text-left px-4 py-3 w-24">Período</th>
            <th className="text-primary-foreground font-semibold text-left px-4 py-3 w-16">Idade</th>
            {LIFE_AREAS.map((area) => (
              <th key={area.id} className="font-semibold text-foreground text-left px-3 py-3 min-w-[150px]" style={{ backgroundColor: `${getAreaColor(area.id)}30` }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getAreaColor(area.id) }} />
                  {getAreaLabel(area.id)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={`${period.year}-${period.age}`} className="hover:bg-muted/50 border-t border-border">
              <td className="font-medium text-foreground px-4 py-3">{period.year}</td>
              <td className="font-medium text-foreground px-4 py-3">{period.age}</td>
              {LIFE_AREAS.map((area) => {
                const goal = period.goals[area.id];
                const isEditing = goal && editingCell === goal.id;
                
                return (
                  <td key={area.id} className="p-2" style={{ backgroundColor: `${getAreaColor(area.id)}15` }}>
                    {goal ? (
                      <div className="space-y-2">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} maxLength={1000} className="text-sm bg-background min-h-[80px]" />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleSaveEdit(goal.id)}><Save className="w-3 h-3" /></Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit}><X className="w-3 h-3" /></Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Checkbox checked={goal.is_completed} onCheckedChange={() => handleToggleComplete(goal)} className="mt-1" />
                            <div className="flex-1">
                              <p className={cn("text-sm text-foreground whitespace-pre-wrap", goal.is_completed && "line-through opacity-70")}>
                                {goal.goal_text || <span className="italic text-muted-foreground">Sem meta definida</span>}
                              </p>
                            </div>
                            {editable && (
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => handleStartEdit(goal)}><Pencil className="w-3 h-3" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => onDeleteGoal(goal.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : editable && (
                      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: area.id }); setNewGoalText(''); }}>
                        <Plus className="w-4 h-4 mr-1" />Adicionar
                      </Button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {periods.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">Nenhuma meta cadastrada ainda</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <MobileView />
      <DesktopView />

      {editable && (
        <div className="flex items-center gap-4">
          {addingRow ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-card rounded-lg border w-full sm:w-auto">
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className="text-xs text-muted-foreground">Ano</label>
                  <Input type="number" value={newRowYear} onChange={(e) => setNewRowYear(parseInt(e.target.value))} className="w-full sm:w-24 h-10" />
                </div>
                <div className="flex-1 sm:flex-initial">
                  <label className="text-xs text-muted-foreground">Idade</label>
                  <Input type="number" value={newRowAge} onChange={(e) => setNewRowAge(parseInt(e.target.value))} className="w-full sm:w-20 h-10" />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleConfirmAddRow} className="flex-1 sm:flex-initial h-10">Confirmar</Button>
                <Button variant="ghost" onClick={() => setAddingRow(false)} className="flex-1 sm:flex-initial h-10">Cancelar</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setAddingRow(true)} variant="outline" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />Adicionar Período
            </Button>
          )}
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={!!addGoalDialog} onOpenChange={(open) => !open && setAddGoalDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Meta - {addGoalDialog && getAreaLabel(addGoalDialog.area)}</DialogTitle>
          </DialogHeader>
          <Textarea value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} placeholder="Digite sua meta (até 1000 caracteres)" maxLength={1000} className="min-h-[120px]" />
          <p className="text-xs text-muted-foreground">{newGoalText.length}/1000 caracteres</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddGoalDialog(null)}>Cancelar</Button>
            <Button onClick={handleAddGoalConfirm}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

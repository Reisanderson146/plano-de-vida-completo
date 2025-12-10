import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pencil, Plus, Trash2, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePlanAreaCustomizations } from '@/hooks/usePlanAreaCustomizations';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addingRow, setAddingRow] = useState(false);
  const [newRowYear, setNewRowYear] = useState(new Date().getFullYear());
  const [newRowAge, setNewRowAge] = useState(30);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));
  const [addGoalDialog, setAddGoalDialog] = useState<{ year: number; age: number; area: LifeArea } | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const { toast } = useToast();
  const { getAreaLabel, getAreaColor } = usePlanAreaCustomizations(lifePlanId);

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
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    await onUpdateGoal(editingCell, { goal_text: editValue });
    setEditingCell(null);
    setEditValue('');
    setEditDialogOpen(false);
    toast({ title: 'Meta atualizada!' });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
    setEditDialogOpen(false);
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
    setExpandedYears(prev => new Set([...prev, newRowYear]));
    toast({ title: 'Período adicionado!' });
  };

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const expandAll = () => {
    setExpandedYears(new Set(periods.map(p => p.year)));
  };

  const collapseAll = () => {
    setExpandedYears(new Set());
  };

  const getCompletedCount = (period: PeriodRow) => {
    return LIFE_AREAS.filter(area => period.goals[area.id]?.is_completed).length;
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Goal Cell Component
  const GoalCell = ({ goal, areaId, period }: { goal: Goal | null; areaId: LifeArea; period: PeriodRow }) => {
    const areaColor = getAreaColor(areaId);
    
    if (!goal) {
      return editable ? (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full h-full min-h-[60px] text-muted-foreground hover:bg-muted/50 border-2 border-dashed border-muted-foreground/20" 
          onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: areaId }); setNewGoalText(''); }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      ) : (
        <div className="h-full min-h-[60px] flex items-center justify-center text-muted-foreground text-sm italic">
          Sem meta
        </div>
      );
    }

    const hasLongText = goal.goal_text && goal.goal_text.length > 80;

    return (
      <div className="h-full min-h-[60px] flex flex-col justify-between p-2 gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Checkbox 
            checked={goal.is_completed} 
            onCheckedChange={() => handleToggleComplete(goal)} 
            className="mt-0.5 flex-shrink-0"
            style={{ borderColor: areaColor }}
          />
          <div className="flex-1 min-w-0">
            {hasLongText ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={cn(
                      "text-sm text-foreground cursor-help line-clamp-3",
                      goal.is_completed && "line-through opacity-60"
                    )}>
                      {goal.goal_text || <span className="italic text-muted-foreground">Sem meta definida</span>}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] p-3">
                    <p className="text-sm whitespace-pre-wrap">{goal.goal_text}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className={cn(
                "text-sm text-foreground line-clamp-3",
                goal.is_completed && "line-through opacity-60"
              )}>
                {goal.goal_text || <span className="italic text-muted-foreground">Sem meta definida</span>}
              </p>
            )}
          </div>
        </div>
        
        {editable && (
          <div className="flex gap-1 justify-end opacity-60 hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(goal)} className="h-6 w-6">
              <Pencil className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDeleteGoal(goal.id)} className="h-6 w-6 hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Year Card Component (separates each year)
  const YearCard = ({ period }: { period: PeriodRow }) => {
    const isExpanded = expandedYears.has(period.year);
    const completedCount = getCompletedCount(period);
    const progressPercent = Math.round((completedCount / 7) * 100);

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleYear(period.year)}>
        <Card className="shadow-md overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-xl font-bold text-foreground">{period.year}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{period.age} anos</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{completedCount}/7</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="sm:hidden text-sm text-muted-foreground">{completedCount}/7</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="p-0">
              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-7 border-t border-border">
                {LIFE_AREAS.map((area) => (
                  <div key={area.id} className="border-r last:border-r-0 border-border">
                    <div 
                      className="px-2 py-2 text-center font-medium text-sm border-b border-border"
                      style={{ backgroundColor: `${getAreaColor(area.id)}25` }}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getAreaColor(area.id) }} />
                        <span className="truncate">{getAreaLabel(area.id)}</span>
                      </div>
                    </div>
                    <div 
                      className="min-h-[100px]" 
                      style={{ backgroundColor: `${getAreaColor(area.id)}08` }}
                    >
                      <GoalCell goal={period.goals[area.id]} areaId={area.id} period={period} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile List */}
              <div className="md:hidden divide-y divide-border">
                {LIFE_AREAS.map((area) => {
                  const goal = period.goals[area.id];
                  const areaColor = getAreaColor(area.id);

                  return (
                    <div key={area.id} className="p-3" style={{ backgroundColor: `${areaColor}10` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: areaColor }} />
                          <span className="text-sm font-medium text-foreground">{getAreaLabel(area.id)}</span>
                        </div>
                        {goal && (
                          <Checkbox 
                            checked={goal.is_completed} 
                            onCheckedChange={() => handleToggleComplete(goal)} 
                            className="h-5 w-5"
                          />
                        )}
                      </div>
                      
                      {goal ? (
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm text-foreground flex-1",
                            goal.is_completed && "line-through opacity-60"
                          )}>
                            {goal.goal_text || <span className="italic text-muted-foreground">Sem meta definida</span>}
                          </p>
                          {editable && (
                            <div className="flex gap-1 flex-shrink-0">
                              <Button size="icon" variant="ghost" onClick={() => handleStartEdit(goal)} className="h-7 w-7">
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => onDeleteGoal(goal.id)} className="h-7 w-7">
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : editable && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-muted-foreground h-8 text-xs border border-dashed border-muted-foreground/30" 
                          onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: area.id }); setNewGoalText(''); }}
                        >
                          <Plus className="w-3 h-3 mr-1" />Adicionar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      {periods.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs">
            <ChevronDown className="w-3 h-3 mr-1" />
            Expandir todos
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs">
            <ChevronUp className="w-3 h-3 mr-1" />
            Recolher todos
          </Button>
        </div>
      )}

      {/* Year Cards */}
      <div className="space-y-4">
        {periods.map((period) => (
          <YearCard key={`${period.year}-${period.age}`} period={period} />
        ))}
        
        {periods.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma meta cadastrada ainda</p>
              {editable && (
                <Button onClick={() => setAddingRow(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar primeiro período
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Period */}
      {editable && periods.length > 0 && (
        <div className="flex items-center gap-4">
          {addingRow ? (
            <Card className="w-full">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-4">
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
              </CardContent>
            </Card>
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
            <DialogTitle>
              Adicionar Meta - {addGoalDialog && getAreaLabel(addGoalDialog.area)}
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {addGoalDialog && `${addGoalDialog.year} • ${addGoalDialog.age} anos`}
              </span>
            </DialogTitle>
          </DialogHeader>
          <Textarea 
            value={newGoalText} 
            onChange={(e) => setNewGoalText(e.target.value)} 
            placeholder="Descreva sua meta para esta área..." 
            maxLength={1000} 
            className="min-h-[150px]" 
          />
          <p className="text-xs text-muted-foreground">{newGoalText.length}/1000 caracteres</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddGoalDialog(null)}>Cancelar</Button>
            <Button onClick={handleAddGoalConfirm}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <Textarea 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)} 
            placeholder="Descreva sua meta..." 
            maxLength={1000} 
            className="min-h-[150px]" 
          />
          <p className="text-xs text-muted-foreground">{editValue.length}/1000 caracteres</p>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

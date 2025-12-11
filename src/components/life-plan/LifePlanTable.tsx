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
  goals: Record<LifeArea, Goal[]>;
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

  // Group goals by period - now supporting multiple goals per area
  const periodsMap = new Map<string, PeriodRow>();
  goals.forEach((goal) => {
    const key = `${goal.period_year}-${goal.age}`;
    if (!periodsMap.has(key)) {
      periodsMap.set(key, {
        year: goal.period_year,
        age: goal.age,
        goals: {
          espiritual: [], intelectual: [], familiar: [], social: [],
          financeiro: [], profissional: [], saude: [],
        },
      });
    }
    const period = periodsMap.get(key)!;
    period.goals[goal.area as LifeArea].push(goal);
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
    if (!addGoalDialog || !newGoalText.trim()) return;
    await onAddGoal({
      life_plan_id: lifePlanId,
      period_year: addGoalDialog.year,
      age: addGoalDialog.age,
      area: addGoalDialog.area,
      goal_text: newGoalText.trim(),
      is_completed: false,
    });
    toast({ title: 'Meta adicionada!' });
    setAddGoalDialog(null);
    setNewGoalText('');
  };

  const handleConfirmAddRow = async () => {
    // Just create the period structure - no empty goals needed
    setAddingRow(false);
    setExpandedYears(prev => new Set([...prev, newRowYear]));
    // Add one empty goal per area to create the period
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

  // Calculate progress for a period - now counts all goals
  const getProgressStats = (period: PeriodRow) => {
    let totalGoals = 0;
    let completedGoals = 0;
    
    LIFE_AREAS.forEach(area => {
      const areaGoals = period.goals[area.id];
      areaGoals.forEach(goal => {
        if (goal.goal_text.trim()) { // Only count goals with text
          totalGoals++;
          if (goal.is_completed) completedGoals++;
        }
      });
    });
    
    return { totalGoals, completedGoals };
  };

  // Calculate progress for a specific area
  const getAreaProgress = (areaGoals: Goal[]) => {
    const goalsWithText = areaGoals.filter(g => g.goal_text.trim());
    if (goalsWithText.length === 0) return null;
    const completed = goalsWithText.filter(g => g.is_completed).length;
    return { completed, total: goalsWithText.length, percent: Math.round((completed / goalsWithText.length) * 100) };
  };

  // Goal List Component for an area
  const GoalList = ({ areaGoals, areaId, period }: { areaGoals: Goal[]; areaId: LifeArea; period: PeriodRow }) => {
    const areaColor = getAreaColor(areaId);
    const goalsWithText = areaGoals.filter(g => g.goal_text.trim());
    const progress = getAreaProgress(areaGoals);
    
    return (
      <div className="h-full min-h-[80px] flex flex-col p-2 gap-1">
        {/* Progress indicator for area */}
        {progress && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300" 
                style={{ width: `${progress.percent}%`, backgroundColor: areaColor }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress.percent}%</span>
          </div>
        )}

        {/* List of goals */}
        <div className="flex-1 space-y-1">
          {goalsWithText.map((goal, index) => (
            <div key={goal.id} className="flex items-start gap-1.5 group">
              <Checkbox 
                checked={goal.is_completed} 
                onCheckedChange={() => handleToggleComplete(goal)} 
                className="mt-0.5 flex-shrink-0 h-4 w-4"
                style={{ borderColor: areaColor }}
              />
              <div className="flex-1 min-w-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={cn(
                        "text-xs text-foreground cursor-help line-clamp-2",
                        goal.is_completed && "line-through opacity-60"
                      )}>
                        <span className="font-medium text-muted-foreground">{index + 1}º </span>
                        {goal.goal_text}
                      </p>
                    </TooltipTrigger>
                    {goal.goal_text.length > 50 && (
                      <TooltipContent side="top" className="max-w-[300px] p-3">
                        <p className="text-sm whitespace-pre-wrap">{goal.goal_text}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              {editable && (
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => handleStartEdit(goal)} className="h-5 w-5">
                    <Pencil className="w-2.5 h-2.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDeleteGoal(goal.id)} className="h-5 w-5 hover:text-destructive">
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {goalsWithText.length === 0 && !editable && (
            <p className="text-xs italic text-muted-foreground">Sem metas</p>
          )}
        </div>

        {/* Add goal button */}
        {editable && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-6 text-xs text-muted-foreground hover:bg-muted/50 border border-dashed border-muted-foreground/20 mt-1" 
            onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: areaId }); setNewGoalText(''); }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar meta
          </Button>
        )}
      </div>
    );
  };

  // Mobile Goal List Component
  const MobileGoalList = ({ areaGoals, areaId, period }: { areaGoals: Goal[]; areaId: LifeArea; period: PeriodRow }) => {
    const areaColor = getAreaColor(areaId);
    const goalsWithText = areaGoals.filter(g => g.goal_text.trim());
    const progress = getAreaProgress(areaGoals);

    return (
      <div className="p-3" style={{ backgroundColor: `${areaColor}10` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: areaColor }} />
            <span className="text-sm font-medium text-foreground">{getAreaLabel(areaId)}</span>
          </div>
          {progress && (
            <span className="text-xs text-muted-foreground">{progress.completed}/{progress.total} ({progress.percent}%)</span>
          )}
        </div>

        <div className="space-y-2">
          {goalsWithText.map((goal, index) => (
            <div key={goal.id} className="flex items-start gap-2">
              <Checkbox 
                checked={goal.is_completed} 
                onCheckedChange={() => handleToggleComplete(goal)} 
                className="mt-0.5 h-5 w-5"
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm text-foreground",
                  goal.is_completed && "line-through opacity-60"
                )}>
                  <span className="font-medium text-muted-foreground">{index + 1}º </span>
                  {goal.goal_text}
                </p>
              </div>
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
          ))}
          
          {goalsWithText.length === 0 && !editable && (
            <p className="text-sm italic text-muted-foreground">Sem metas definidas</p>
          )}
          
          {editable && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground h-8 text-xs border border-dashed border-muted-foreground/30" 
              onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: areaId }); setNewGoalText(''); }}
            >
              <Plus className="w-3 h-3 mr-1" />Adicionar meta
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Year Card Component
  const YearCard = ({ period }: { period: PeriodRow }) => {
    const isExpanded = expandedYears.has(period.year);
    const { totalGoals, completedGoals } = getProgressStats(period);
    const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleYear(period.year)}>
        <Card className="overflow-hidden border-border/40">
          <CollapsibleTrigger asChild>
            <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/30 transition-all duration-200 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-foreground">{period.year}</span>
                      <div className="flex items-center gap-1 text-muted-foreground sm:hidden">
                        <User className="w-3 h-3" />
                        <span className="text-xs">{period.age} anos</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{period.age} anos</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="w-28 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 rounded-full" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {totalGoals > 0 ? `${completedGoals}/${totalGoals}` : '0'} metas
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="sm:hidden text-sm font-medium text-muted-foreground">
                    {progressPercent}%
                  </span>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isExpanded ? "bg-primary/10" : "bg-muted/50"
                  )}>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
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
                      <GoalList areaGoals={period.goals[area.id]} areaId={area.id} period={period} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile List */}
              <div className="md:hidden divide-y divide-border">
                {LIFE_AREAS.map((area) => (
                  <MobileGoalList key={area.id} areaGoals={period.goals[area.id]} areaId={area.id} period={period} />
                ))}
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
            <Button onClick={handleAddGoalConfirm} disabled={!newGoalText.trim()}>Adicionar</Button>
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

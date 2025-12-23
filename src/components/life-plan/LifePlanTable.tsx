import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pencil, Plus, Trash2, ChevronDown, ChevronUp, Calendar, User, CheckCircle2, X, LayoutGrid, List, Filter, Target, AlertTriangle, Bell } from 'lucide-react';
import { LIFE_AREAS, LifeArea, AREA_ICONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanAreaCustomizations } from '@/hooks/usePlanAreaCustomizations';
import { GoalReminderDialog } from '@/components/goals/GoalReminderDialog';
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
  onDeletePeriod?: (year: number) => Promise<void>;
  lifePlanId: string;
  editable?: boolean;
}

interface PeriodRow {
  year: number;
  age: number;
  goals: Record<LifeArea, Goal[]>;
}

export function LifePlanTable({ goals, onUpdateGoal, onDeleteGoal, onAddGoal, onDeletePeriod, lifePlanId, editable = false }: LifePlanTableProps) {
  const [shakingGoalId, setShakingGoalId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addingRow, setAddingRow] = useState(false);
  const [newRowYear, setNewRowYear] = useState(new Date().getFullYear());
  const [newRowAge, setNewRowAge] = useState(30);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [focusMode, setFocusMode] = useState(false);
  const [deletePeriodDialog, setDeletePeriodDialog] = useState<{ year: number; age: number } | null>(null);
  const [addGoalDialog, setAddGoalDialog] = useState<{ year: number; age: number; area: LifeArea } | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [reminderDialog, setReminderDialog] = useState<{ goalId: string; goalText: string } | null>(null);
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

  // Play celebration sound
  const playCelebrationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  const handleToggleComplete = async (goal: Goal) => {
    const wasCompleted = goal.is_completed;
    await onUpdateGoal(goal.id, { is_completed: !goal.is_completed });
    
    // Fire confetti and play sound when completing a goal
    if (!wasCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#4ade80', '#86efac']
      });
      playCelebrationSound();
    } else {
      // Shake animation when unchecking
      setShakingGoalId(goal.id);
      setTimeout(() => setShakingGoalId(null), 400);
    }
    
    toast({ 
      title: wasCompleted ? 'Meta desmarcada' : 'Meta realizada com sucesso!',
      description: wasCompleted ? 'Você pode tentar novamente' : 'Parabéns por alcançar sua meta!'
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

  // Delete period handler
  const handleDeletePeriod = async () => {
    if (!deletePeriodDialog || !onDeletePeriod) return;
    await onDeletePeriod(deletePeriodDialog.year);
    toast({ title: 'Período excluído com sucesso!' });
    setDeletePeriodDialog(null);
  };

  // Get all pending goals for focus mode
  const getAllPendingGoals = () => {
    const pending: Array<{ goal: Goal; areaId: LifeArea; year: number }> = [];
    periods.forEach(period => {
      LIFE_AREAS.forEach(area => {
        period.goals[area.id].forEach(goal => {
          if (goal.goal_text.trim() && !goal.is_completed) {
            pending.push({ goal, areaId: area.id, year: period.year });
          }
        });
      });
    });
    return pending;
  };

  // Get overall stats
  const getOverallStats = () => {
    let totalGoals = 0;
    let completedGoals = 0;
    periods.forEach(period => {
      const stats = getProgressStats(period);
      totalGoals += stats.totalGoals;
      completedGoals += stats.completedGoals;
    });
    return { totalGoals, completedGoals, percent: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0 };
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

  // Filter goals by status
  const filterGoalsByStatus = (goals: Goal[]) => {
    if (statusFilter === 'all') return goals;
    if (statusFilter === 'completed') return goals.filter(g => g.is_completed);
    return goals.filter(g => !g.is_completed);
  };

  // Expanded Goal List Component for horizontal cards - consistent with mobile design
  const GoalListExpanded = ({ areaGoals, areaId, period }: { areaGoals: Goal[]; areaId: LifeArea; period: PeriodRow }) => {
    const areaColor = getAreaColor(areaId);
    const goalsWithText = filterGoalsByStatus(areaGoals.filter(g => g.goal_text.trim()));

    return (
      <div className="space-y-2">
        {/* Goal Cards - matching mobile style */}
        {goalsWithText.map((goal, index) => (
          <div 
            key={goal.id} 
            className={cn(
              "p-4 rounded-xl border transition-all duration-200",
              goal.is_completed 
                ? "bg-success/10 border-success/30" 
                : "bg-card border-border/50 hover:border-border hover:shadow-sm",
              shakingGoalId === goal.id && "animate-shake"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox 
                checked={goal.is_completed} 
                onCheckedChange={() => handleToggleComplete(goal)} 
                className="mt-0.5 h-5 w-5 rounded-md transition-transform hover:scale-110"
                style={{ 
                  borderColor: goal.is_completed ? 'hsl(var(--success))' : areaColor,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm leading-relaxed",
                  goal.is_completed 
                    ? "line-through text-muted-foreground" 
                    : "text-foreground"
                )}>
                  <span 
                    className="font-semibold"
                    style={{ color: goal.is_completed ? 'hsl(var(--muted-foreground))' : areaColor }}
                  >
                    {index + 1}º{' '}
                  </span>
                  {goal.goal_text}
                </p>
              </div>
            </div>
            {editable && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setReminderDialog({ goalId: goal.id, goalText: goal.goal_text })}
                  className="flex-1 h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Bell className="w-3 h-3 mr-1.5" />
                  Lembrete
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleStartEdit(goal)} 
                  className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="w-3 h-3 mr-1.5" />
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDeleteGoal(goal.id)} 
                  className="flex-1 h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1.5" />
                  Excluir
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {goalsWithText.length === 0 && !editable && (
          <div className="text-center py-6">
            <p className="text-sm italic text-muted-foreground">Sem metas definidas</p>
          </div>
        )}

        {goalsWithText.length === 0 && editable && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-2">Nenhuma meta ainda</p>
          </div>
        )}

        {editable && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-10 text-sm font-medium border-dashed border-2 rounded-xl hover:bg-primary/5 transition-colors" 
            style={{ borderColor: `${areaColor}50` }}
            onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: areaId }); setNewGoalText(''); }}
          >
            <Plus className="w-4 h-4 mr-2" style={{ color: areaColor }} />
            Adicionar meta
          </Button>
        )}
      </div>
    );
  };

  // Mobile Goal List Component
  const MobileGoalList = ({ areaGoals, areaId, period }: { areaGoals: Goal[]; areaId: LifeArea; period: PeriodRow }) => {
    const areaColor = getAreaColor(areaId);
    const goalsWithText = filterGoalsByStatus(areaGoals.filter(g => g.goal_text.trim()));
    const progress = getAreaProgress(areaGoals);

    const AreaIcon = AREA_ICONS[areaId as LifeArea];
    
    return (
      <div className="p-4 space-y-3">
        {/* Area Header Card */}
        <div 
          className="p-4 rounded-2xl"
          style={{ backgroundColor: `${areaColor}15` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" 
                style={{ backgroundColor: areaColor }}
              >
                <AreaIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-bold text-foreground">{getAreaLabel(areaId)}</span>
            </div>
            {progress && (
              <span 
                className="text-sm font-bold px-3 py-1 rounded-lg text-white"
                style={{ backgroundColor: areaColor }}
              >
                {progress.percent}%
              </span>
            )}
          </div>
          
          {progress && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">{progress.completed}/{progress.total} metas</p>
              <div className="w-full h-2.5 bg-background/80 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full" 
                  style={{ 
                    width: `${progress.percent}%`, 
                    backgroundColor: areaColor
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Goal Cards */}
        <div className="space-y-2">
          {goalsWithText.map((goal, index) => (
            <div 
              key={goal.id} 
              className={cn(
                "p-4 rounded-xl border transition-all duration-200",
                goal.is_completed 
                  ? "bg-success/10 border-success/30" 
                  : "bg-card border-border/50 hover:border-border",
                shakingGoalId === goal.id && "animate-shake"
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={goal.is_completed} 
                  onCheckedChange={() => handleToggleComplete(goal)} 
                  className="mt-0.5 h-5 w-5 rounded-md transition-transform hover:scale-110"
                  style={{ 
                    borderColor: goal.is_completed ? 'hsl(var(--success))' : areaColor,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm leading-relaxed",
                    goal.is_completed 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                  )}>
                    <span 
                      className="font-semibold"
                      style={{ color: goal.is_completed ? 'hsl(var(--muted-foreground))' : areaColor }}
                    >
                      {index + 1}º{' '}
                    </span>
                    {goal.goal_text}
                  </p>
                </div>
              </div>
              {editable && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleStartEdit(goal)} 
                    className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="w-3 h-3 mr-1.5" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onDeleteGoal(goal.id)} 
                    className="flex-1 h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {goalsWithText.length === 0 && !editable && (
            <div className="p-4 rounded-xl border border-dashed border-border/50 text-center">
              <p className="text-sm italic text-muted-foreground">Sem metas definidas</p>
            </div>
          )}
          
          {editable && (
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12 text-sm font-medium border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-xl" 
              onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: areaId }); setNewGoalText(''); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar meta
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
                <div className="flex items-center gap-2">
                  <span className="sm:hidden text-sm font-medium text-muted-foreground">
                    {progressPercent}%
                  </span>
                  {editable && onDeletePeriod && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletePeriodDialog({ year: period.year, age: period.age });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
          
          <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
            <CardContent className="p-0 animate-fade-in">
              {/* Desktop/Tablet: Grid View (Horizontal Scroll Cards) */}
              {viewMode === 'grid' && (
                <div className="hidden md:block border-t border-border">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    <div className="flex gap-4 p-4 min-w-max">
                      {LIFE_AREAS.map((area) => {
                        const progress = getAreaProgress(period.goals[area.id]);
                        const AreaIcon = AREA_ICONS[area.id as LifeArea];
                        return (
                          <div 
                            key={area.id} 
                            className="w-[280px] flex-shrink-0 rounded-2xl border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card"
                            style={{ backgroundColor: `${getAreaColor(area.id)}05` }}
                          >
                            {/* Area Header */}
                            <div 
                              className="px-4 py-4 border-b border-border/20 relative overflow-hidden"
                              style={{ backgroundColor: `${getAreaColor(area.id)}12` }}
                            >
                              {/* Decorative gradient */}
                              <div 
                                className="absolute inset-0 opacity-30"
                                style={{ background: `linear-gradient(135deg, ${getAreaColor(area.id)}40 0%, transparent 50%)` }}
                              />
                              {/* Icon background decoration */}
                              <div 
                                className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
                                style={{ backgroundColor: getAreaColor(area.id) }}
                              />
                              <div className="relative">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover/card:scale-110" 
                                    style={{ backgroundColor: getAreaColor(area.id) }}
                                  >
                                    <AreaIcon className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="font-bold text-foreground text-base">{getAreaLabel(area.id)}</span>
                                </div>
                                {progress && (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                      <span className="font-medium">{progress.completed}/{progress.total} metas</span>
                                      <span 
                                        className="font-bold px-2.5 py-0.5 rounded-full text-white text-[11px] shadow-sm"
                                        style={{ backgroundColor: getAreaColor(area.id) }}
                                      >
                                        {progress.percent}%
                                      </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-background/60 rounded-full overflow-hidden shadow-inner">
                                      <div 
                                        className="h-full transition-all duration-500 rounded-full shadow-sm" 
                                        style={{ 
                                          width: `${progress.percent}%`, 
                                          background: `linear-gradient(90deg, ${getAreaColor(area.id)}, ${getAreaColor(area.id)}cc)`
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Goals List */}
                            <div className="p-4 min-h-[180px] max-h-[320px] overflow-y-auto">
                              <GoalListExpanded areaGoals={period.goals[area.id]} areaId={area.id} period={period} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Scroll indicator */}
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground border-t border-border/30">
                    <span>← Deslize para ver mais áreas →</span>
                  </div>
                </div>
              )}

              {/* Desktop/Tablet: List View */}
              {viewMode === 'list' && (
                <div className="hidden md:block border-t border-border divide-y divide-border">
                  {LIFE_AREAS.map((area) => {
                    const progress = getAreaProgress(period.goals[area.id]);
                    const AreaIcon = AREA_ICONS[area.id as LifeArea];
                    const goalsWithText = filterGoalsByStatus(period.goals[area.id].filter(g => g.goal_text.trim()));
                    
                    return (
                      <div 
                        key={area.id} 
                        className="p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Area Info */}
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
                            style={{ backgroundColor: getAreaColor(area.id) }}
                          >
                            <AreaIcon className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-foreground">{getAreaLabel(area.id)}</span>
                              {progress && (
                                <div className="flex items-center gap-3">
                                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full transition-all duration-500 rounded-full" 
                                      style={{ 
                                        width: `${progress.percent}%`, 
                                        backgroundColor: getAreaColor(area.id)
                                      }}
                                    />
                                  </div>
                                  <span 
                                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: getAreaColor(area.id) }}
                                  >
                                    {progress.percent}%
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Goals inline */}
                            <div className="space-y-1.5">
                              {goalsWithText.map((goal, index) => (
                                <div key={goal.id} className="flex items-center gap-2 group">
                                  <Checkbox 
                                    checked={goal.is_completed} 
                                    onCheckedChange={() => handleToggleComplete(goal)} 
                                    className="h-4 w-4"
                                    style={{ borderColor: getAreaColor(area.id) }}
                                  />
                                  <span className={cn(
                                    "text-sm flex-1",
                                    goal.is_completed && "line-through opacity-60"
                                  )}>
                                    <span className="font-medium text-muted-foreground">{index + 1}º </span>
                                    {goal.goal_text}
                                  </span>
                                  {editable && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleStartEdit(goal)} 
                                        className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => onDeleteGoal(goal.id)} 
                                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
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
                                  className="h-7 text-xs text-muted-foreground hover:text-primary" 
                                  onClick={() => { setAddGoalDialog({ year: period.year, age: period.age, area: area.id }); setNewGoalText(''); }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Adicionar meta
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

  const overallStats = getOverallStats();
  const pendingGoals = getAllPendingGoals();

  // Focus Mode Component
  const FocusModeView = () => {
    if (pendingGoals.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Todas as metas realizadas!</h3>
          <p className="text-muted-foreground">Parabéns! Você completou todas as suas metas.</p>
          <Button onClick={() => setFocusMode(false)} className="mt-4">
            Voltar à visualização normal
          </Button>
        </Card>
      );
    }

    const currentGoal = pendingGoals[0];
    const AreaIcon = AREA_ICONS[currentGoal.areaId];

    return (
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold">Modo Foco</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFocusMode(false)}>
              <X className="w-4 h-4 mr-1" />
              Sair
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {pendingGoals.length} meta{pendingGoals.length > 1 ? 's' : ''} pendente{pendingGoals.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: getAreaColor(currentGoal.areaId) }}
            >
              <AreaIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">{getAreaLabel(currentGoal.areaId)}</p>
              <p className="text-sm text-muted-foreground">{currentGoal.year}</p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 mb-6">
            <p className="text-foreground leading-relaxed">{currentGoal.goal.goal_text}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="flex-1 h-12" 
              onClick={() => handleToggleComplete(currentGoal.goal)}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Marcar como Realizada
            </Button>
            {pendingGoals.length > 1 && (
              <Button variant="outline" className="h-12" onClick={() => {
                // Move to next goal by shuffling array
                const shuffled = [...pendingGoals];
                shuffled.push(shuffled.shift()!);
              }}>
                Pular
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (focusMode) {
    return <FocusModeView />;
  }

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      {periods.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {overallStats.completedGoals}/{overallStats.totalGoals} metas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${overallStats.percent}%` }}
                />
              </div>
              <span className="text-lg font-bold text-primary">{overallStats.percent}%</span>
              {pendingGoals.length > 0 && (
                <Button 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => setFocusMode(true)}
                >
                  <Target className="w-4 h-4" />
                  Modo Foco
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      {periods.length > 0 && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3 gap-1.5"
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3 gap-1.5"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Filter className="w-4 h-4" />
                {statusFilter === 'all' ? 'Todas' : statusFilter === 'completed' ? 'Realizadas' : 'Pendentes'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Todas as metas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                Realizadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                <X className="w-4 h-4 mr-2 text-muted-foreground" />
                Pendentes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Expand/Collapse */}
          {periods.length > 1 && (
            <div className="flex items-center gap-2 ml-auto">
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
        <div className="mt-2">
          {addingRow ? (
            <Card className="w-full border-dashed border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 animate-fade-in overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Header section */}
                  <div className="bg-primary/10 px-5 py-4 flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-primary/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Novo Período</h4>
                      <p className="text-xs text-muted-foreground">Adicione um novo ano ao plano</p>
                    </div>
                  </div>
                  
                  {/* Form section */}
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 p-5">
                    <div className="flex gap-4 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-initial">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ano</label>
                        <Input 
                          type="number" 
                          value={newRowYear} 
                          onChange={(e) => setNewRowYear(parseInt(e.target.value))} 
                          className="w-full sm:w-28 h-11 rounded-xl text-center font-semibold bg-background border-border/60 focus:border-primary" 
                        />
                      </div>
                      <div className="flex-1 sm:flex-initial">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Idade</label>
                        <Input 
                          type="number" 
                          value={newRowAge} 
                          onChange={(e) => setNewRowAge(parseInt(e.target.value))} 
                          className="w-full sm:w-24 h-11 rounded-xl text-center font-semibold bg-background border-border/60 focus:border-primary" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                      <Button 
                        onClick={handleConfirmAddRow} 
                        className="flex-1 sm:flex-initial h-11 rounded-xl px-6 gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setAddingRow(false)} 
                        className="flex-1 sm:flex-initial h-11 rounded-xl px-4 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        <X className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Cancelar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              onClick={() => setAddingRow(true)} 
              variant="outline" 
              className="w-full sm:w-auto h-12 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 gap-2 text-muted-foreground hover:text-primary transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Adicionar Período
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

      {/* Delete Period Confirmation Dialog */}
      <Dialog open={!!deletePeriodDialog} onOpenChange={(open) => !open && setDeletePeriodDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Excluir Período
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground">
              Tem certeza que deseja excluir o período <strong>{deletePeriodDialog?.year}</strong> ({deletePeriodDialog?.age} anos)?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Todas as metas deste período serão excluídas permanentemente. Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletePeriodDialog(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeletePeriod}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Período
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Reminder Dialog */}
      {reminderDialog && (
        <GoalReminderDialog
          open={!!reminderDialog}
          onOpenChange={(open) => !open && setReminderDialog(null)}
          goalId={reminderDialog.goalId}
          goalText={reminderDialog.goalText}
        />
      )}
    </div>
  );
}

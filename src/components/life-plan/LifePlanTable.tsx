import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react';
import { LIFE_AREAS, AREA_COLORS, LifeArea } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Group goals by period
  const periodsMap = new Map<string, PeriodRow>();
  goals.forEach((goal) => {
    const key = `${goal.period_year}-${goal.age}`;
    if (!periodsMap.has(key)) {
      periodsMap.set(key, {
        year: goal.period_year,
        age: goal.age,
        goals: {
          espiritual: null,
          intelectual: null,
          familiar: null,
          social: null,
          financeiro: null,
          profissional: null,
          saude: null,
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

  const handleAddGoal = async (year: number, age: number, area: LifeArea, text: string) => {
    await onAddGoal({
      life_plan_id: lifePlanId,
      period_year: year,
      age,
      area,
      goal_text: text,
      is_completed: false,
    });
    toast({ title: 'Meta adicionada!' });
  };

  const handleAddRow = () => {
    setAddingRow(true);
  };

  const handleConfirmAddRow = async () => {
    // Add empty goals for all areas in the new row
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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="gradient-hero">
              <TableHead className="text-primary-foreground font-semibold w-24">Período</TableHead>
              <TableHead className="text-primary-foreground font-semibold w-16">Idade</TableHead>
              {LIFE_AREAS.map((area) => (
                <TableHead 
                  key={area.id} 
                  className={cn("font-semibold text-foreground min-w-[150px]", AREA_COLORS[area.id])}
                >
                  {area.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => (
              <TableRow key={`${period.year}-${period.age}`} className="hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">{period.year}</TableCell>
                <TableCell className="font-medium text-foreground">{period.age}</TableCell>
                {LIFE_AREAS.map((area) => {
                  const goal = period.goals[area.id];
                  const isEditing = goal && editingCell === goal.id;
                  
                  return (
                    <TableCell 
                      key={area.id} 
                      className={cn("p-2", AREA_COLORS[area.id])}
                    >
                      {goal ? (
                        <div className="space-y-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="text-sm bg-background"
                              />
                              <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(goal.id)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={goal.is_completed}
                                onCheckedChange={() => handleToggleComplete(goal)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className={cn(
                                  "text-sm text-foreground",
                                  goal.is_completed && "line-through opacity-70"
                                )}>
                                  {goal.goal_text || <span className="italic text-muted-foreground">Sem meta definida</span>}
                                </p>
                              </div>
                              {editable && (
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => handleStartEdit(goal)}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => onDeleteGoal(goal.id)}>
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        editable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground"
                            onClick={() => {
                              const text = prompt('Digite a meta:');
                              if (text) handleAddGoal(period.year, period.age, area.id, text);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {periods.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhuma meta cadastrada ainda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editable && (
        <div className="flex items-center gap-4">
          {addingRow ? (
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
              <div>
                <label className="text-sm text-muted-foreground">Ano</label>
                <Input
                  type="number"
                  value={newRowYear}
                  onChange={(e) => setNewRowYear(parseInt(e.target.value))}
                  className="w-24"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Idade</label>
                <Input
                  type="number"
                  value={newRowAge}
                  onChange={(e) => setNewRowAge(parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
              <Button onClick={handleConfirmAddRow}>Confirmar</Button>
              <Button variant="ghost" onClick={() => setAddingRow(false)}>Cancelar</Button>
            </div>
          ) : (
            <Button onClick={handleAddRow} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Período
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

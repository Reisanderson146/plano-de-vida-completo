import { useState } from 'react';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Filter } from 'lucide-react';

interface Goal {
  id: string;
  life_plan_id: string;
  period_year: number;
  age: number;
  area: LifeArea;
  goal_text: string;
  is_completed: boolean;
}

interface TimelineViewProps {
  goals: Goal[];
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
}

export function TimelineView({ goals, onUpdateGoal }: TimelineViewProps) {
  const [selectedArea, setSelectedArea] = useState<string>('all');

  const filteredGoals = goals.filter((g) => {
    if (!g.goal_text.trim()) return false;
    if (selectedArea === 'all') return true;
    return g.area === selectedArea;
  });

  // Group by year
  const goalsByYear = filteredGoals.reduce((acc, goal) => {
    if (!acc[goal.period_year]) {
      acc[goal.period_year] = [];
    }
    acc[goal.period_year].push(goal);
    return acc;
  }, {} as Record<number, Goal[]>);

  const years = Object.keys(goalsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  const getAreaLabel = (areaId: LifeArea) => {
    return LIFE_AREAS.find((a) => a.id === areaId)?.label || areaId;
  };

  const handleToggleGoal = async (goalId: string, currentStatus: boolean) => {
    await onUpdateGoal(goalId, { 
      is_completed: !currentStatus,
      ...(currentStatus ? {} : { completed_at: new Date().toISOString() })
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[180px] h-10 rounded-xl">
            <SelectValue placeholder="Filtrar por área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {LIFE_AREAS.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border" />

        {years.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma meta encontrada</p>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map((year) => {
              const yearGoals = goalsByYear[year];
              const completedCount = yearGoals.filter((g) => g.is_completed).length;
              const totalCount = yearGoals.length;

              return (
                <div key={year} className="relative pl-12 sm:pl-16">
                  {/* Year marker */}
                  <div className="absolute left-0 w-8 sm:w-12 flex items-center justify-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background z-10",
                      completedCount === totalCount
                        ? "border-success bg-success/10"
                        : "border-primary bg-primary/10"
                    )}>
                      {completedCount === totalCount ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Year content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-foreground">{year}</h3>
                      <Badge variant="outline" className="rounded-lg">
                        {completedCount}/{totalCount}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {yearGoals.map((goal, index) => (
                        <div
                          key={goal.id}
                          className={cn(
                            "p-4 rounded-xl border transition-all duration-300 animate-fade-in",
                            goal.is_completed
                              ? "bg-success/5 border-success/30"
                              : "bg-card border-border/40 hover:border-border"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={goal.is_completed}
                              onCheckedChange={() => handleToggleGoal(goal.id, goal.is_completed)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm leading-relaxed",
                                goal.is_completed && "line-through text-muted-foreground"
                              )}>
                                {goal.goal_text}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0 h-5 rounded-md"
                                  style={{
                                    borderColor: AREA_HEX_COLORS[goal.area] + '40',
                                    color: AREA_HEX_COLORS[goal.area],
                                    backgroundColor: AREA_HEX_COLORS[goal.area] + '10',
                                  }}
                                >
                                  {getAreaLabel(goal.area)}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {goal.age} anos
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

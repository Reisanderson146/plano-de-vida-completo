import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Folder, User, Users, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Plan {
  id: string;
  title: string;
  plan_type: string;
  member_name?: string | null;
  notes_count?: number;
}

export const PLAN_TYPE_CONFIG = {
  individual: { label: 'Individual', icon: User },
  familiar: { label: 'Familiar', icon: Users },
  filho: { label: 'Filho(a)', icon: Baby },
};

interface PlanSelectorProps {
  plans: Plan[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  showNotesCount?: boolean;
  className?: string;
}

export function PlanSelector({
  plans,
  value,
  onChange,
  placeholder = "Selecione um plano",
  showAllOption = false,
  allOptionLabel = "Todos os planos",
  showNotesCount = false,
  className,
}: PlanSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full sm:w-[220px] h-11 rounded-xl", className)}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Folder className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <span className="truncate">
            <SelectValue placeholder={placeholder} />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              <span>{allOptionLabel}</span>
            </div>
          </SelectItem>
        )}
        {plans.map(plan => {
          const config = PLAN_TYPE_CONFIG[plan.plan_type as keyof typeof PLAN_TYPE_CONFIG] || PLAN_TYPE_CONFIG.individual;
          const PlanIcon = config.icon;
          return (
            <SelectItem key={plan.id} value={plan.id}>
              <div className="flex items-center gap-2">
                <PlanIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{plan.title}</span>
                {plan.member_name && (
                  <span className="text-muted-foreground truncate">({plan.member_name})</span>
                )}
                {showNotesCount && plan.notes_count && plan.notes_count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 flex-shrink-0">
                    {plan.notes_count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

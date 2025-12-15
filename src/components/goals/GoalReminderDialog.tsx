import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Bell, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useGoalReminders } from '@/hooks/useGoalReminders';

interface GoalReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalText: string;
}

export function GoalReminderDialog({ open, onOpenChange, goalId, goalText }: GoalReminderDialogProps) {
  const { reminders, addReminder, removeReminder, getRemindersForGoal } = useGoalReminders();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const goalReminders = getRemindersForGoal(goalId);

  const handleAddReminder = async () => {
    if (!selectedDate) return;
    
    setIsAddingReminder(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await addReminder(goalId, dateStr, reminderTime + ':00');
    setSelectedDate(undefined);
    setReminderTime('09:00');
    setIsAddingReminder(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Lembretes da Meta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Goal Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground line-clamp-2">{goalText}</p>
          </div>

          {/* Existing Reminders */}
          {goalReminders.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lembretes Agendados</Label>
              <div className="space-y-2">
                {goalReminders.map((reminder) => (
                  <div 
                    key={reminder.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(reminder.reminder_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {reminder.reminder_time.slice(0, 5)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeReminder(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Reminder */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Adicionar Lembrete</Label>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-28"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            onClick={handleAddReminder} 
            disabled={!selectedDate || isAddingReminder}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

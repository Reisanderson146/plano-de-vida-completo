import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface GoalReminder {
  id: string;
  goal_id: string;
  reminder_date: string;
  reminder_time: string;
  is_sent: boolean;
}

export function useGoalReminders(goalId?: string) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<GoalReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user, goalId]);

  const loadReminders = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('goal_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true });

      if (goalId) {
        query = query.eq('goal_id', goalId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading goal reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (goalId: string, reminderDate: string, reminderTime: string = '09:00:00') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goal_reminders')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          reminder_date: reminderDate,
          reminder_time: reminderTime,
        })
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data]);
      toast.success('Lembrete adicionado!');
      return data;
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast.error('Erro ao adicionar lembrete');
      return null;
    }
  };

  const removeReminder = async (reminderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goal_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== reminderId));
      toast.success('Lembrete removido!');
    } catch (error) {
      console.error('Error removing reminder:', error);
      toast.error('Erro ao remover lembrete');
    }
  };

  const updateReminder = async (reminderId: string, reminderDate: string, reminderTime?: string) => {
    if (!user) return;

    try {
      const updateData: { reminder_date: string; reminder_time?: string } = {
        reminder_date: reminderDate,
      };
      
      if (reminderTime) {
        updateData.reminder_time = reminderTime;
      }

      const { data, error } = await supabase
        .from('goal_reminders')
        .update(updateData)
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => prev.map(r => r.id === reminderId ? data : r));
      toast.success('Lembrete atualizado!');
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Erro ao atualizar lembrete');
    }
  };

  const getRemindersForGoal = (goalId: string) => {
    return reminders.filter(r => r.goal_id === goalId);
  };

  return {
    reminders,
    loading,
    addReminder,
    removeReminder,
    updateReminder,
    getRemindersForGoal,
    refetch: loadReminders,
  };
}

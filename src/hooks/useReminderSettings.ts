import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReminderSetting {
  id: string;
  user_id: string;
  reminder_type: 'check_in' | 'deadline' | 'annual_review';
  email_enabled: boolean;
  in_app_enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: Omit<ReminderSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    reminder_type: 'check_in',
    email_enabled: true,
    in_app_enabled: true,
    frequency: 'weekly',
    enabled: true,
  },
  {
    reminder_type: 'deadline',
    email_enabled: true,
    in_app_enabled: true,
    frequency: 'weekly',
    enabled: true,
  },
  {
    reminder_type: 'annual_review',
    email_enabled: true,
    in_app_enabled: true,
    frequency: 'monthly',
    enabled: true,
  },
];

export function useReminderSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading, refetch } = useQuery({
    queryKey: ['reminder-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // If no settings exist, create defaults
      if (!data || data.length === 0) {
        const defaultSettings = DEFAULT_SETTINGS.map(s => ({
          ...s,
          user_id: user.id,
        }));

        const { data: created, error: createError } = await supabase
          .from('reminder_settings')
          .insert(defaultSettings)
          .select();

        if (createError) throw createError;
        return created as ReminderSetting[];
      }

      return data as ReminderSetting[];
    },
    enabled: !!user?.id,
  });

  const updateSetting = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<ReminderSetting> }) => {
      const { error } = await supabase
        .from('reminder_settings')
        .update(params.updates)
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings', user?.id] });
    },
  });

  const getSettingByType = (type: 'check_in' | 'deadline' | 'annual_review') => {
    return settings.find(s => s.reminder_type === type);
  };

  return {
    settings,
    isLoading,
    updateSetting: updateSetting.mutate,
    getSettingByType,
    refetch,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';

export interface AreaCustomization {
  area_id: LifeArea;
  custom_label: string | null;
  custom_color: string | null;
}

export interface CustomizedArea {
  id: LifeArea;
  label: string;
  color: string;
  hexColor: string;
}

export function useAreaCustomizations() {
  const { user } = useAuth();
  const [customizations, setCustomizations] = useState<AreaCustomization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomizations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_area_customizations')
        .select('area_id, custom_label, custom_color')
        .eq('user_id', user.id);

      if (error) throw error;
      setCustomizations((data as AreaCustomization[]) || []);
    } catch (error) {
      console.error('Error fetching area customizations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCustomizations();
  }, [fetchCustomizations]);

  const saveCustomization = async (areaId: LifeArea, label: string | null, color: string | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_area_customizations')
        .upsert({
          user_id: user.id,
          area_id: areaId,
          custom_label: label,
          custom_color: color,
        }, {
          onConflict: 'user_id,area_id'
        });

      if (error) throw error;
      await fetchCustomizations();
    } catch (error) {
      console.error('Error saving area customization:', error);
      throw error;
    }
  };

  const resetCustomization = async (areaId: LifeArea) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_area_customizations')
        .delete()
        .eq('user_id', user.id)
        .eq('area_id', areaId);

      if (error) throw error;
      await fetchCustomizations();
    } catch (error) {
      console.error('Error resetting area customization:', error);
      throw error;
    }
  };

  const getCustomizedAreas = useCallback((): CustomizedArea[] => {
    return LIFE_AREAS.map((area) => {
      const customization = customizations.find((c) => c.area_id === area.id);
      return {
        id: area.id,
        label: customization?.custom_label || area.label,
        color: area.color,
        hexColor: customization?.custom_color || AREA_HEX_COLORS[area.id],
      };
    });
  }, [customizations]);

  const getAreaLabel = useCallback((areaId: LifeArea): string => {
    const customization = customizations.find((c) => c.area_id === areaId);
    const defaultArea = LIFE_AREAS.find((a) => a.id === areaId);
    return customization?.custom_label || defaultArea?.label || areaId;
  }, [customizations]);

  const getAreaColor = useCallback((areaId: LifeArea): string => {
    const customization = customizations.find((c) => c.area_id === areaId);
    return customization?.custom_color || AREA_HEX_COLORS[areaId];
  }, [customizations]);

  return {
    customizations,
    loading,
    saveCustomization,
    resetCustomization,
    getCustomizedAreas,
    getAreaLabel,
    getAreaColor,
    refetch: fetchCustomizations,
  };
}

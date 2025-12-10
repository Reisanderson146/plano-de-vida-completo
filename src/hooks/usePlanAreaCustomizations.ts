import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export function usePlanAreaCustomizations(lifePlanId: string | undefined) {
  const [customizations, setCustomizations] = useState<AreaCustomization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomizations = useCallback(async () => {
    if (!lifePlanId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('plan_area_customizations')
        .select('area_id, custom_label, custom_color')
        .eq('life_plan_id', lifePlanId);

      if (error) throw error;
      setCustomizations((data as AreaCustomization[]) || []);
    } catch (error) {
      console.error('Error fetching area customizations:', error);
    } finally {
      setLoading(false);
    }
  }, [lifePlanId]);

  useEffect(() => {
    fetchCustomizations();
  }, [fetchCustomizations]);

  const saveCustomization = async (areaId: LifeArea, label: string | null, color: string | null) => {
    if (!lifePlanId) return;

    try {
      const { error } = await supabase
        .from('plan_area_customizations')
        .upsert({
          life_plan_id: lifePlanId,
          area_id: areaId,
          custom_label: label,
          custom_color: color,
        }, {
          onConflict: 'life_plan_id,area_id'
        });

      if (error) throw error;
      await fetchCustomizations();
    } catch (error) {
      console.error('Error saving area customization:', error);
      throw error;
    }
  };

  const saveAllCustomizations = async (planId: string, areas: Array<{ id: LifeArea; label: string; color: string }>) => {
    try {
      const toInsert = areas
        .filter(area => {
          const defaultArea = LIFE_AREAS.find(a => a.id === area.id);
          const defaultColor = AREA_HEX_COLORS[area.id];
          return area.label !== defaultArea?.label || area.color !== defaultColor;
        })
        .map(area => ({
          life_plan_id: planId,
          area_id: area.id,
          custom_label: area.label,
          custom_color: area.color,
        }));

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('plan_area_customizations')
          .upsert(toInsert, { onConflict: 'life_plan_id,area_id' });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving all area customizations:', error);
      throw error;
    }
  };

  const resetCustomization = async (areaId: LifeArea) => {
    if (!lifePlanId) return;

    try {
      const { error } = await supabase
        .from('plan_area_customizations')
        .delete()
        .eq('life_plan_id', lifePlanId)
        .eq('area_id', areaId);

      if (error) throw error;
      await fetchCustomizations();
    } catch (error) {
      console.error('Error resetting area customization:', error);
      throw error;
    }
  };

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
    saveAllCustomizations,
    resetCustomization,
    getAreaLabel,
    getAreaColor,
    refetch: fetchCustomizations,
  };
}

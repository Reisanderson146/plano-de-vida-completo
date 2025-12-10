-- Drop the old user-based customization table
DROP TABLE IF EXISTS public.user_area_customizations;

-- Create table for plan-based area customizations
CREATE TABLE public.plan_area_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  life_plan_id UUID NOT NULL REFERENCES public.life_plans(id) ON DELETE CASCADE,
  area_id TEXT NOT NULL,
  custom_label TEXT,
  custom_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(life_plan_id, area_id)
);

-- Enable RLS
ALTER TABLE public.plan_area_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies - users can only access customizations for their own plans
CREATE POLICY "Users can view their own plan customizations"
ON public.plan_area_customizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans 
    WHERE life_plans.id = plan_area_customizations.life_plan_id 
    AND life_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create customizations for their own plans"
ON public.plan_area_customizations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.life_plans 
    WHERE life_plans.id = plan_area_customizations.life_plan_id 
    AND life_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own plan customizations"
ON public.plan_area_customizations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans 
    WHERE life_plans.id = plan_area_customizations.life_plan_id 
    AND life_plans.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own plan customizations"
ON public.plan_area_customizations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.life_plans 
    WHERE life_plans.id = plan_area_customizations.life_plan_id 
    AND life_plans.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_plan_area_customizations_updated_at
BEFORE UPDATE ON public.plan_area_customizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
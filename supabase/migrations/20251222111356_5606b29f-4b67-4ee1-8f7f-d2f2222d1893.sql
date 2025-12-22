-- Add life_plan_id column to notes table to associate notes with specific life plans
ALTER TABLE public.notes ADD COLUMN life_plan_id uuid REFERENCES public.life_plans(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_notes_life_plan_id ON public.notes(life_plan_id);
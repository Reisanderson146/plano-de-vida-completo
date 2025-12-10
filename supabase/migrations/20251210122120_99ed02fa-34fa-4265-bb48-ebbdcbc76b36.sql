-- Add plan_type column to life_plans table
ALTER TABLE public.life_plans 
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'individual';

-- Add member_name column (for family member or child name)
ALTER TABLE public.life_plans 
ADD COLUMN IF NOT EXISTS member_name text;

-- Add constraint to ensure valid plan types
ALTER TABLE public.life_plans 
ADD CONSTRAINT life_plans_plan_type_check 
CHECK (plan_type IN ('individual', 'familiar', 'filho'));
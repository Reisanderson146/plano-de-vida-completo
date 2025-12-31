-- Add spouse ages and wedding date fields to life_plans table for family plans
ALTER TABLE public.life_plans 
ADD COLUMN spouse_age_1 integer,
ADD COLUMN spouse_age_2 integer,
ADD COLUMN wedding_date date;

-- Add comment for documentation
COMMENT ON COLUMN public.life_plans.spouse_age_1 IS 'Age of first spouse (for family plans)';
COMMENT ON COLUMN public.life_plans.spouse_age_2 IS 'Age of second spouse (for family plans)';
COMMENT ON COLUMN public.life_plans.wedding_date IS 'Wedding date for anniversary tracking (for family plans)';
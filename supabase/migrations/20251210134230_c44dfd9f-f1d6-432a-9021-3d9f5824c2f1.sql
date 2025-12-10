-- Create table for user area customizations
CREATE TABLE public.user_area_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  area_id TEXT NOT NULL,
  custom_label TEXT,
  custom_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, area_id)
);

-- Enable RLS
ALTER TABLE public.user_area_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own customizations"
ON public.user_area_customizations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customizations"
ON public.user_area_customizations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customizations"
ON public.user_area_customizations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customizations"
ON public.user_area_customizations
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_area_customizations_updated_at
BEFORE UPDATE ON public.user_area_customizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
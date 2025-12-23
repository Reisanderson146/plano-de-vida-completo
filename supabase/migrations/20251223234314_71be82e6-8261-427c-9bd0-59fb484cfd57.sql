-- Create table for favorite quotes
CREATE TABLE public.favorite_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quote_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quote_index)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorite quotes" 
ON public.favorite_quotes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite quotes" 
ON public.favorite_quotes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite quotes" 
ON public.favorite_quotes 
FOR DELETE 
USING (auth.uid() = user_id);
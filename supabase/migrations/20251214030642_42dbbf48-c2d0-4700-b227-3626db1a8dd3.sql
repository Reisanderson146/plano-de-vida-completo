-- Add photo_url column to life_plans table
ALTER TABLE public.life_plans ADD COLUMN photo_url text;

-- Create storage bucket for plan photos
INSERT INTO storage.buckets (id, name, public) VALUES ('plan-photos', 'plan-photos', true);

-- Create storage policies for plan photos
CREATE POLICY "Users can view plan photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'plan-photos');

CREATE POLICY "Users can upload their own plan photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plan-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own plan photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'plan-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own plan photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'plan-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
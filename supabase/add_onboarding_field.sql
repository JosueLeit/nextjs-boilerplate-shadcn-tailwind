-- Add onboarding fields to profiles table
-- Run this in Supabase Dashboard > SQL Editor

-- Add onboarding_completed field
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add share_token field for future QR sharing (Phase 3)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_token_created_at TIMESTAMPTZ;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, onboarding_completed, share_token)
  VALUES (NEW.id, NEW.email, false, gen_random_uuid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the columns were added
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'profiles';

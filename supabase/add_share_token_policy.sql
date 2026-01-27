-- FavoritePerson.app - Share Token RLS Policy
-- Run this in Supabase Dashboard SQL Editor

-- Step 1: Ensure share_token columns exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS share_token_created_at TIMESTAMPTZ;

-- Step 2: Generate share_token for existing users who don't have one
UPDATE public.profiles
SET share_token = gen_random_uuid(),
    share_token_created_at = NOW()
WHERE share_token IS NULL;

-- Step 3: Add RLS policy for public access via share_token
DROP POLICY IF EXISTS "Public can view profiles by share_token" ON public.profiles;

CREATE POLICY "Public can view profiles by share_token" ON public.profiles
FOR SELECT TO anon, authenticated
USING (share_token IS NOT NULL);

-- Step 4: Update the trigger to ensure new users get a share_token
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, onboarding_completed, share_token, share_token_created_at)
  VALUES (NEW.id, NEW.email, false, gen_random_uuid(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

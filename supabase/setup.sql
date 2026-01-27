-- ============================================
-- FavoritePerson.app - Supabase Setup Script
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- PART 1: STORAGE BUCKET
-- ============================================

-- Create the storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vcinesquecivel',
  'vcinesquecivel',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/tiff', 'image/bmp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Storage Policy: Users can upload to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'vcinesquecivel'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'vcinesquecivel');

-- Storage Policy: Users can update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'vcinesquecivel'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Users can delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'vcinesquecivel'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- PART 2: PROFILES TABLE
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  relationship_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Profile Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Profile Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- ============================================
-- PART 3: AUTO-CREATE PROFILE TRIGGER
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFICATION QUERIES (run after setup)
-- ============================================

-- Check bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'vcinesquecivel';

-- Check profiles table:
-- SELECT * FROM public.profiles;

-- Check storage policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check profile policies:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

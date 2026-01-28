-- Migration: Add image optimization fields to photos table
-- This migration adds support for BlurHash placeholders and image variants

-- Add blurhash column for storing placeholder hash
ALTER TABLE photos ADD COLUMN IF NOT EXISTS blurhash TEXT;

-- Add variants column for storing paths to optimized image variants
-- JSON structure:
-- {
--   "thumb": "photos/user123/photo456/thumb.webp",
--   "medium": "photos/user123/photo456/medium.webp",
--   "large": "photos/user123/photo456/large.webp"
-- }
ALTER TABLE photos ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '{}';

-- Add index for faster lookups when filtering by variant availability
CREATE INDEX IF NOT EXISTS idx_photos_variants ON photos USING GIN (variants);

-- Comment on columns for documentation
COMMENT ON COLUMN photos.blurhash IS 'BlurHash string for generating placeholder images during loading';
COMMENT ON COLUMN photos.variants IS 'JSON object containing paths to optimized image variants (thumb, medium, large)';

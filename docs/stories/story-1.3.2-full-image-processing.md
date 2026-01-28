# Story 1.3.2: Implement Full Image Processing

**Epic:** 1 - Performance Foundation
**Parent:** Story 1.3 - Image Optimization Pipeline
**Status:** Ready
**Priority:** High
**Estimate:** 1 week
**Assigned:** @dev

---

## User Story

**As a** user uploading photos
**I want** my photos automatically optimized into multiple sizes
**So that** the gallery loads fast with appropriate image quality for each view

## Background

The `process-image` edge function currently returns a stub response. This story implements the full image processing logic using sharp for resizing and blurhash for placeholders.

## Acceptance Criteria

- [ ] Thumbnail variant (200x200) generated in WebP format
- [ ] Medium variant (800px width) generated in WebP format
- [ ] Large variant (1600px width) generated in WebP format
- [ ] BlurHash generated and stored in database
- [ ] Variants uploaded to storage with correct paths
- [ ] Database updated with variants paths and blurhash
- [ ] Processing completes in <10 seconds for typical photos
- [ ] Original image preserved unchanged

## Technical Requirements

### Edge Function Implementation

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Note: sharp requires special Deno config, may need alternative
import { ImageMagick, initializeImageMagick } from 'https://deno.land/x/imagemagick_deno/mod.ts'
import { encode } from 'https://esm.sh/blurhash@2.0.5'

serve(async (req: Request) => {
  const { photoId, bucket, path } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Download original
  const { data: originalData, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) throw error

  const buffer = await originalData.arrayBuffer()

  // 2. Generate variants using ImageMagick (Deno-compatible)
  await initializeImageMagick()

  const basePath = path.replace(/\.[^.]+$/, '')
  const variants = {
    thumb: `${basePath}/thumb.webp`,
    medium: `${basePath}/medium.webp`,
    large: `${basePath}/large.webp`,
  }

  // 3. Process and upload each variant
  // ... implementation details

  // 4. Generate BlurHash
  const blurhash = encode(/* pixel data */, width, height, 4, 3)

  // 5. Update database
  await supabase
    .from('photos')
    .update({ blurhash, variants })
    .eq('id', photoId)

  return new Response(JSON.stringify({ success: true, variants, blurhash }))
})
```

### Alternative: External Processing Service

If Deno edge functions prove limited for image processing:

1. **Option A:** Use Supabase Storage Transform (built-in)
2. **Option B:** Use Cloudflare Images API
3. **Option C:** Separate Node.js microservice with sharp

### Variant Specifications

| Variant | Size | Quality | Format | Fit |
|---------|------|---------|--------|-----|
| thumb | 200x200 | 70% | WebP | cover |
| medium | 800xAuto | 80% | WebP | inside |
| large | 1600xAuto | 85% | WebP | inside |

### Storage Path Structure

```
vcinesquecivel/
  {user_id}/
    {photo_id}/
      original.jpg     # Preserved as uploaded
      thumb.webp       # 200x200 cover crop
      medium.webp      # 800px width
      large.webp       # 1600px width
```

## Testing Checklist

- [ ] Upload 1MB JPEG, verify all variants generated
- [ ] Upload 5MB JPEG, verify processing completes <10s
- [ ] Verify WebP format served
- [ ] Verify blurhash stored in database
- [ ] Verify variants paths correct in database
- [ ] Test with PNG input
- [ ] Test with HEIC input (if supported)
- [ ] Verify original unchanged

## Definition of Done

- [ ] All 3 variants generated on upload
- [ ] BlurHash generated and stored
- [ ] Database updated correctly
- [ ] Processing time <10s for 5MB image
- [ ] Unit tests for processing logic
- [ ] Code review approved

---

## Notes

- sharp may not work directly in Deno - evaluate alternatives
- Consider async queue for large batches
- Monitor Supabase function execution time limits (default 60s)

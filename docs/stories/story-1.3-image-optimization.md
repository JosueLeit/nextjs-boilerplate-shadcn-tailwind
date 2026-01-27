# Story 1.3: Create Image Optimization Pipeline

**Epic:** 1 - Performance Foundation
**Status:** Approved
**Priority:** High
**Estimate:** 2 weeks
**Assigned:** @dev

---

## User Story

**As a** user viewing a photo gallery
**I want** photos to load instantly with smooth transitions
**So that** I have a fast, enjoyable browsing experience

## Background

Currently, full-resolution images are served directly from Supabase Storage without optimization. This causes slow initial loads and wastes bandwidth. An optimization pipeline will generate multiple sizes and serve appropriate versions based on context.

## Acceptance Criteria

- [ ] Thumbnails (200px) load in <100ms
- [ ] Medium images (800px) load in <500ms
- [ ] Full images load progressively with blur placeholder
- [ ] WebP format served to supporting browsers
- [ ] Original quality preserved for downloads
- [ ] BlurHash placeholder shows immediately while loading
- [ ] Images are cached with immutable headers

## Technical Requirements

### Dependencies to Install
```bash
pnpm add blurhash sharp
# sharp for Edge Function
```

### Files to Create/Modify

| File | Changes |
|------|---------|
| `components/Polaroid.tsx` | Add blur placeholder, srcSet |
| `components/OptimizedImage.tsx` | NEW - Wrapper with blur + progressive load |
| `lib/imageUtils.ts` | NEW - Image URL helpers |
| `supabase/functions/process-image/` | NEW - Edge Function for variants |
| `next.config.mjs` | Configure next/image domains |

### Image Variants to Generate

| Variant | Dimensions | Quality | Use Case |
|---------|------------|---------|----------|
| `thumb` | 200x200 | 70% | Grid view |
| `medium` | 800xAuto | 80% | Gallery view |
| `large` | 1600xAuto | 85% | Lightbox |
| `original` | Original | 100% | Download |

### Implementation Notes

1. **BlurHash Generation (on upload):**
```typescript
import { encode } from 'blurhash'

// In Edge Function after upload
const blurhash = encode(
  imageData,
  componentX: 4,
  componentY: 3
)

// Store in database with photo record
await supabase
  .from('photos')
  .update({ blurhash })
  .eq('id', photoId)
```

2. **OptimizedImage Component:**
```typescript
interface OptimizedImageProps {
  src: string
  blurhash?: string
  alt: string
  sizes: string
}

export function OptimizedImage({ src, blurhash, alt, sizes }: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative">
      {/* BlurHash placeholder */}
      {blurhash && !loaded && (
        <Blurhash
          hash={blurhash}
          width="100%"
          height="100%"
          className="absolute inset-0"
        />
      )}

      {/* Actual image */}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )
}
```

3. **URL Structure:**
```
/storage/photos/{userId}/{photoId}/thumb.webp
/storage/photos/{userId}/{photoId}/medium.webp
/storage/photos/{userId}/{photoId}/large.webp
/storage/photos/{userId}/{photoId}/original.jpg
```

4. **Edge Function (process-image):**
```typescript
import sharp from 'sharp'

Deno.serve(async (req) => {
  const { photoId, bucket, path } = await req.json()

  // Download original
  const { data } = await supabase.storage
    .from(bucket)
    .download(path)

  const buffer = await data.arrayBuffer()

  // Generate variants
  const variants = await Promise.all([
    sharp(buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 70 }).toBuffer(),
    sharp(buffer).resize(800, null, { fit: 'inside' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(1600, null, { fit: 'inside' }).webp({ quality: 85 }).toBuffer(),
  ])

  // Upload variants
  // ...

  // Generate and store blurhash
  // ...
})
```

5. **Cache Headers:**
```typescript
// In API route or middleware
headers.set('Cache-Control', 'public, max-age=31536000, immutable')
```

## Database Schema Update

```sql
ALTER TABLE photos ADD COLUMN IF NOT EXISTS blurhash TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '{}';

-- Example variants JSON:
-- {
--   "thumb": "photos/user123/photo456/thumb.webp",
--   "medium": "photos/user123/photo456/medium.webp",
--   "large": "photos/user123/photo456/large.webp"
-- }
```

## Testing Checklist

- [ ] Thumbnail loads in <100ms (Lighthouse)
- [ ] BlurHash displays immediately
- [ ] WebP served to Chrome/Firefox
- [ ] JPEG fallback for Safari (if needed)
- [ ] srcSet provides correct sizes
- [ ] Cache headers present
- [ ] Edge Function processes in <5s
- [ ] Original available for download

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Edge Function deployed and tested
- [ ] Database migration applied
- [ ] Existing photos processed (migration script)
- [ ] Performance audit passes (Lighthouse >90)
- [ ] Code review approved

---

## Notes

- Consider Cloudflare Images for future (Phase 4)
- Migration script needed for existing photos
- Monitor Edge Function costs

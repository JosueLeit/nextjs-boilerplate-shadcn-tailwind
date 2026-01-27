# Story 1.2: Add Client-Side Image Compression

**Epic:** 1 - Performance Foundation
**Status:** Approved
**Priority:** High
**Estimate:** 3 days
**Assigned:** @dev

---

## User Story

**As a** user uploading photos from my phone
**I want** my photos to be automatically optimized before upload
**So that** uploads are faster and I don't waste storage quota

## Background

Modern smartphones capture photos at 12-50MP, resulting in 5-15MB files. Most users don't need full resolution for sharing. Client-side compression reduces upload time and storage costs while maintaining visual quality.

## Acceptance Criteria

- [ ] Photos >10MB are automatically compressed before upload
- [ ] Compression maintains 80% quality (configurable)
- [ ] Original photo is available for download if user is on Premium plan
- [ ] User can toggle "Upload original" option
- [ ] Compression happens in background (non-blocking UI)
- [ ] EXIF data is preserved (orientation, date, location)
- [ ] HEIC files are converted to JPEG

## Technical Requirements

### Dependencies to Install
```bash
pnpm add browser-image-compression
```

### Files to Modify

| File | Changes |
|------|---------|
| `components/PhotoUploader.tsx` | Add compression step before upload |
| `lib/imageCompression.ts` | NEW - Compression utilities |
| `lib/store/settingsStore.ts` | NEW - User preferences for upload quality |

### Implementation Notes

1. **Compression Configuration:**
```typescript
import imageCompression from 'browser-image-compression'

const compressionOptions = {
  maxSizeMB: 2,           // Max file size
  maxWidthOrHeight: 2048, // Max dimension
  useWebWorker: true,     // Non-blocking
  preserveExif: true,     // Keep metadata
  fileType: 'image/jpeg', // Output format
  initialQuality: 0.8     // 80% quality
}

const compressImage = async (file: File) => {
  if (file.size <= 10 * 1024 * 1024) {
    return file // Skip if <10MB
  }
  return await imageCompression(file, compressionOptions)
}
```

2. **HEIC Handling:**
```typescript
// HEIC files need conversion
if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
  // browser-image-compression handles this automatically
}
```

3. **User Preference:**
```typescript
// Settings store
interface UploadSettings {
  autoCompress: boolean      // default: true
  compressionQuality: number // 0.6 | 0.8 | 1.0
  maxDimension: number       // 1920 | 2048 | 4096 | 'original'
}
```

4. **UI Feedback:**
   - Show "Otimizando..." during compression
   - Display before/after file size
   - Option to skip compression

## UI Mockup

```
┌─────────────────────────────────────────────────┐
│  Otimizando imagem...                           │
│                                                 │
│  IMG_4521.HEIC                                 │
│  Original: 24.5 MB → Otimizado: 1.8 MB         │
│                                                 │
│  [████████████░░░░░░] 75%                      │
│                                                 │
│  ☐ Enviar original (usa mais armazenamento)    │
└─────────────────────────────────────────────────┘
```

## Upload Settings UI

```
┌─────────────────────────────────────────────────┐
│  Configurações de Upload                        │
│                                                 │
│  Qualidade das fotos                           │
│  ○ Alta (original) - Usa mais espaço           │
│  ◉ Balanceada (recomendado)                    │
│  ○ Economia - Menor qualidade, mais espaço     │
│                                                 │
│  ☑ Otimizar automaticamente fotos grandes      │
│  ☐ Sempre perguntar antes de otimizar          │
└─────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Compress 20MB JPEG → <2MB
- [ ] Convert HEIC to JPEG
- [ ] Preserve EXIF orientation
- [ ] Preserve EXIF date/location
- [ ] Skip compression for small files
- [ ] Web Worker doesn't block UI
- [ ] Test on low-memory devices (mobile)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests for compression utilities
- [ ] Visual quality validated (no artifacts)
- [ ] EXIF data preservation verified
- [ ] Settings UI implemented
- [ ] Portuguese labels
- [ ] Code review approved

---

## Notes

- This story should be completed before Story 1.1 integration
- Premium users may want "always original" option
- Consider adding compression preview (before/after)

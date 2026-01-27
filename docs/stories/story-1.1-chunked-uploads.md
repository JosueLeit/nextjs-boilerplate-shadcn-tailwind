# Story 1.1: Implement Chunked File Uploads

**Epic:** 1 - Performance Foundation
**Status:** Approved
**Priority:** High
**Estimate:** 1 week
**Assigned:** @dev

---

## User Story

**As a** professional photographer
**I want to** upload large files (up to 50MB) reliably
**So that** I can share high-resolution photos without compression

## Background

Current implementation uses direct upload to Supabase Storage. While Supabase supports 50MB files, large uploads often fail on slow connections without progress feedback or resume capability.

## Acceptance Criteria

- [ ] Files up to 50MB upload successfully
- [ ] Upload progress shows percentage (0-100%)
- [ ] Failed uploads can be resumed from last chunk
- [ ] Upload speed is displayed (MB/s)
- [ ] Cancel button stops upload and cleans up partial files
- [ ] Works on mobile (4G) and desktop connections
- [ ] Error messages are user-friendly (Portuguese)

## Technical Requirements

### Dependencies to Install
```bash
pnpm add tus-js-client
```

### Files to Modify

| File | Changes |
|------|---------|
| `components/PhotoUploader.tsx` | Replace direct upload with tus client |
| `lib/uploadUtils.ts` | NEW - Upload utilities and progress tracking |
| `app/api/upload/route.ts` | NEW - Server endpoint for tus protocol |

### Implementation Notes

1. **tus-js-client Configuration:**
```typescript
const upload = new tus.Upload(file, {
  endpoint: '/api/upload',
  retryDelays: [0, 3000, 5000, 10000, 20000],
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  metadata: {
    filename: file.name,
    filetype: file.type,
    userId: user.id
  },
  onProgress: (bytesUploaded, bytesTotal) => {
    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
    setProgress(percentage)
  },
  onSuccess: () => {
    // Handle completion
  },
  onError: (error) => {
    // Handle error with retry option
  }
})
```

2. **Supabase Integration:**
   - tus server writes chunks to temp storage
   - On completion, move to final Supabase bucket
   - Clean up partial uploads after 24 hours

3. **Progress UI:**
   - Circular progress indicator
   - File name + size display
   - Speed indicator (calculated from chunk timing)
   - Pause/Resume/Cancel buttons

## UI Mockup

```
┌─────────────────────────────────────────────────┐
│  Enviando foto...                               │
│                                                 │
│      ┌─────────────────────┐                   │
│      │    ████████░░░░░    │   78%             │
│      └─────────────────────┘                   │
│                                                 │
│  IMG_4521.jpg (24.5 MB)                        │
│  Velocidade: 2.3 MB/s                          │
│                                                 │
│  [Pausar]  [Cancelar]                          │
└─────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Upload 50MB file on fast connection
- [ ] Upload 50MB file on throttled connection (3G)
- [ ] Interrupt upload and resume
- [ ] Cancel upload and verify cleanup
- [ ] Upload multiple files simultaneously
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests for upload utilities
- [ ] Integration test for full upload flow
- [ ] Error handling covers network failures
- [ ] Portuguese error messages
- [ ] Code review approved
- [ ] No console errors in production build

---

## Notes

- Consider implementing upload queue for batch uploads (Story 1.2 dependency)
- Coordinate with Story 1.3 for thumbnail generation trigger

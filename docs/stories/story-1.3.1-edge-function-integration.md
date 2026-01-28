# Story 1.3.1: Test Edge Function Integration

**Epic:** 1 - Performance Foundation
**Parent:** Story 1.3 - Image Optimization Pipeline
**Status:** Ready
**Priority:** High
**Estimate:** 2 days
**Assigned:** @dev

---

## User Story

**As a** developer integrating the image pipeline
**I want** to call the process-image edge function from the app
**So that** uploaded photos are automatically processed for optimization

## Background

The `process-image` edge function has been deployed as a stub (Story 1.3). This story covers integrating the function call into the upload flow and testing the API contract works correctly end-to-end.

## Acceptance Criteria

- [ ] Upload flow calls edge function after successful storage upload
- [ ] Edge function receives correct payload (photoId, bucket, path)
- [ ] Function response is handled properly (success/error states)
- [ ] Loading state shown while processing
- [ ] Error handling with user-friendly messages
- [ ] Function logs visible in Supabase dashboard

## Technical Requirements

### Files to Modify

| File | Changes |
|------|---------|
| `lib/uploadService.ts` | Add edge function call after upload |
| `hooks/usePhotoUpload.ts` | Handle processing state |
| `components/UploadProgress.tsx` | Show "Processing..." state |

### Edge Function Endpoint

```typescript
const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-image`

interface ProcessImagePayload {
  photoId: string
  bucket: string
  path: string
  userId?: string
}

async function triggerImageProcessing(payload: ProcessImagePayload) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Image processing failed')
  }

  return response.json()
}
```

### Upload Flow Integration

```typescript
// After successful tus upload
const photoRecord = await createPhotoRecord(albumId, storagePath)

// Trigger processing (non-blocking)
triggerImageProcessing({
  photoId: photoRecord.id,
  bucket: 'vcinesquecivel',
  path: storagePath,
  userId: user.id,
}).catch(error => {
  console.error('Processing failed:', error)
  // Photo still exists, just without variants
})
```

## Testing Checklist

- [ ] Upload photo and verify edge function is called
- [ ] Check Supabase logs show function execution
- [ ] Verify payload contains correct photoId, bucket, path
- [ ] Test error handling when function fails
- [ ] Test with authenticated user
- [ ] Test CORS works from localhost

## Test Photo Created

A test record exists for manual testing:
- **Photo ID:** `911c6ccb-67e9-40c6-abd2-9bad21ad7dcf`
- **Album ID:** `1a425687-0230-4b63-9a51-5e32a8e225ab`
- **Path:** `87f825cb-6a14-4e08-8467-bd0b9d3f4f25/test-photo.jpg`

## Definition of Done

- [ ] Edge function called on every photo upload
- [ ] Processing state shown in UI
- [ ] Error handling implemented
- [ ] Logs confirm function execution
- [ ] Code review approved

---

## Dependencies

- Story 1.3 (Edge function deployed) - DONE
- Database schema with photos table - DONE

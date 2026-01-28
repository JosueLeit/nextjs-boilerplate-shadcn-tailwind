# Story 1.3.3: Add Storage Webhook Trigger

**Epic:** 1 - Performance Foundation
**Parent:** Story 1.3 - Image Optimization Pipeline
**Status:** Ready
**Priority:** Medium
**Estimate:** 3 days
**Assigned:** @data-engineer

---

## User Story

**As a** system administrator
**I want** photos to be automatically processed when uploaded to storage
**So that** the processing pipeline is reliable and decoupled from the upload flow

## Background

Currently, the edge function must be called manually from the application code after upload. A storage webhook will automatically trigger processing whenever a new image is uploaded, making the system more reliable and enabling uploads from any source (mobile, API, dashboard).

## Acceptance Criteria

- [ ] Webhook triggers on INSERT to storage.objects
- [ ] Only triggers for vcinesquecivel bucket
- [ ] Only triggers for image mime types
- [ ] Edge function receives storage event payload
- [ ] Processing starts within 1 second of upload
- [ ] Failed processing doesn't block upload
- [ ] Retry logic for transient failures

## Technical Requirements

### Database Trigger

```sql
-- Create function to call edge function on storage upload
CREATE OR REPLACE FUNCTION public.trigger_image_processing()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload JSONB;
  result JSONB;
BEGIN
  -- Only process images in vcinesquecivel bucket
  IF NEW.bucket_id != 'vcinesquecivel' THEN
    RETURN NEW;
  END IF;

  -- Only process image files
  IF NOT (NEW.metadata->>'mimetype' LIKE 'image/%') THEN
    RETURN NEW;
  END IF;

  -- Build payload
  payload := jsonb_build_object(
    'bucket', NEW.bucket_id,
    'path', NEW.name,
    'userId', NEW.owner_id,
    'metadata', NEW.metadata
  );

  -- Call edge function asynchronously via pg_net
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/process-image',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on storage.objects
CREATE TRIGGER on_storage_object_created
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_image_processing();
```

### Alternative: Supabase Database Webhooks

Use Supabase Dashboard:
1. Go to Database > Webhooks
2. Create webhook on `storage.objects` INSERT
3. Point to edge function URL
4. Add service role auth header

### Edge Function Update

Update to handle both manual calls and webhook events:

```typescript
interface WebhookPayload {
  type: 'INSERT'
  table: 'objects'
  schema: 'storage'
  record: {
    id: string
    bucket_id: string
    name: string
    owner_id: string
    metadata: {
      mimetype: string
      size: number
    }
  }
}

serve(async (req: Request) => {
  const body = await req.json()

  // Detect if webhook or manual call
  const isWebhook = body.type === 'INSERT' && body.table === 'objects'

  let photoId: string, bucket: string, path: string

  if (isWebhook) {
    const { record } = body as WebhookPayload
    bucket = record.bucket_id
    path = record.name
    // Need to lookup or create photo record
    photoId = await getOrCreatePhotoRecord(bucket, path, record.owner_id)
  } else {
    ({ photoId, bucket, path } = body)
  }

  // Process image...
})
```

## Database Requirements

### Enable pg_net Extension

```sql
-- Required for async HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Store Config Settings

```sql
-- Store URLs for trigger to use
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://lfuzflllwigalmuxagkr.supabase.co';
-- Note: Service role key should be in vault, not plaintext
```

## Testing Checklist

- [ ] Upload via Supabase Dashboard, verify processing triggers
- [ ] Upload via app, verify processing triggers
- [ ] Upload non-image file, verify NO trigger
- [ ] Upload to different bucket, verify NO trigger
- [ ] Verify edge function logs show webhook payload
- [ ] Test retry on transient failure
- [ ] Verify no duplicate processing

## Definition of Done

- [ ] Webhook/trigger configured
- [ ] Auto-processing works for all upload methods
- [ ] Only images in correct bucket processed
- [ ] Monitoring/alerting for failures
- [ ] Documentation updated
- [ ] Code review approved

---

## Security Considerations

- Service role key must be stored securely (Supabase Vault)
- Trigger function uses SECURITY DEFINER
- Webhook endpoint validates authorization header

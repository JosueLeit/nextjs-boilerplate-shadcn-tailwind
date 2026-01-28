/**
 * Image Processing Service
 *
 * Handles communication with the Supabase Edge Function for image processing.
 * Used to trigger image optimization (thumbnails, variants, blurhash) after upload.
 *
 * @see docs/stories/story-1.3.1-edge-function-integration.md
 */

import { supabase } from './supabaseClient'

/**
 * Payload for the process-image edge function
 */
export interface ProcessImagePayload {
  photoId: string
  bucket: string
  path: string
  userId?: string
}

/**
 * Response from the process-image edge function
 */
export interface ProcessImageResponse {
  success: boolean
  message: string
  photoId?: string
  variants?: {
    thumb?: string
    medium?: string
    large?: string
  }
  blurhash?: string
}

/**
 * Processing state for UI feedback
 */
export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error'

export interface ProcessingState {
  status: ProcessingStatus
  message: string | null
  photoId: string | null
}

export const initialProcessingState: ProcessingState = {
  status: 'idle',
  message: null,
  photoId: null,
}

/**
 * Get the edge function URL
 */
function getEdgeFunctionUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  return `${supabaseUrl}/functions/v1/process-image`
}

/**
 * Trigger image processing via edge function
 *
 * This function calls the process-image edge function to:
 * - Generate image variants (thumb, medium, large)
 * - Create BlurHash for placeholder display
 * - Update the photo record with processed data
 *
 * @param payload - The image processing payload
 * @returns Promise<ProcessImageResponse>
 */
export async function triggerImageProcessing(
  payload: ProcessImagePayload
): Promise<ProcessImageResponse> {
  console.log('[IMAGE_PROCESSING] Triggering processing for:', payload.photoId)

  // Get current session for authorization
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Sessao expirada. Faca login novamente.')
  }

  const functionUrl = getEdgeFunctionUrl()

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[IMAGE_PROCESSING] Edge function error:', response.status, errorText)

    // Parse error message if JSON
    let errorMessage = 'Erro ao processar imagem'
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorMessage
    } catch {
      // Keep default message
    }

    throw new Error(errorMessage)
  }

  const result: ProcessImageResponse = await response.json()
  console.log('[IMAGE_PROCESSING] Processing result:', result)

  return result
}

/**
 * Create a photo record in the database
 *
 * @param params - Photo data for creating the record
 * @returns The created photo record with its ID
 */
export async function createPhotoRecord(params: {
  storagePath: string
  userId: string
  caption?: string
  takenAt?: string
  originalFilename?: string
  fileSizeBytes?: number
  albumId?: string
}): Promise<{ id: string; storage_path: string }> {
  console.log('[IMAGE_PROCESSING] Creating photo record:', params.storagePath)

  const { data, error } = await supabase
    .from('photos')
    .insert({
      storage_path: params.storagePath,
      uploaded_by: params.userId,
      caption: params.caption,
      taken_at: params.takenAt ? new Date(params.takenAt).toISOString() : null,
      original_filename: params.originalFilename,
      file_size_bytes: params.fileSizeBytes,
      album_id: params.albumId,
    })
    .select('id, storage_path')
    .single()

  if (error) {
    console.error('[IMAGE_PROCESSING] Error creating photo record:', error)
    throw new Error('Erro ao salvar registro da foto')
  }

  console.log('[IMAGE_PROCESSING] Photo record created:', data.id)
  return data
}

/**
 * Process image after upload (non-blocking)
 *
 * This is a convenience function that:
 * 1. Creates a photo record in the database
 * 2. Triggers the edge function for processing
 *
 * The edge function call is non-blocking - the photo exists in storage
 * even if processing fails, just without optimized variants.
 *
 * @param params - Upload completion parameters
 * @returns Promise with photo ID and processing status
 */
export async function processImageAfterUpload(params: {
  storagePath: string
  userId: string
  caption?: string
  takenAt?: string
  originalFilename?: string
  fileSizeBytes?: number
  albumId?: string
  bucket?: string
}): Promise<{
  photoId: string
  processingStarted: boolean
  error?: string
}> {
  const bucket = params.bucket || 'vcinesquecivel'

  try {
    // 1. Create photo record in database
    const photoRecord = await createPhotoRecord({
      storagePath: params.storagePath,
      userId: params.userId,
      caption: params.caption,
      takenAt: params.takenAt,
      originalFilename: params.originalFilename,
      fileSizeBytes: params.fileSizeBytes,
      albumId: params.albumId,
    })

    // 2. Trigger image processing (non-blocking)
    triggerImageProcessing({
      photoId: photoRecord.id,
      bucket,
      path: params.storagePath,
      userId: params.userId,
    }).catch((error) => {
      // Log error but don't fail - photo still exists without variants
      console.error('[IMAGE_PROCESSING] Processing failed (non-blocking):', error)
    })

    return {
      photoId: photoRecord.id,
      processingStarted: true,
    }
  } catch (error) {
    console.error('[IMAGE_PROCESSING] Error in processImageAfterUpload:', error)
    return {
      photoId: '',
      processingStarted: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Portuguese error messages for image processing
 */
export const processingErrorMessages: Record<string, string> = {
  network: 'Erro de conexao ao processar imagem.',
  auth: 'Sessao expirada. Faca login novamente.',
  timeout: 'Tempo esgotado ao processar imagem.',
  unknown: 'Erro ao processar imagem. Tente novamente.',
}

/**
 * Get user-friendly error message for processing errors
 */
export function getProcessingErrorMessage(error: Error): string {
  const message = error.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch')) {
    return processingErrorMessages.network
  }
  if (message.includes('auth') || message.includes('sessao') || message.includes('401')) {
    return processingErrorMessages.auth
  }
  if (message.includes('timeout')) {
    return processingErrorMessages.timeout
  }

  // Return original message if it's already user-friendly (Portuguese)
  if (message.includes('erro')) {
    return error.message
  }

  return processingErrorMessages.unknown
}

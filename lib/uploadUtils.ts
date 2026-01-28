import * as tus from 'tus-js-client'

/**
 * Upload options interface
 */
export interface UploadOptions {
  file: File
  userId: string
  fileName: string
  bucketName?: string
  onProgress?: (percentage: number, speed: number, bytesUploaded: number, bytesTotal: number) => void
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}

/**
 * Upload controller interface for pause/resume/cancel
 */
export interface UploadController {
  start: () => void
  pause: () => void
  resume: () => void
  abort: () => void
  isPaused: () => boolean
}

/**
 * Upload state for tracking progress
 */
export interface UploadState {
  percentage: number
  speed: number
  bytesUploaded: number
  bytesTotal: number
  isPaused: boolean
  isUploading: boolean
  error: Error | null
}

/**
 * Portuguese error messages for user-friendly feedback
 */
export const uploadErrorMessages: Record<string, string> = {
  network: 'Erro de conexao. Verifique sua internet.',
  timeout: 'Upload expirou. Tente novamente.',
  storage: 'Erro ao salvar arquivo. Tente novamente.',
  auth: 'Sessao expirada. Faca login novamente.',
  size: 'Arquivo muito grande. Maximo permitido: 50MB.',
  unknown: 'Erro desconhecido. Tente novamente.',
  aborted: 'Upload cancelado.',
  'tus: unexpected response while creating upload': 'Erro ao iniciar upload. Verifique suas permissoes.',
  'tus: failed to resume upload': 'Falha ao retomar upload. Iniciando novo upload...',
}

/**
 * Get user-friendly error message in Portuguese
 */
export function getUploadErrorMessage(error: Error): string {
  const message = error.message.toLowerCase()

  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return uploadErrorMessages.network
  }
  if (message.includes('timeout')) {
    return uploadErrorMessages.timeout
  }
  if (message.includes('storage') || message.includes('bucket')) {
    return uploadErrorMessages.storage
  }
  if (message.includes('auth') || message.includes('401') || message.includes('unauthorized')) {
    return uploadErrorMessages.auth
  }
  if (message.includes('size') || message.includes('too large') || message.includes('413')) {
    return uploadErrorMessages.size
  }
  if (message.includes('abort') || message.includes('cancel')) {
    return uploadErrorMessages.aborted
  }

  // Check for specific tus error messages
  for (const [key, value] of Object.entries(uploadErrorMessages)) {
    if (message.includes(key.toLowerCase())) {
      return value
    }
  }

  return uploadErrorMessages.unknown
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format upload speed
 */
export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s'

  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))

  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Create a resumable upload using tus protocol with Supabase Storage
 *
 * @param options - Upload configuration options
 * @returns UploadController for managing the upload
 */
export function createUpload(options: UploadOptions): UploadController {
  const {
    file,
    userId,
    fileName,
    bucketName = 'vcinesquecivel',
    onProgress,
    onSuccess,
    onError,
  } = options

  // Get Supabase URL from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // Supabase Storage tus endpoint
  const endpoint = `${supabaseUrl}/storage/v1/upload/resumable`

  // Track upload speed
  let lastBytesUploaded = 0
  let lastTime = Date.now()
  let currentSpeed = 0
  let paused = false

  // Full path in bucket
  const objectPath = `${userId}/${fileName}`

  // Create tus upload instance
  const upload = new tus.Upload(file, {
    endpoint,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    headers: {
      authorization: `Bearer ${supabaseAnonKey}`,
      'x-upsert': 'true', // Allow overwriting existing files
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName,
      objectName: objectPath,
      contentType: file.type,
      cacheControl: '3600',
    },
    onError: (error) => {
      console.error('[UPLOAD] tus error:', error)
      const uploadError = error instanceof Error ? error : new Error(String(error))
      onError?.(uploadError)
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      // Calculate progress percentage
      const percentage = Math.round((bytesUploaded / bytesTotal) * 100)

      // Calculate upload speed
      const now = Date.now()
      const timeDiff = (now - lastTime) / 1000 // seconds

      if (timeDiff >= 0.5) { // Update speed every 500ms
        const bytesDiff = bytesUploaded - lastBytesUploaded
        currentSpeed = bytesDiff / timeDiff
        lastBytesUploaded = bytesUploaded
        lastTime = now
      }

      onProgress?.(percentage, currentSpeed, bytesUploaded, bytesTotal)
    },
    onSuccess: () => {
      console.log('[UPLOAD] Upload completed successfully')
      // Construct the public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`
      onSuccess?.(publicUrl)
    },
  })

  // Return controller interface
  return {
    start: () => {
      paused = false
      lastTime = Date.now()
      lastBytesUploaded = 0

      // Check for previous uploads to resume
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length > 0) {
          console.log('[UPLOAD] Resuming previous upload')
          upload.resumeFromPreviousUpload(previousUploads[0])
        }
        upload.start()
      })
    },
    pause: () => {
      paused = true
      upload.abort()
    },
    resume: () => {
      paused = false
      lastTime = Date.now()
      upload.start()
    },
    abort: () => {
      paused = false
      upload.abort()
      // Note: Supabase automatically cleans up partial uploads
    },
    isPaused: () => paused,
  }
}

/**
 * Calculate estimated time remaining
 */
export function calculateETA(bytesRemaining: number, speedBytesPerSecond: number): string {
  if (speedBytesPerSecond === 0) return '--:--'

  const secondsRemaining = bytesRemaining / speedBytesPerSecond

  if (secondsRemaining < 60) {
    return `${Math.round(secondsRemaining)}s`
  }

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = Math.round(secondsRemaining % 60)

  if (minutes < 60) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

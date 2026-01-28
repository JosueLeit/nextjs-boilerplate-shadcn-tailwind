import imageCompression, { Options } from 'browser-image-compression'

/**
 * Compression options interface for type safety
 */
export interface CompressionOptions {
  maxSizeMB: number
  maxWidthOrHeight: number
  useWebWorker: boolean
  preserveExif: boolean
  fileType: string
  initialQuality: number
}

/**
 * Result of compression operation
 */
export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  wasCompressed: boolean
}

/**
 * Default compression options
 */
export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 2,           // Max file size in MB
  maxWidthOrHeight: 2048, // Max dimension (width or height)
  useWebWorker: true,     // Non-blocking compression
  preserveExif: true,     // Keep metadata (orientation, date, location)
  fileType: 'image/jpeg', // Output format
  initialQuality: 0.8     // 80% quality
}

/**
 * Threshold for automatic compression (10MB)
 */
export const COMPRESSION_THRESHOLD_MB = 10

/**
 * Check if file is a HEIC/HEIF image
 */
export function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  )
}

/**
 * Check if file needs compression based on size threshold
 */
export function needsCompression(file: File, thresholdMB: number = COMPRESSION_THRESHOLD_MB): boolean {
  return file.size > thresholdMB * 1024 * 1024
}

/**
 * Format file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

/**
 * Get compression options based on quality level
 */
export function getCompressionOptions(
  quality: number = 0.8,
  maxDimension: number = 2048
): Options {
  return {
    maxSizeMB: 2,
    maxWidthOrHeight: maxDimension,
    useWebWorker: true,
    preserveExif: true,
    fileType: 'image/jpeg',
    initialQuality: quality
  }
}

/**
 * Compress an image file
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @param forceCompress - Force compression even for small files
 * @returns Promise with compression result
 */
export async function compressImage(
  file: File,
  options?: Partial<CompressionOptions>,
  forceCompress: boolean = false
): Promise<CompressionResult> {
  const originalSize = file.size

  // Skip compression for small files unless forced
  // Always compress HEIC files to convert them to JPEG
  if (!forceCompress && !needsCompression(file) && !isHeicFile(file)) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false
    }
  }

  const compressionOptions: Options = {
    ...defaultCompressionOptions,
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, compressionOptions)

    // Generate new filename with proper extension
    const originalName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
    const newFileName = originalName.endsWith('.jpg') || originalName.endsWith('.jpeg')
      ? originalName
      : `${originalName.replace(/\.[^/.]+$/, '')}.jpg`

    // Create a new File object with the correct name
    const renamedFile = new File([compressedFile], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    })

    return {
      file: renamedFile,
      originalSize,
      compressedSize: renamedFile.size,
      wasCompressed: true
    }
  } catch (error) {
    console.error('[COMPRESSION] Error compressing image:', error)
    // Return original file if compression fails
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false
    }
  }
}

/**
 * Compress multiple images
 *
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Promise with array of compression results
 */
export async function compressImages(
  files: File[],
  options?: Partial<CompressionOptions>,
  onProgress?: (current: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options)
    results.push(result)
    onProgress?.(i + 1, files.length)
  }

  return results
}

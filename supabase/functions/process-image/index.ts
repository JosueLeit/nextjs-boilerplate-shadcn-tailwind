/**
 * Supabase Edge Function: process-image
 *
 * Full implementation of the image processing pipeline.
 * Uses @imagemagick/magick-wasm for Deno-compatible image processing.
 *
 * Pipeline:
 * 1. Download original image from storage
 * 2. Generate image variants (thumb: 200px, medium: 800px, large: 1600px)
 * 3. Convert to WebP format for optimal compression
 * 4. Generate BlurHash for placeholder display
 * 5. Upload variants to storage
 * 6. Update database with variants paths and blurhash
 *
 * @see https://supabase.com/docs/guides/functions/examples/image-manipulation
 * @see docs/stories/story-1.3.2-full-image-processing.md
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickGeometry,
  Gravity,
} from 'https://deno.land/x/imagemagick_deno@0.0.31/mod.ts'
import { encode as encodeBlurHash } from 'https://esm.sh/blurhash@2.0.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessImageRequest {
  photoId: string
  bucket: string
  path: string
  userId?: string
}

interface ProcessImageResponse {
  success: boolean
  message: string
  photoId?: string
  variants?: {
    thumb?: string
    medium?: string
    large?: string
  }
  blurhash?: string
  processingTimeMs?: number
}

interface VariantConfig {
  name: string
  width: number
  height: number | null
  quality: number
  fit: 'cover' | 'inside'
}

const VARIANT_CONFIGS: VariantConfig[] = [
  { name: 'thumb', width: 200, height: 200, quality: 70, fit: 'cover' },
  { name: 'medium', width: 800, height: null, quality: 80, fit: 'inside' },
  { name: 'large', width: 1600, height: null, quality: 85, fit: 'inside' },
]

// Initialize ImageMagick WASM
let magickInitialized = false

async function ensureMagickInitialized(): Promise<void> {
  if (magickInitialized) return

  try {
    await initializeImageMagick()
    magickInitialized = true
    console.log('[process-image] ImageMagick initialized')
  } catch (error) {
    console.error('[process-image] Failed to initialize ImageMagick:', error)
    throw new Error('Failed to initialize image processing library')
  }
}

/**
 * Resize image and convert to WebP
 */
function processVariant(
  imageData: Uint8Array,
  config: VariantConfig
): Uint8Array {
  return ImageMagick.read(imageData, (img) => {
    const originalWidth = img.width
    const originalHeight = img.height

    if (config.fit === 'cover' && config.height) {
      // Cover: resize to fill dimensions, then crop center
      const targetRatio = config.width / config.height
      const imageRatio = originalWidth / originalHeight

      let resizeWidth: number
      let resizeHeight: number

      if (imageRatio > targetRatio) {
        // Image is wider - resize by height, crop width
        resizeHeight = config.height
        resizeWidth = Math.round(originalWidth * (config.height / originalHeight))
      } else {
        // Image is taller - resize by width, crop height
        resizeWidth = config.width
        resizeHeight = Math.round(originalHeight * (config.width / originalWidth))
      }

      img.resize(resizeWidth, resizeHeight)
      img.crop(new MagickGeometry(config.width, config.height), Gravity.Center)
    } else {
      // Inside: resize to fit within dimensions, maintaining aspect ratio
      const targetWidth = config.width
      const targetHeight = config.height || Math.round(originalHeight * (config.width / originalWidth))

      const widthRatio = targetWidth / originalWidth
      const heightRatio = targetHeight / originalHeight
      const ratio = Math.min(widthRatio, heightRatio)

      const newWidth = Math.round(originalWidth * ratio)
      const newHeight = Math.round(originalHeight * ratio)

      img.resize(newWidth, newHeight)
    }

    // Set quality and convert to WebP
    img.quality = config.quality

    return img.write(MagickFormat.WebP, (data) => new Uint8Array(data))
  })
}

/**
 * Generate BlurHash from image
 * Uses a small 32x32 version for fast encoding
 */
function generateBlurHash(imageData: Uint8Array): string {
  return ImageMagick.read(imageData, (img) => {
    // Resize to small dimensions for BlurHash
    const blurWidth = 32
    const blurHeight = Math.round(img.height * (blurWidth / img.width))
    img.resize(blurWidth, blurHeight)

    // Get raw RGBA pixel data
    const pixels = img.getPixels((pixelCollection) => {
      const area = pixelCollection.getArea(0, 0, img.width, img.height)
      return new Uint8ClampedArray(area)
    })

    // Encode BlurHash (4x3 components)
    const blurhash = encodeBlurHash(pixels, img.width, img.height, 4, 3)
    return blurhash
  })
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Parse request body
    const { photoId, bucket, path }: ProcessImageRequest = await req.json()

    // Validate required fields
    if (!photoId || !bucket || !path) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields: photoId, bucket, and path are required',
        } as ProcessImageResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`[process-image] Processing image: ${photoId} from ${bucket}/${path}`)

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Initialize ImageMagick
    await ensureMagickInitialized()

    // 1. Download original image
    console.log(`[process-image] Downloading original: ${path}`)
    const { data: originalData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path)

    if (downloadError || !originalData) {
      throw new Error(`Failed to download original image: ${downloadError?.message || 'No data'}`)
    }

    const imageBuffer = new Uint8Array(await originalData.arrayBuffer())
    console.log(`[process-image] Downloaded ${imageBuffer.length} bytes`)

    // 2. Generate variants
    const basePath = path.replace(/\.[^.]+$/, '') // Remove extension
    const variants: Record<string, string> = {}
    const uploadPromises: Promise<void>[] = []

    for (const config of VARIANT_CONFIGS) {
      console.log(`[process-image] Generating ${config.name} variant...`)

      try {
        const variantData = processVariant(imageBuffer, config)
        const variantPath = `${basePath}_${config.name}.webp`

        console.log(`[process-image] ${config.name}: ${variantData.length} bytes -> ${variantPath}`)

        // Upload variant
        const uploadPromise = (async () => {
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(variantPath, variantData, {
              contentType: 'image/webp',
              upsert: true,
            })

          if (uploadError) {
            console.error(`[process-image] Failed to upload ${config.name}:`, uploadError)
            throw uploadError
          }

          variants[config.name] = variantPath
          console.log(`[process-image] Uploaded ${config.name}: ${variantPath}`)
        })()

        uploadPromises.push(uploadPromise)
      } catch (variantError) {
        console.error(`[process-image] Error generating ${config.name}:`, variantError)
        // Continue with other variants
      }
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises)

    // 3. Generate BlurHash
    console.log('[process-image] Generating BlurHash...')
    let blurhash: string | undefined

    try {
      blurhash = generateBlurHash(imageBuffer)
      console.log(`[process-image] BlurHash generated: ${blurhash}`)
    } catch (blurhashError) {
      console.error('[process-image] Error generating BlurHash:', blurhashError)
      // Continue without blurhash
    }

    // 4. Update database
    console.log('[process-image] Updating database...')
    const { error: updateError } = await supabase
      .from('photos')
      .update({
        blurhash: blurhash || null,
        variants: Object.keys(variants).length > 0 ? variants : null,
      })
      .eq('id', photoId)

    if (updateError) {
      console.error('[process-image] Database update error:', updateError)
      // Don't fail - variants are uploaded, just not linked
    }

    const processingTimeMs = Date.now() - startTime
    console.log(`[process-image] Completed in ${processingTimeMs}ms`)

    const response: ProcessImageResponse = {
      success: true,
      message: 'Image processed successfully',
      photoId,
      variants: Object.keys(variants).length > 0 ? variants as any : undefined,
      blurhash,
      processingTimeMs,
    }

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const processingTimeMs = Date.now() - startTime
    console.error('[process-image] Error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return new Response(
      JSON.stringify({
        success: false,
        message: `Error processing image: ${errorMessage}`,
        processingTimeMs,
      } as ProcessImageResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { decode } from 'blurhash';
import { cn } from '@/lib/utils';
import { getImageUrl, generateSrcSet, getImageSizes, ImageVariant, ImageVariants } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  blurhash?: string;
  alt: string;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  variant?: ImageVariant;
  variants?: ImageVariants;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  priority?: boolean;
}

/**
 * Decodes a BlurHash string into a data URL for use as a placeholder.
 */
function decodeBlurHashToDataURL(
  hash: string,
  width: number = 32,
  height: number = 32
): string {
  try {
    const pixels = decode(hash, width, height);

    // Create canvas to convert pixels to data URL
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return '';
    }

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
  } catch (error) {
    console.error('[OptimizedImage] Error decoding blurhash:', error);
    return '';
  }
}

/**
 * OptimizedImage component with BlurHash placeholder and progressive loading.
 *
 * Features:
 * - BlurHash placeholder that shows immediately while the image loads
 * - Smooth fade-in transition when the image is ready
 * - Support for responsive srcSet with multiple image variants
 * - Lazy loading by default for better performance
 */
export function OptimizedImage({
  src,
  blurhash,
  alt,
  sizes,
  className,
  containerClassName,
  variant = 'original',
  variants,
  fill = false,
  objectFit = 'cover',
  onLoad,
  priority = false,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Decode blurhash on mount (client-side only)
  useEffect(() => {
    if (blurhash && typeof window !== 'undefined') {
      const dataUrl = decodeBlurHashToDataURL(blurhash);
      setBlurDataUrl(dataUrl);
    }
  }, [blurhash]);

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // Get the appropriate URL for the requested variant
  const imageUrl = getImageUrl(src, variant, variants);
  const srcSet = generateSrcSet(src, variants);
  const imageSizes = sizes || getImageSizes('polaroid');

  const containerStyle: React.CSSProperties = fill
    ? { position: 'relative', width: '100%', height: '100%' }
    : {};

  const imageStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit,
      }
    : { objectFit };

  return (
    <div
      className={cn('relative overflow-hidden', containerClassName)}
      style={containerStyle}
    >
      {/* BlurHash placeholder */}
      {blurDataUrl && !loaded && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${blurDataUrl})`,
            filter: 'blur(20px)',
            transform: 'scale(1.1)', // Prevent blur edges from showing
          }}
          aria-hidden="true"
        />
      )}

      {/* Fallback gradient placeholder if no blurhash */}
      {!blurDataUrl && !loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageUrl}
        srcSet={srcSet}
        sizes={imageSizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-300 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={imageStyle}
      />
    </div>
  );
}

export default OptimizedImage;

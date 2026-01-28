/**
 * Image variants for optimized loading.
 * Each variant is a path to the optimized image in storage.
 */
export interface ImageVariants {
  thumb?: string;
  medium?: string;
  large?: string;
}

export interface Photo {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  fileName: string;
  userId: string | null;
  /** BlurHash string for placeholder display */
  blurhash?: string;
  /** Paths to optimized image variants */
  variants?: ImageVariants;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
} 
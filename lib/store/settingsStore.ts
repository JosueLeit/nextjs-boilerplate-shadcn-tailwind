import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Quality presets for compression
 */
export type CompressionQuality = 0.6 | 0.8 | 1.0

/**
 * Max dimension options
 */
export type MaxDimension = 1920 | 2048 | 4096

/**
 * Upload settings interface
 */
export interface UploadSettings {
  autoCompress: boolean
  compressionQuality: CompressionQuality
  maxDimension: MaxDimension
}

/**
 * Upload settings store state
 */
interface UploadSettingsState extends UploadSettings {
  // Actions
  setAutoCompress: (value: boolean) => void
  setCompressionQuality: (value: CompressionQuality) => void
  setMaxDimension: (value: MaxDimension) => void
  resetSettings: () => void
}

/**
 * Default upload settings
 */
const defaultSettings: UploadSettings = {
  autoCompress: true,
  compressionQuality: 0.8,
  maxDimension: 2048
}

/**
 * Zustand store for upload settings
 * Persisted to localStorage
 */
export const useUploadSettingsStore = create<UploadSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setAutoCompress: (value: boolean) =>
        set({ autoCompress: value }),

      setCompressionQuality: (value: CompressionQuality) =>
        set({ compressionQuality: value }),

      setMaxDimension: (value: MaxDimension) =>
        set({ maxDimension: value }),

      resetSettings: () =>
        set(defaultSettings)
    }),
    {
      name: 'upload-settings-storage'
    }
  )
)

/**
 * Quality label mapping for UI
 */
export const qualityLabels: Record<CompressionQuality, string> = {
  0.6: 'Economia - Menor qualidade, mais espaco',
  0.8: 'Balanceada (recomendado)',
  1.0: 'Alta (original) - Usa mais espaco'
}

/**
 * Dimension label mapping for UI
 */
export const dimensionLabels: Record<MaxDimension, string> = {
  1920: '1920px (Full HD)',
  2048: '2048px (2K)',
  4096: '4096px (4K)'
}

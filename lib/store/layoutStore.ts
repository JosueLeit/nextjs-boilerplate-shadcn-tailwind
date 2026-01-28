import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LayoutType = 'mosaic' | 'tumblr' | 'polaroid' | 'timeline' | 'masonry'

interface LayoutState {
  layout: LayoutType
  setLayout: (layout: LayoutType) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      layout: 'polaroid',
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'gallery-layout',
    }
  )
)

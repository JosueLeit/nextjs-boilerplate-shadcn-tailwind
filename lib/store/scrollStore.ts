import { create } from 'zustand'

interface ScrollState {
  positions: Record<string, number>
  setPosition: (key: string, position: number) => void
  getPosition: (key: string) => number
}

export const useScrollStore = create<ScrollState>((set, get) => ({
  positions: {},
  setPosition: (key, position) =>
    set((state) => ({
      positions: { ...state.positions, [key]: position },
    })),
  getPosition: (key) => get().positions[key] || 0,
}))

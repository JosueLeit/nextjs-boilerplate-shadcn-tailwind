import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false
      })
    } catch (error) {
      console.error('[AUTH] Erro ao verificar sessão:', error)
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
    }
  }
})) 
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { signIn, signOut, getCurrentUser } from '@/lib/supabaseClient'
import { toast } from '@/components/ui/use-toast'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const user = await getCurrentUser()
      set({ 
        user, 
        isAuthenticated: !!user, 
        loading: false 
      })

      if (!user && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err)
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      })
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null })

      const { data } = await signIn(email, password)

      if (data?.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          error: null
        })

        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo de volta!'
        })

        window.location.href = '/'
      }
    } catch (err: any) {
      set({ error: err.message })
      toast({
        title: 'Erro no login',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null })

      // Limpar estado local primeiro
      set({
        user: null,
        isAuthenticated: false
      })

      // Clear cookies and localStorage
      if (typeof window !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('supabase.auth.token');
      }

      await signOut()

      toast({
        title: 'Logout realizado',
        description: 'Você saiu da sua conta.'
      })

      window.location.href = '/login'
    } catch (err: any) {
      set({ error: err.message })
      toast({
        title: 'Erro ao sair',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      set({ loading: false })
    }
  }
})) 
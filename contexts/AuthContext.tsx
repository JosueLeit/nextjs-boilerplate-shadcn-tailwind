'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const clearError = () => setError(null);

  useEffect(() => {
    // Prevent double initialization in Strict Mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Update local state
      if (data.user) {
        setUser(data.user);
      }

      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo de volta!'
      });

      // Use window.location for full page reload to ensure middleware runs
      window.location.href = '/';
    } catch (err: any) {
      console.error('[AUTH] Erro no login:', err);
      setError(err.message);
      toast({
        title: 'Erro no login',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      toast({
        title: 'Registro realizado com sucesso',
        description: 'Verifique seu email para confirmar o cadastro.'
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (err: any) {
      console.error('[AUTH] Erro no registro:', err);
      setError(err.message);
      toast({
        title: 'Erro no registro',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear manually set cookies from signIn function
      if (typeof window !== 'undefined') {
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('supabase.auth.token');
      }

      setUser(null);

      toast({
        title: 'Logout realizado',
        description: 'Você saiu da sua conta.'
      });

      // Use window.location for full page reload to clear all state
      window.location.href = '/login';
    } catch (error: any) {
      console.error('[AUTH] Erro no logout:', error);
      toast({
        title: 'Erro ao sair',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    error,
    setError,
    clearError,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '@/lib/supabaseClient';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há um usuário logado ao iniciar a aplicação
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser || null);
      } catch (err) {
        console.error('Erro ao verificar usuário atual:', err);
      } finally {
        setLoading(false);
      }
    };

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    checkUser();

    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.user) {
        setUser(data.user);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await signUp(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        // No Supabase, o usuário precisa confirmar o email antes de estar completamente registrado
        setError('Verifique seu email para confirmar o registro');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar usuário');
      console.error('Erro de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      setUser(null);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer logout');
      console.error('Erro de logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 
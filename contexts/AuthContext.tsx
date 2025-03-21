'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

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

  // Função para debug
  const debugAuth = (msg: string, data?: any) => {
    console.log(`[AUTH] ${msg}`, data || '');
  };

  // Verificar se usuário está autenticado e redirecionar adequadamente
  useEffect(() => {
    if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      debugAuth('Usuário autenticado detectado na página de login/registro, redirecionando');
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    // Verificar se há um usuário logado ao iniciar a aplicação
    const checkUser = async () => {
      try {
        debugAuth('Verificando usuário atual');
        const currentUser = await getCurrentUser();
        debugAuth('Usuário atual:', currentUser);
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar usuário atual:', err);
      } finally {
        setLoading(false);
      }
    };

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugAuth(`Evento de autenticação: ${event}`, session?.user);
        
        if (event === 'SIGNED_IN') {
          debugAuth('Usuário logado, atualizando estado');
          setUser(session?.user || null);
          
          toast({
            title: 'Login realizado com sucesso',
            description: 'Bem-vindo de volta!',
          });
        } else if (event === 'SIGNED_OUT') {
          debugAuth('Usuário deslogado');
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    checkUser();

    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      debugAuth('Tentando login', { email });
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        debugAuth('Erro no login', error);
        throw new Error(error.message);
      }
      
      if (data?.user) {
        debugAuth('Login bem-sucedido', data.user);
        setUser(data.user);
        
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo de volta!'
        });
        
        // Navegação correta no Next.js
        // 1. Primeiro atualizar o estado da aplicação
        router.refresh();
        
        // 2. Depois redirecionar para home
        setTimeout(() => {
          debugAuth('Navegando para home após login');
          router.replace('/');
        }, 800);
      } else {
        debugAuth('Login sem usuário retornado');
        throw new Error('Usuário não encontrado');
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
      debugAuth('Tentando registro', { email });
      
      const { data, error } = await signUp(email, password);
      
      if (error) {
        debugAuth('Erro no registro', error);
        throw new Error(error.message);
      }
      
      if (data) {
        debugAuth('Registro bem-sucedido', data);
        // No Supabase, o usuário precisa confirmar o email antes de estar completamente registrado
        toast({
          title: 'Conta criada com sucesso',
          description: 'Verifique seu email para confirmar o registro',
        });
        
        // Atualizar o estado e navegar para login
        router.refresh();
        router.replace('/login');
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
      debugAuth('Tentando logout');
      
      const { error } = await signOut();
      
      if (error) {
        debugAuth('Erro no logout', error);
        throw new Error(error.message);
      }
      
      debugAuth('Logout bem-sucedido');
      setUser(null);
      
      toast({
        title: 'Logout realizado',
        description: 'Você saiu da sua conta.',
      });
      
      // Atualizar o estado e navegar para login
      router.refresh();
      router.replace('/login');
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
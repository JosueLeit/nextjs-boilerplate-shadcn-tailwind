'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Componente para extrair a lógica que usa o hook useSearchParams
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, setError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      // Limpar valores no form após submissão para evitar que fiquem no payload
      const emailValue = email;
      const passwordValue = password;
      setEmail('');
      setPassword('');
      
      await login(emailValue, passwordValue);
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      // Em caso de erro, restaurar valores para melhor UX
      setEmail(email);
      setPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md" autoComplete="off">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="mt-1"
            autoComplete="off"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/reset-password" className="text-sm text-pink-600 hover:text-pink-700">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mt-1"
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-600 hover:bg-pink-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-pink-600 hover:text-pink-700 font-medium">
            Registre-se
          </Link>
        </p>
      </div>
    </form>
  );
}

// Componente de fallback durante o carregamento
function LoginFormFallback() {
  return (
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
      </div>
      <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
      <div className="h-6 bg-gray-100 animate-pulse rounded w-3/4 mx-auto"></div>
    </div>
  );
}

export default function LoginPage() {
  const { error } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">FavoritePerson.app</h1>
          <p className="text-gray-600">Faça login para acessar suas memórias especiais</p>
        </div>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
} 
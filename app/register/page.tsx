'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Componente para o formulário de registro
function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, loading, error, setError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      // Limpar valores no form para não expor dados sensíveis
      const emailValue = email;
      const passwordValue = password;
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      await register(emailValue, passwordValue);
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setEmail(email);
      setPassword('');
      setConfirmPassword('');
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
          <Label htmlFor="password">Senha</Label>
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
          <p className="text-xs text-gray-500 mt-1">
            A senha deve ter no mínimo 6 caracteres
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Criando conta...
          </>
        ) : (
          'Criar Conta'
        )}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </form>
  );
}

// Componente de fallback durante o carregamento
function RegistrationFormFallback() {
  return (
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
        <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
      </div>
      <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
      <div className="h-6 bg-gray-100 animate-pulse rounded w-3/4 mx-auto"></div>
    </div>
  );
}

export default function RegisterPage() {
  const { error } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-600 mb-2">FavoritePerson.app</h1>
          <p className="text-gray-600">Crie uma conta para começar sua história de amor</p>
        </div>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<RegistrationFormFallback />}>
          <RegistrationForm />
        </Suspense>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPassword } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, informe seu email');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar redefinição de senha');
      console.error('Erro de redefinição de senha:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">Recuperar Senha</h1>
          <p className="text-gray-600">Enviaremos um link para redefinir sua senha</p>
        </div>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="bg-green-50 p-8 rounded-lg shadow-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-medium text-green-800 mb-2">Email enviado!</h3>
            <p className="text-green-600 mb-4">
              Verifique sua caixa de entrada para o link de redefinição de senha.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-2">
                Voltar para o login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
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
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link'
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                  Voltar para o login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 
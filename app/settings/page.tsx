'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Save, Calendar, Mail, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await getProfile(user.id);
        if (profile?.relationship_start_date) {
          setRelationshipStartDate(profile.relationship_start_date);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      await updateProfile(user.id, {
        relationship_start_date: relationshipStartDate || null,
      });

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas alteracoes foram salvas.',
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos de senha');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi alterada com sucesso.',
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-pink-600">Configuracoes</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-pink-500" />
            Informacoes do Relacionamento
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">O email nao pode ser alterado</p>
            </div>

            <div>
              <Label htmlFor="startDate">Data de inicio do relacionamento</Label>
              <Input
                id="startDate"
                type="date"
                value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta data e usada para calcular ha quanto tempo voces estao juntos
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alteracoes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-pink-500" />
            Alterar Senha
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Minimo de 6 caracteres</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={saving || !newPassword || !confirmPassword}
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Alterar Senha
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-sm font-medium text-red-800 mb-2">Zona de Perigo</h3>
          <p className="text-sm text-red-600 mb-3">
            Deseja excluir sua conta? Esta acao nao pode ser desfeita.
          </p>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-100"
            onClick={() => {
              toast({
                title: 'Funcionalidade em desenvolvimento',
                description: 'Em breve voce podera excluir sua conta.',
                variant: 'destructive',
              });
            }}
          >
            Excluir Conta
          </Button>
        </div>
      </main>
    </div>
  );
}

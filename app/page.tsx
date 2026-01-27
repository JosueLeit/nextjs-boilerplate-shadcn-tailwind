'use client'
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPhotos, getProfile, updateProfile, regenerateShareToken, ensureShareToken } from '@/lib/supabaseClient';
import PhotoGrid from '@/components/PhotoGrid';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut, QrCode, Heart, Camera, Share2, Lock, Settings } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import RelationshipTimer from '@/components/RelationshipTimer';
import PhotoUploadForm from '@/components/PhotoUploader';
import LoadingScreen from '@/components/LoadingScreen';
import { Photo } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function Home() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [startDate, setStartDate] = useState("");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout, loading: authLoading } = useAuth();

  // Prevent duplicate fetches
  const fetchedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if auth is still loading
    if (authLoading) return;

    // Skip if no user
    if (!user) {
      setLoading(false);
      return;
    }

    // Skip if already fetched for this user
    if (fetchedRef.current && currentUserIdRef.current === user.id) {
      return;
    }

    const controller = new AbortController();

    async function fetchData() {
      try {
        fetchedRef.current = true;
        currentUserIdRef.current = user!.id;

        // Fetch photos and profile in parallel
        const [photoList, profile] = await Promise.all([
          getPhotos(user!.id),
          getProfile(user!.id)
        ]);

        // Check if component is still mounted
        if (controller.signal.aborted) return;

        setPhotos(photoList);

        // Get data from profile (database)
        if (profile?.relationship_start_date) {
          setStartDate(profile.relationship_start_date);
        }
        if (profile?.share_token) {
          setShareToken(profile.share_token);
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err?.name === 'AbortError') return;
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [user, authLoading]);

  const handleUploadComplete = async (date: string) => {
    // Se a data estiver vazia, o usuário cancelou o upload
    if (!date) {
      setShowUploadForm(false);
      return;
    }

    try {
      // Atualizar a lista de fotos
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const newPhotos = await getPhotos(user.id);
      setPhotos(newPhotos);
      setShowUploadForm(false);

      // Se não tinha data inicial, salvar a nova data no banco de dados
      if (!startDate && date) {
        setStartDate(date);
        // Salvar a data no banco de dados
        await updateProfile(user.id, { relationship_start_date: date });

        toast({
          title: "Data inicial definida!",
          description: "A contagem do seu relacionamento começou.",
          variant: "default",
        });
      } else {
        toast({
          title: "Foto adicionada com sucesso!",
          description: "Sua memória foi salva.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar fotos:', error);
      toast({
        title: "Erro ao adicionar foto",
        description: "Não foi possível salvar sua memória. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
    toast({
      title: "Foto excluída",
      description: "A foto foi removida permanentemente.",
      variant: "destructive",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível desconectar sua conta.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateToken = async () => {
    if (!user?.id) return;

    try {
      const updatedProfile = await regenerateShareToken(user.id);
      setShareToken(updatedProfile.share_token);
      toast({
        title: "Novo link gerado!",
        description: "O link anterior foi revogado.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erro ao regenerar token:', err);
      toast({
        title: "Erro",
        description: "Não foi possível gerar um novo link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenShareModal = async () => {
    if (!user?.id) return;

    // If we already have a token, just open the modal
    if (shareToken) {
      setShowShareModal(true);
      return;
    }

    // Otherwise, ensure we have a token first
    try {
      const token = await ensureShareToken(user.id);
      setShareToken(token);
      setShowShareModal(true);
      toast({
        title: "Link de compartilhamento criado!",
        description: "Agora você pode compartilhar suas memórias.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erro ao criar token:', err);
      toast({
        title: "Erro",
        description: "Não foi possível criar o link de compartilhamento.",
        variant: "destructive",
      });
    }
  };

  // Show landing page if not authenticated
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <Heart className="w-6 h-6 text-pink-500 mr-2" />
              <h1 className="text-xl font-bold text-pink-600">FavoritePerson.app</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-pink-600 hover:text-pink-700">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-pink-600 hover:bg-pink-700">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 md:py-32 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Guarde suas memórias
              <span className="block text-pink-600">mais especiais</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Crie um mural digital privado com as fotos do seu relacionamento.
              Compartilhe com quem você ama através de um QR code exclusivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-lg px-8 py-6">
                  Comece Gratuitamente
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 text-lg px-8 py-6">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Suas Memórias
              </h3>
              <p className="text-gray-600">
                Faça upload de fotos especiais com datas e legendas para nunca esquecer cada momento.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Privado por Padrão
              </h3>
              <p className="text-gray-600">
                Suas memórias são privadas. Apenas você decide com quem compartilhar.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                QR Code Exclusivo
              </h3>
              <p className="text-gray-600">
                Compartilhe suas memórias com um QR code único que você pode revogar a qualquer momento.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <span className="font-semibold text-pink-600">FavoritePerson.app</span>
            </div>
            <p className="text-sm text-gray-500">
              Feito com amor para capturar momentos especiais
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-600">FavoritePerson.app</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Adicionar Memória</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenShareModal}
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              <QrCode className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            <Link href="/settings">
              <Button
                variant="outline"
                className="border-gray-300"
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Configuracoes</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-300"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {startDate && (
          <div className="mb-8">
            <RelationshipTimer startDate={startDate} />
          </div>
        )}

        {error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-800">
            {error}
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Nenhuma memória ainda</h2>
            <p className="text-gray-600 mb-6">
              Você ainda não tem memórias. Adicione sua primeira memória especial!
            </p>
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Primeira Memória
            </Button>
          </div>
        ) : (
          <PhotoGrid photos={photos} onDeletePhoto={handleDeletePhoto} />
        )}

        {showUploadForm && (
          <PhotoUploadForm
            onComplete={handleUploadComplete}
            existingStartDate={startDate}
          />
        )}

        {showShareModal && shareToken && (
          <QRCodeGenerator
            shareToken={shareToken}
            onRegenerate={handleRegenerateToken}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </main>

      <footer className="bg-white border-t py-6 mt-10 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2 flex items-center justify-center gap-1">Feito com <Heart className="h-4 w-4 text-red-500 inline" /> para capturar momentos especiais</p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} FavoritePerson.app - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

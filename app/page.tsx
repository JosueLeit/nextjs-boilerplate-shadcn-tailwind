'use client'
import React, { useState, useEffect } from 'react';
import { getPhotos } from '@/lib/supabaseClient';
import PhotoGrid from '@/components/PhotoGrid';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut } from 'lucide-react';
import RelationshipTimer from '@/components/RelationshipTimer';
import PhotoUploadForm from '@/components/PhotoUploader';
import LoadingScreen from '@/components/LoadingScreen';
import { Photo } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function Home() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      try {
        if (!user) return;
        
        const photoList = await getPhotos(user.id);
        setPhotos(photoList);
        
        // Obter a data mais antiga das fotos para usar como data de início
        if (photoList.length > 0) {
          const dates = photoList.map(photo => new Date(photo.date).getTime());
          const oldestDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
          setStartDate(oldestDate);
        }
      } catch (err) {
        console.error('Erro ao carregar fotos:', err);
        setError('Não foi possível carregar as fotos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [user]);

  const handleUploadComplete = (date: string) => {
    // Se a data estiver vazia, o usuário cancelou o upload
    if (!date) {
      setShowUploadForm(false);
      return;
    }
    
    // Salvar a data de início se for a primeira foto
    if (!startDate && date) {
      setStartDate(date);
      toast({
        title: "Data inicial salva!",
        description: "A contagem do seu relacionamento começou.",
        variant: "default",
      });
    }

    // Atualizar a lista de fotos
    getPhotos(user?.id).then(newPhotos => {
      setPhotos(newPhotos);
      setShowUploadForm(false);
      toast({
        title: "Foto adicionada com sucesso!",
        description: "Sua memória foi salva.",
        variant: "default",
      });
    });
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-600">FavoritePerson.app</h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Memória
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-gray-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
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
      </main>

      <footer className="bg-white border-t py-6 mt-10 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-2">Feito com ❤️ para capturar momentos especiais</p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} FavoritePerson.app - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

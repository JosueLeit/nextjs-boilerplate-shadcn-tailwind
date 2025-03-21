'use client'
import { useEffect, useState } from "react";
import FavoritePerson from "@/components/PhotoWall";
import RelationshipTimer from "@/components/RelationshipCounter";
import { getPhotos } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import PhotoUploadForm from "@/components/PhotoUploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [photos, setPhotos] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Recuperar a data inicial do localStorage ao carregar
    const savedStartDate = localStorage.getItem('relationship_start_date');
    if (savedStartDate) {
      setStartDate(savedStartDate);
    }
    
    fetchPhotos();
  }, [refreshTrigger]);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const fetchedPhotos = await getPhotos();
      setPhotos(fetchedPhotos);
      setIsLoading(false);
    } catch (error: any) {
      setError('Erro ao carregar as fotos');
      setIsLoading(false);
    }
  }

  const handleUploadComplete = (date: string) => {
    // Se a data estiver vazia, significa que o usuário cancelou o upload
    if (!date) {
      setShowUploadForm(false);
      return;
    }
    
    // Caso contrário, continuar com o fluxo normal
    localStorage.setItem('relationship_start_date', date);
    setStartDate(date);
    setShowUploadForm(false);
    setRefreshTrigger(prev => prev + 1);
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  }

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-100 flex items-center justify-center">Carregando...</div>
  }
  
  return (
  <main className="min-h-screen bg-neutral-100">
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
          <div className="w-full sm:flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">A história de nós dois tem</h1>
              {startDate && (
                <RelationshipTimer 
                  initialDate={startDate} 
                  className="font-semibold text-pink-600 text-base mt-2 sm:mt-0 bg-pink-50 py-1 px-3 rounded-full shadow-sm" 
                />
              )}
            </div>
          </div>
          <Button onClick={() => setShowUploadForm(true)} className="bg-pink-600 hover:bg-pink-700 shrink-0">
            Envie uma nova foto
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <FavoritePerson 
          photos={photos} 
          startDate={startDate}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
    {showUploadForm && <PhotoUploadForm onComplete={handleUploadComplete} existingStartDate={startDate} />}
  </main>
  );
}

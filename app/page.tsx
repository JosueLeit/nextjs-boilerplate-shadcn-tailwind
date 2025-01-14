'use client'
import { useEffect, useState } from "react";
import PhotoWall from "@/components/PhotoWall";
import { getPhotos } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import PhotoUploadForm from "@/components/PhotoUploader";

export default function Home() {
  const [photos, setPhotos] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [startDate, setStartDate] = useState('');


  useEffect(() => {
    fetchPhotos();
  }, [])

  const fetchPhotos = async () => {
    try {
      const fetchedPhotos = await getPhotos();
      setPhotos(fetchedPhotos);
      setIsLoading(false);
    } catch (error: any) {
      setError('Erro ao carregar as fotos');
      setIsLoading(false);
    }
  }

  const handleUploadComplete = (date: string) => {
    setStartDate(date);
    setShowUploadForm(false);
    fetchPhotos();
  }

  if (isLoading) {
    return <div className="min-h-screen bg-neutral-100 flex items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="min-h-screen bg-neutral-100 flex items-center justify-center">{error}</div>
  } 
  return (
  <main className="min-h-screen bg-neutral-100">
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">A história de nós dois</h1>
        <Button onClick={()=> setShowUploadForm(true)}>Envie uma nova foto</Button>
        </div>
        <PhotoWall photos={photos} startDate={startDate}/>
      </div>
    </div>
    {showUploadForm && <PhotoUploadForm onComplete={handleUploadComplete} />}
  </main>
  );
}

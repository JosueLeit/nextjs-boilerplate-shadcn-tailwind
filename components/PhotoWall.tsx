import React, { useState } from 'react'
import Polaroid from './Polaroid'
// import PhotoUploader from './PhotoUploader'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Photo {
  id: any
  imageUrl: string
  caption: string
  date: string
  fileName: string
}

interface FavoritePersonProps {
  photos: Photo[];
  startDate?: string;
  onRefresh: () => void;
}

const FavoritePerson: React.FC<FavoritePersonProps> = ({photos, startDate, onRefresh}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (photos.length === 0){
    return(
      <div className="min-h-screen bg-neutral-100 flex, items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500"/>
      </div>
    )
  }

  const handlePhotoDelete = () => {
    onRefresh();
  }

  const handlePhotoEdit = async (photo: Photo, newCaption: string, newDate: string) => {
    if (photo.date === newDate && photo.caption === newCaption) return;
    
    setIsProcessing(true);
    try {
      // 1. Se a data ou legenda mudou, precisa renomear o arquivo
      const oldFilename = photo.fileName;
      const fileExt = oldFilename.split('.').pop();
      const newFilename = `${newDate}-${newCaption}.${fileExt}`;
      
      if (oldFilename !== newFilename) {
        // 2. Obter o arquivo original
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('vcinesquecivel')
          .download(oldFilename);
          
        if (downloadError) throw downloadError;
        
        // 3. Fazer upload com o novo nome
        const { error: uploadError } = await supabase.storage
          .from('vcinesquecivel')
          .upload(newFilename, fileData, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        // 4. Excluir o arquivo antigo
        const { error: deleteError } = await supabase.storage
          .from('vcinesquecivel')
          .remove([oldFilename]);
          
        if (deleteError) throw deleteError;
      }
      
      // 5. Atualizar a lista de fotos
      onRefresh();
    } catch (error) {
      console.error('Erro ao editar a foto:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-neutral-200 p-8 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {photos.map((photo) => (
          <div key={photo.id} className="flex justify-center">
            <Polaroid 
              imageUrl={photo.imageUrl} 
              caption={photo.caption} 
              date={photo.date} 
              fileName={photo.fileName}
              onDelete={() => handlePhotoDelete()}
              onEdit={(newCaption, newDate) => handlePhotoEdit(photo, newCaption, newDate)}
            />
          </div>
        ))}
      </div>
      {/* <div className="text-center bg-white p-6 rounded-lg shadow-md">
      </div> */}
    </div>
  )
}

export default FavoritePerson


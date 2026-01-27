import React, { useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Trash2, Loader2, Maximize, Minimize } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { Photo } from '@/types'

interface PolaroidProps {
  photo: Photo
  onDelete: () => void
}

export default function Polaroid({ photo, onDelete }: PolaroidProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  let formattedDate;
  try {
    let dateObj;
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(photo.date)) {
      dateObj = new Date(photo.date);
    } else {
      const parts = photo.date.split('/');
      if (parts.length === 3) {
        dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        dateObj = new Date(photo.date);
      }
    }
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Data inválida');
    }
    
    formattedDate = format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  } catch (error) {
    console.error('Erro ao formatar data:', error, photo.date);
    formattedDate = photo.date;
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Deletar arquivo do storage
      const { error } = await supabase
        .storage
        .from('vcinesquecivel')
        .remove([photo.fileName]);
        
      if (error) throw error;
      
      // Chamar callback para atualizar o estado
      onDelete();
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <>
      <motion.div 
        className={`relative ${fullscreen ? 'fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center' : 'bg-white p-3 shadow-lg'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${fullscreen ? 'max-w-5xl w-full h-full max-h-screen flex flex-col items-center justify-center' : 'relative overflow-hidden'}`}>
          <div className={`${fullscreen ? 'w-full h-full flex items-center justify-center' : 'relative overflow-hidden pb-[100%]'}`}>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}
            <img 
              src={photo.imageUrl} 
              alt={photo.caption} 
              className={`${fullscreen ? 'max-h-[90vh] max-w-full object-contain' : 'absolute inset-0 w-full h-full object-cover'} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={handleImageLoad}
            />
          </div>
          
          <div className={`${fullscreen ? 'text-white mt-4 text-center w-full max-w-2xl' : 'p-3 bg-white'}`}>
            <h3 className={`${fullscreen ? 'text-2xl font-bold mb-2' : 'text-lg font-medium mb-1'} truncate`}>
              {photo.caption}
            </h3>
            <p className={`${fullscreen ? 'text-gray-300' : 'text-sm text-gray-500'}`}>
              {formattedDate}
            </p>
          </div>
        </div>

        <div className={`absolute top-3 right-3 flex space-x-2 ${fullscreen ? 'opacity-100' : isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          {fullscreen ? (
            <button
              onClick={toggleFullscreen}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full text-white transition-colors"
              title="Fechar visualização em tela cheia"
            >
              <Minimize className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={toggleFullscreen}
                className="bg-black/20 backdrop-blur-sm hover:bg-black/30 p-2 rounded-full text-white transition-colors"
                title="Ver em tela cheia"
              >
                <Maximize className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white transition-colors"
                title="Excluir foto"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A foto será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

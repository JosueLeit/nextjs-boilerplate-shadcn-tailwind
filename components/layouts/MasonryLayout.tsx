'use client'

import React, { useState } from 'react'
import Masonry from 'react-masonry-css'
import { motion } from 'framer-motion'
import { LayoutProps } from './types'
import { OptimizedImage } from '../OptimizedImage'
import { Trash2, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { supabase } from '@/lib/supabaseClient'
import { Photo } from '@/types'

interface MasonryPhotoProps {
  photo: Photo
  onDelete: () => void
}

function MasonryPhoto({ photo, onDelete }: MasonryPhotoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const { error } = await supabase.storage
        .from('vcinesquecivel')
        .remove([photo.fileName])
      if (error) throw error
      onDelete()
    } catch (error) {
      console.error('Erro ao deletar foto:', error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <motion.div
        className="relative rounded-lg overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <OptimizedImage
          src={photo.imageUrl}
          alt={photo.caption}
          blurhash={photo.blurhash}
          variants={photo.variants}
          variant="medium"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-auto"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-medium">{photo.caption}</p>
            <p className="text-white/70 text-xs">{photo.date}</p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className={`absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. A foto sera permanentemente removida.
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

const breakpointColumns = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 2,
}

export default function MasonryLayout({ photos, onDeletePhoto }: LayoutProps) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-3 w-auto"
      columnClassName="pl-3 bg-clip-padding"
    >
      {photos.map((photo) => (
        <div key={photo.id} className="mb-3">
          <MasonryPhoto photo={photo} onDelete={() => onDeletePhoto(photo.id)} />
        </div>
      ))}
    </Masonry>
  )
}

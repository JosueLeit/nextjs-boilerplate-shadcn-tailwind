'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { LayoutProps } from './types'
import { OptimizedImage } from '../OptimizedImage'
import { Trash2, Loader2, Maximize, Minimize } from 'lucide-react'
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

// Generate a consistent rotation for each photo based on its ID
function getRotation(id: string): number {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ((hash % 7) - 3) // Returns -3 to 3 degrees
}

interface PolaroidPhotoProps {
  photo: Photo
  onDelete: () => void
}

function PolaroidPhoto({ photo, onDelete }: PolaroidPhotoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const rotation = useMemo(() => getRotation(photo.id), [photo.id])

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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt })
    } catch {
      return dateStr
    }
  }

  if (fullscreen) {
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center">
          <OptimizedImage
            src={photo.imageUrl}
            alt={photo.caption}
            blurhash={photo.blurhash}
            variants={photo.variants}
            variant="large"
            sizes="100vw"
            className="max-h-[80vh] max-w-full object-contain"
          />
          <div className="text-white mt-4 text-center">
            <h3 className="text-2xl font-bold mb-2">{photo.caption}</h3>
            <p className="text-gray-300">{formatDate(photo.date)}</p>
          </div>
        </div>
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full text-white"
        >
          <Minimize className="w-6 h-6" />
        </button>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className="relative bg-white p-3 pb-16 shadow-lg hover:shadow-xl transition-shadow duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
        initial={{ opacity: 0, y: 20, rotate: rotation }}
        animate={{ opacity: 1, y: 0, rotate: rotation }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Tape decoration */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-yellow-200/80 rotate-[-2deg] shadow-sm" />

        <div className="relative overflow-hidden aspect-square">
          <OptimizedImage
            src={photo.imageUrl}
            alt={photo.caption}
            blurhash={photo.blurhash}
            variants={photo.variants}
            variant="medium"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Caption area styled like handwritten note */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white">
          <p
            className="text-gray-800 text-sm truncate"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            {photo.caption}
          </p>
          <p className="text-gray-400 text-xs mt-1">{formatDate(photo.date)}</p>
        </div>

        {/* Action buttons */}
        <div
          className={`absolute top-1 right-1 flex gap-1 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => setFullscreen(true)}
            className="bg-black/20 backdrop-blur-sm hover:bg-black/30 p-1.5 rounded-full text-white"
            title="Ver em tela cheia"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-red-500/80 hover:bg-red-500 p-1.5 rounded-full text-white"
            title="Excluir foto"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
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

export default function PolaroidLayout({ photos, onDeletePhoto }: LayoutProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
      {photos.map((photo) => (
        <PolaroidPhoto
          key={photo.id}
          photo={photo}
          onDelete={() => onDeletePhoto(photo.id)}
        />
      ))}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { LayoutProps } from './types'
import { OptimizedImage } from '../OptimizedImage'
import { Trash2, Loader2, Share2, Heart } from 'lucide-react'
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

interface PostCardProps {
  photo: LayoutProps['photos'][0]
  onDelete: () => void
}

function PostCard({ photo, onDelete }: PostCardProps) {
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: pt })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <motion.article
        className="bg-white rounded-lg shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <OptimizedImage
          src={photo.imageUrl}
          alt={photo.caption}
          blurhash={photo.blurhash}
          variants={photo.variants}
          variant="large"
          sizes="(max-width: 600px) 100vw, 600px"
          className="w-full h-auto"
        />

        <div className="p-4">
          <p className="text-gray-800 text-lg mb-2">{photo.caption}</p>
          <p className="text-gray-500 text-sm mb-4">{formatDate(photo.date)}</p>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Curtir</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Compartilhar</span>
              </button>
            </div>

            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Excluir foto"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.article>

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

export default function TumblrLayout({ photos, onDeletePhoto }: LayoutProps) {
  return (
    <div className="max-w-[600px] mx-auto space-y-8 p-4">
      {photos.map((photo) => (
        <PostCard
          key={photo.id}
          photo={photo}
          onDelete={() => onDeletePhoto(photo.id)}
        />
      ))}
    </div>
  )
}

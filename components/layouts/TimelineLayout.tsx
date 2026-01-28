'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
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

interface TimelinePhotoProps {
  photo: Photo
  onDelete: () => void
}

function TimelinePhoto({ photo, onDelete }: TimelinePhotoProps) {
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
        className="relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <OptimizedImage
          src={photo.imageUrl}
          alt={photo.caption}
          blurhash={photo.blurhash}
          variants={photo.variants}
          variant="thumb"
          sizes="160px"
          className="w-full h-full object-cover"
        />

        {/* Caption overlay */}
        <div
          className={`absolute inset-0 bg-black/50 flex items-end p-2 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-white text-xs truncate w-full">{photo.caption}</p>
        </div>

        {/* Delete button */}
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className={`absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 p-1.5 rounded-full text-white transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
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

function groupPhotosByDate(photos: Photo[]): Record<string, Photo[]> {
  return photos.reduce((groups, photo) => {
    const dateKey = photo.date.split('T')[0] // Get YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(photo)
    return groups
  }, {} as Record<string, Photo[]>)
}

function formatDateHeader(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })
  } catch {
    return dateStr
  }
}

export default function TimelineLayout({ photos, onDeletePhoto }: LayoutProps) {
  const groupedPhotos = useMemo(() => {
    const grouped = groupPhotosByDate(photos)
    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
    return sortedDates.map((date) => ({
      date,
      photos: grouped[date],
    }))
  }, [photos])

  return (
    <div className="relative pl-8 md:pl-12 py-4">
      {/* Timeline line */}
      <div className="absolute left-3 md:left-5 top-0 bottom-0 w-0.5 bg-pink-300" />

      {groupedPhotos.map(({ date, photos: datePhotos }) => (
        <section key={date} className="mb-8 relative">
          {/* Timeline dot */}
          <div className="absolute -left-5 md:-left-7 top-1 w-4 h-4 bg-pink-500 rounded-full border-4 border-pink-100" />

          {/* Date header */}
          <h3 className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-2 px-3 mb-3 font-semibold text-gray-700 rounded-lg capitalize">
            {formatDateHeader(date)}
          </h3>

          {/* Photos horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent">
            {datePhotos.map((photo) => (
              <TimelinePhoto
                key={photo.id}
                photo={photo}
                onDelete={() => onDeletePhoto(photo.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

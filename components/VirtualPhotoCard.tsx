'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Photo } from '@/types'
import { LayoutType } from '@/lib/store/layoutStore'
import { OptimizedImage } from './OptimizedImage'
import { Trash2, Loader2, Maximize } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { supabase } from '@/lib/supabaseClient'

interface VirtualPhotoCardProps {
  photo: Photo
  layout: LayoutType
  onDelete: () => void
}

// Generate rotation for polaroid layout
function getRotation(id: string): number {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return ((hash % 7) - 3)
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return format(date, "dd 'de' MMMM", { locale: pt })
  } catch {
    return dateStr
  }
}

export default function VirtualPhotoCard({ photo, layout, onDelete }: VirtualPhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const rotation = useMemo(() => layout === 'polaroid' ? getRotation(photo.id) : 0, [photo.id, layout])

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

  // Polaroid style
  if (layout === 'polaroid') {
    return (
      <>
        <div
          className="relative bg-white p-2 pb-12 shadow-lg hover:shadow-xl transition-shadow h-full"
          style={{ transform: `rotate(${rotation}deg)` }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tape */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-5 bg-yellow-200/80 rotate-[-2deg]" />

          <div className="relative aspect-square overflow-hidden">
            <OptimizedImage
              src={photo.imageUrl}
              alt={photo.caption}
              blurhash={photo.blurhash}
              variants={photo.variants}
              variant="medium"
              sizes="300px"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2 bg-white">
            <p className="text-gray-800 text-xs truncate" style={{ fontFamily: "'Caveat', cursive" }}>
              {photo.caption}
            </p>
            <p className="text-gray-400 text-[10px]">{formatDate(photo.date)}</p>
          </div>

          {/* Actions */}
          <div className={`absolute top-1 right-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-red-500/80 hover:bg-red-500 p-1 rounded-full text-white"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      </>
    )
  }

  // Mosaic/Masonry style (default)
  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden h-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <OptimizedImage
          src={photo.imageUrl}
          alt={photo.caption}
          blurhash={photo.blurhash}
          variants={photo.variants}
          variant="medium"
          sizes="(max-width: 640px) 50vw, 300px"
          className="w-full h-full object-cover"
          containerClassName="aspect-square"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
            <p className="text-white/70 text-[10px]">{formatDate(photo.date)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className={`absolute top-1 right-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-red-500/80 hover:bg-red-500 p-1.5 rounded-full text-white"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}

// Shared delete dialog
function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta foto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acao nao pode ser desfeita. A foto sera permanentemente removida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600">
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
  )
}

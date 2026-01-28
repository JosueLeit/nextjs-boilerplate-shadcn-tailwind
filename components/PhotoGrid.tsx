'use client'

import React from 'react'
import { Photo } from '@/types'
import GalleryGrid from './GalleryGrid'
import LayoutSwitcher, { LayoutSwitcherCompact } from './LayoutSwitcher'

interface PhotoGridProps {
  photos: Photo[]
  onDeletePhoto: (id: string) => void
}

export default function PhotoGrid({ photos, onDeletePhoto }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mb-6 text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhuma foto ainda
        </h3>
        <p className="text-gray-500 max-w-md">
          Comece a construir sua galeria adicionando suas primeiras fotos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with layout switcher */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
        </p>

        {/* Desktop layout switcher */}
        <div className="hidden sm:block">
          <LayoutSwitcher />
        </div>

        {/* Mobile layout switcher */}
        <div className="sm:hidden">
          <LayoutSwitcherCompact />
        </div>
      </div>

      {/* Gallery */}
      <GalleryGrid photos={photos} onDeletePhoto={onDeletePhoto} />
    </div>
  )
}

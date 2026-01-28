'use client'

import React, { useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Photo } from '@/types'
import { useLayoutStore, LayoutType } from '@/lib/store/layoutStore'
import MosaicLayout from './layouts/MosaicLayout'
import TumblrLayout from './layouts/TumblrLayout'
import PolaroidLayout from './layouts/PolaroidLayout'
import TimelineLayout from './layouts/TimelineLayout'
import MasonryLayout from './layouts/MasonryLayout'
import VirtualGallery from './VirtualGallery'
import VirtualPhotoCard from './VirtualPhotoCard'

interface GalleryGridProps {
  photos: Photo[]
  onDeletePhoto: (id: string) => void
}

// Threshold for enabling virtual scrolling
const VIRTUAL_SCROLL_THRESHOLD = 50

// Regular layout components (for small galleries)
const layoutComponents = {
  mosaic: MosaicLayout,
  tumblr: TumblrLayout,
  polaroid: PolaroidLayout,
  timeline: TimelineLayout,
  masonry: MasonryLayout,
}

export default function GalleryGrid({ photos, onDeletePhoto }: GalleryGridProps) {
  const { layout } = useLayoutStore()

  // Sort photos by date descending (most recent first)
  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  }, [photos])

  // Use virtual scrolling for large galleries
  const useVirtualScroll = sortedPhotos.length > VIRTUAL_SCROLL_THRESHOLD

  // Render function for virtual gallery items
  const renderVirtualItem = useCallback(
    (photo: Photo, index: number) => (
      <VirtualPhotoCard
        photo={photo}
        layout={layout}
        onDelete={() => onDeletePhoto(photo.id)}
      />
    ),
    [layout, onDeletePhoto]
  )

  // For layouts that don't work well with grid virtualization, fall back to regular
  const supportsVirtualization = layout !== 'timeline' && layout !== 'tumblr'

  if (useVirtualScroll && supportsVirtualization) {
    return (
      <VirtualGallery
        photos={sortedPhotos}
        layout={layout}
        renderItem={renderVirtualItem}
        scrollKey={`gallery-${layout}`}
      />
    )
  }

  // Regular rendering for small galleries or non-virtualizable layouts
  const LayoutComponent = layoutComponents[layout]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layout}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <LayoutComponent photos={sortedPhotos} onDeletePhoto={onDeletePhoto} />
      </motion.div>
    </AnimatePresence>
  )
}

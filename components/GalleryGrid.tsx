'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Photo } from '@/types'
import { useLayoutStore } from '@/lib/store/layoutStore'
import MosaicLayout from './layouts/MosaicLayout'
import TumblrLayout from './layouts/TumblrLayout'
import PolaroidLayout from './layouts/PolaroidLayout'
import TimelineLayout from './layouts/TimelineLayout'
import MasonryLayout from './layouts/MasonryLayout'

interface GalleryGridProps {
  photos: Photo[]
  onDeletePhoto: (id: string) => void
}

const layoutComponents = {
  mosaic: MosaicLayout,
  tumblr: TumblrLayout,
  polaroid: PolaroidLayout,
  timeline: TimelineLayout,
  masonry: MasonryLayout,
}

export default function GalleryGrid({ photos, onDeletePhoto }: GalleryGridProps) {
  const { layout } = useLayoutStore()
  const LayoutComponent = layoutComponents[layout]

  // Sort photos by date descending (most recent first)
  const sortedPhotos = [...photos].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

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

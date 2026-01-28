'use client'

import React, { useRef, useCallback, useEffect, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Photo } from '@/types'
import { LayoutType } from '@/lib/store/layoutStore'
import { useScrollStore } from '@/lib/store/scrollStore'

interface VirtualGalleryProps {
  photos: Photo[]
  layout: LayoutType
  renderItem: (photo: Photo, index: number) => React.ReactNode
  getItemSize?: (index: number) => number
  columns?: number
  gap?: number
  overscan?: number
  scrollKey?: string
}

// Default row heights for different layouts
const DEFAULT_ROW_HEIGHTS: Record<LayoutType, number> = {
  polaroid: 380,
  mosaic: 300,
  masonry: 300,
  tumblr: 600,
  timeline: 200,
}

// Default columns for different layouts
const DEFAULT_COLUMNS: Record<LayoutType, number> = {
  polaroid: 4,
  mosaic: 4,
  masonry: 4,
  tumblr: 1,
  timeline: 1,
}

export default function VirtualGallery({
  photos,
  layout,
  renderItem,
  getItemSize,
  columns: propColumns,
  gap = 16,
  overscan = 5,
  scrollKey = 'gallery',
}: VirtualGalleryProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const { setPosition, getPosition } = useScrollStore()
  const [isScrolling, setIsScrolling] = useState(false)

  // Responsive columns
  const [columns, setColumns] = useState(propColumns || DEFAULT_COLUMNS[layout])

  useEffect(() => {
    if (propColumns) {
      setColumns(propColumns)
      return
    }

    const updateColumns = () => {
      const width = window.innerWidth
      let cols = DEFAULT_COLUMNS[layout]

      if (layout === 'tumblr' || layout === 'timeline') {
        cols = 1
      } else if (width < 640) {
        cols = 2
      } else if (width < 1024) {
        cols = 3
      } else if (width < 1280) {
        cols = 4
      } else {
        cols = 5
      }

      setColumns(cols)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [layout, propColumns])

  // Calculate row count
  const rowCount = Math.ceil(photos.length / columns)

  // Estimate row size
  const estimateSize = useCallback(
    (index: number) => {
      if (getItemSize) {
        return getItemSize(index)
      }
      return DEFAULT_ROW_HEIGHTS[layout]
    },
    [layout, getItemSize]
  )

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
    paddingStart: gap,
    paddingEnd: gap,
  })

  // Scroll position persistence
  const handleScroll = useCallback(() => {
    if (parentRef.current) {
      setPosition(scrollKey, parentRef.current.scrollTop)
    }
  }, [scrollKey, setPosition])

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = getPosition(scrollKey)
    if (savedPosition && parentRef.current) {
      parentRef.current.scrollTop = savedPosition
    }
  }, [scrollKey, getPosition])

  // Track scrolling state for skeleton optimization
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScrollStart = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    const element = parentRef.current
    if (element) {
      element.addEventListener('scroll', handleScrollStart)
      return () => {
        element.removeEventListener('scroll', handleScrollStart)
        clearTimeout(scrollTimeout)
      }
    }
  }, [])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-auto"
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const rowPhotos = photos.slice(startIndex, startIndex + columns)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: `${gap}px`,
                  padding: `0 ${gap}px`,
                }}
              >
                {rowPhotos.map((photo, colIndex) => (
                  <div key={photo.id} className="min-w-0">
                    {isScrolling ? (
                      <PhotoSkeleton />
                    ) : (
                      renderItem(photo, startIndex + colIndex)
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Skeleton placeholder during fast scroll
function PhotoSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg aspect-square w-full" />
  )
}

// Export for use in layouts that need custom virtualization
export { PhotoSkeleton }

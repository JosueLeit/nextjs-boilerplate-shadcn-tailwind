'use client'

import React from 'react'
import { LayoutGrid, List, Square, Clock, Columns3 } from 'lucide-react'
import { useLayoutStore, LayoutType } from '@/lib/store/layoutStore'
import { cn } from '@/lib/utils'

interface LayoutOption {
  id: LayoutType
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

const layouts: LayoutOption[] = [
  {
    id: 'mosaic',
    icon: LayoutGrid,
    label: 'Mosaico',
    description: 'Estilo Pinterest',
  },
  {
    id: 'tumblr',
    icon: List,
    label: 'Blog',
    description: 'Coluna unica',
  },
  {
    id: 'polaroid',
    icon: Square,
    label: 'Polaroid',
    description: 'Fotos instantaneas',
  },
  {
    id: 'timeline',
    icon: Clock,
    label: 'Linha do tempo',
    description: 'Por data',
  },
  {
    id: 'masonry',
    icon: Columns3,
    label: 'Grade',
    description: 'Masonry classico',
  },
]

export default function LayoutSwitcher() {
  const { layout, setLayout } = useLayoutStore()

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {layouts.map((l) => {
        const Icon = l.icon
        const isActive = layout === l.id

        return (
          <button
            key={l.id}
            onClick={() => setLayout(l.id)}
            className={cn(
              'p-2 rounded-md transition-all duration-200',
              'hover:bg-white/50',
              'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1',
              isActive && 'bg-white shadow-sm'
            )}
            title={`${l.label} - ${l.description}`}
            aria-label={l.label}
            aria-pressed={isActive}
          >
            <Icon
              className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-pink-600' : 'text-gray-500'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// Compact version for mobile
export function LayoutSwitcherCompact() {
  const { layout, setLayout } = useLayoutStore()

  return (
    <select
      value={layout}
      onChange={(e) => setLayout(e.target.value as LayoutType)}
      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
    >
      {layouts.map((l) => (
        <option key={l.id} value={l.id}>
          {l.label}
        </option>
      ))}
    </select>
  )
}

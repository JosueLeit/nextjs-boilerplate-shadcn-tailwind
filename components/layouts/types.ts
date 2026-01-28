import { Photo } from '@/types'

export interface LayoutProps {
  photos: Photo[]
  onDeletePhoto: (id: string) => void
}

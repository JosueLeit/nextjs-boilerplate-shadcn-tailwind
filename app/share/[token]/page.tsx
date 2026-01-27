'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'
import { getProfileByShareToken, supabase } from '@/lib/supabaseClient'
import { Profile } from '@/lib/supabaseClient'
import { Photo } from '@/types'
import RelationshipTimer from '@/components/RelationshipTimer'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

export default function SharePage() {
  const params = useParams()
  const token = params.token as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch profile by share token
        const profileData = await getProfileByShareToken(token)

        if (!profileData) {
          setError('Link inválido ou expirado')
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Fetch photos for this user
        const { data: photoList, error: photoError } = await supabase
          .storage
          .from('vcinesquecivel')
          .list(profileData.id, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' }
          })

        if (photoError) {
          console.error('Error fetching photos:', photoError)
        } else if (photoList) {
          const processedPhotos = photoList
            .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|tiff|bmp|svg)$/i))
            .map(file => {
              const fileNameWithoutExt = file.name.split('.')[0]
              const match = fileNameWithoutExt.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/)

              if (!match) return null

              const [_, year, month, day, rawCaption] = match
              const dateStr = `${year}-${month}-${day}`
              const caption = rawCaption.replace(/-/g, ' ')
              const fullPath = `${profileData.id}/${file.name}`

              return {
                id: file.id,
                imageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vcinesquecivel/${fullPath}`,
                caption,
                date: dateStr,
                fileName: fullPath,
                userId: profileData.id
              }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setPhotos(processedPhotos)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Erro ao carregar memórias')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando memórias...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Heart className="w-6 h-6 text-pink-500 mr-2" />
            <h1 className="text-xl font-bold text-pink-600">FavoritePerson</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Relationship Timer */}
        {profile?.relationship_start_date && (
          <div className="mb-8">
            <RelationshipTimer startDate={profile.relationship_start_date} />
          </div>
        )}

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <Heart className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Ainda não há memórias
            </h2>
            <p className="text-gray-600">
              As memórias aparecerão aqui quando forem adicionadas.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group photos by year/month */}
            {Object.entries(
              photos.reduce((acc, photo) => {
                const date = new Date(photo.date)
                const key = `${date.getFullYear()}-${date.getMonth()}`
                if (!acc[key]) acc[key] = []
                acc[key].push(photo)
                return acc
              }, {} as Record<string, Photo[]>)
            )
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([key, groupPhotos]) => {
                const [year, month] = key.split('-')
                const monthName = format(new Date(parseInt(year), parseInt(month)), 'MMMM yyyy', { locale: pt })

                return (
                  <div key={key}>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
                      {monthName}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {groupPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-white p-3 shadow-lg rounded-lg"
                        >
                          <div className="relative overflow-hidden pb-[100%]">
                            <img
                              src={photo.imageUrl}
                              alt={photo.caption}
                              className="absolute inset-0 w-full h-full object-cover rounded"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-lg font-medium mb-1 truncate">
                              {photo.caption}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(photo.date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t py-6 mt-10 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="flex items-center justify-center">
            Feito com <Heart className="w-4 h-4 text-pink-500 mx-1" /> usando FavoritePerson.app
          </p>
        </div>
      </footer>
    </div>
  )
}

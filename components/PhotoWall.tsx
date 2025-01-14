import React from 'react'
import Polaroid from './Polaroid'
import RelationshipCounter from './RelationshipCounter'
// import PhotoUploader from './PhotoUploader'
import { Loader2 } from 'lucide-react'

interface Photo {
  id: any
  imageUrl: string
  caption: string
  date: string
}

interface PhotoWallProps {
  photos: Photo[];
  startDate?: string
}

const PhotoWall: React.FC<PhotoWallProps> = ({photos, startDate}) => {
  if (photos.length === 0){
    return(
      <div className="min-h-screen bg-neutral-100 flex, items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500"/>
      </div>
    )
  }

  const handleUploadSuccess = (publicUrl: string) => {
    const newPhoto: Photo = {
      id: Math.random(),
      imageUrl: publicUrl,
      caption: "A new Memory!",
      date: new Date().toISOString().split('T')[0],
    }
  }

  return (
      <div className="bg-neutral-200 p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {photos.map((photo) => (
            <div key={photo.id} className="flex justify-center">
              <Polaroid imageUrl={photo.imageUrl} caption={photo.caption} date={photo.date} />
            </div>
          ))}
        </div>
        {/* <div className="text-center bg-white p-6 rounded-lg shadow-md">
        </div> */}
        {startDate && (
          <div className="text-center bg-white p-6 rounded-lg shadow-md">
          {/* <h2 className="text-2xl font-semibold mb-2 text-gray-700">Time Together</h2>
          <p className="text-4xl font-bold text-pink-500">
          {years} years, {months} months, {days} days
          </p> */}
          <RelationshipCounter />
        </div>
      )}
      </div>
  )
}

export default PhotoWall


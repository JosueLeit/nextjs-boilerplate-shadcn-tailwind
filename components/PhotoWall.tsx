import React from 'react'
import Polaroid from './Polaroid'
import RelationshipCounter from './RelationshipCounter'

const photos = [
  { id: 1, imageUrl: "/placeholder.svg?height=200&width=200", caption: "First Date", date: "2020-06-15" },
  { id: 2, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Beach Trip", date: "2020-08-22" },
  { id: 3, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Moving In", date: "2021-03-01" },
  { id: 4, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Anniversary Dinner", date: "2021-06-15" },
  { id: 5, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Mountain Hike", date: "2021-09-05" },
  { id: 6, imageUrl: "/placeholder.svg?height=200&width=200", caption: "New Year's Kiss", date: "2022-01-01" },
  { id: 7, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Cooking Class", date: "2022-04-18" },
  { id: 8, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Surprise Party", date: "2022-08-30" },
  { id: 9, imageUrl: "/placeholder.svg?height=200&width=200", caption: "Stargazing Night", date: "2023-02-14" },
]

const PhotoWall: React.FC = () => {
  const startDate = new Date('2020-06-15')
  const today = new Date()
  const durationInDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
  const years = Math.floor(durationInDays / 365)
  const months = Math.floor((durationInDays % 365) / 30)
  const days = durationInDays % 30

  return (
    <div className="min-h-screen bg-neutral-100 p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-neutral-200 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-700">Our Love Story</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {photos.map((photo) => (
            <div key={photo.id} className="flex justify-center">
              <Polaroid imageUrl={photo.imageUrl} caption={photo.caption} date={photo.date} />
            </div>
          ))}
        </div>
        <div className="text-center bg-white p-6 rounded-lg shadow-md">
          <RelationshipCounter />
        </div>
      </div>
    </div>
  )
}

export default PhotoWall


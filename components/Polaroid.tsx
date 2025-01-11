import React from 'react'

interface PolaroidProps {
  imageUrl: string
  caption: string
  date: string
}

const Polaroid: React.FC<PolaroidProps> = ({ imageUrl, caption, date }) => {
  return (
    <div className="transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300 bg-white p-2 shadow-md max-w-[200px]">
      <img src={imageUrl} alt={caption} className="w-full h-40 object-cover mb-2" />
      <p className="text-xs font-handwriting text-gray-600 mb-1">{date}</p>
      <p className="text-sm font-handwriting">{caption}</p>
    </div>
  )
}

export default Polaroid

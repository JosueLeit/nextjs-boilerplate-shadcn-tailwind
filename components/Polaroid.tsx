import React from 'react'
import { motion } from 'framer-motion';

interface PolaroidProps {
  imageUrl: string
  caption: string
  date: string
}

const Polaroid: React.FC<PolaroidProps> = ({ imageUrl, caption, date }) => {
  return (
    <motion.div 
      className="transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300 bg-white p-2 shadow-md max-w-[200px]"
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 0, transition: { duration: 0.2 } }}
      >
      <img src={imageUrl} alt={caption} className="w-full h-40 object-cover mb-2" />
      <p className="text-xs font-handwriting text-gray-600 mb-1">{date}</p>
      <p className="text-sm font-handwriting">{caption}</p>
    </motion.div>
  )
}

export default Polaroid

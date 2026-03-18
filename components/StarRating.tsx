'use client'

import { motion } from 'framer-motion'
import { staggerContainer, scaleIn } from '@/lib/animations'

interface StarRatingProps {
  count: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export default function StarRating({
  count,
  size = 'md',
  className = '',
  animated = true,
}: StarRatingProps) {
  if (!animated) {
    return (
      <span
        className={`inline-flex gap-0.5 ${className}`}
        role="img"
        aria-label={`${count} Michelin star${count > 1 ? 's' : ''}`}
      >
        {Array.from({ length: count }, (_, i) => (
          <svg
            key={i}
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`${sizeMap[size]} text-gold drop-shadow-sm`}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
    )
  }

  return (
    <motion.span
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`inline-flex gap-0.5 ${className}`}
      role="img"
      aria-label={`${count} Michelin star${count > 1 ? 's' : ''}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <motion.svg
          key={i}
          variants={scaleIn}
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${sizeMap[size]} text-gold drop-shadow-sm`}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </motion.svg>
      ))}
    </motion.span>
  )
}

'use client'
import { motion } from 'framer-motion'

interface StarRatingProps {
  count: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  animated?: boolean
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }

function MichelinStar({ filled, size, index, animated }: {
  filled: boolean; size: string; index: number; animated: boolean
}) {
  const star = (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      className={`${size} ${filled ? 'text-gold drop-shadow-sm' : 'text-border'} transition-colors duration-300`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  )

  if (!animated) return star

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {star}
    </motion.div>
  )
}

export function StarRating({
  count,
  max = 3,
  size = 'md',
  label,
  animated = false,
}: StarRatingProps) {
  return (
    <div
      role="group"
      aria-label={label ?? `${count} Michelin star${count !== 1 ? 's' : ''}`}
      className="flex items-center gap-0.5"
    >
      {Array.from({ length: max }, (_, i) => (
        <MichelinStar
          key={i}
          filled={i < count}
          size={sizeMap[size]}
          index={i}
          animated={animated}
        />
      ))}
    </div>
  )
}

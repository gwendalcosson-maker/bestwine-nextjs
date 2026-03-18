'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations'

type AnimationType = 'fadeUp' | 'scaleIn' | 'stagger'

interface AnimatedSectionProps {
  children: React.ReactNode
  animation?: AnimationType
  className?: string
  delay?: number
}

const variantMap = {
  fadeUp,
  scaleIn,
  stagger: staggerContainer,
}

export default function AnimatedSection({
  children,
  animation = 'fadeUp',
  className = '',
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={variantMap[animation]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StickyCTAProps {
  categoryName: string
  locale: string
}

export default function StickyCTA({ categoryName, locale }: StickyCTAProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero (~400px)
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const label = locale === 'fr'
    ? `${categoryName} — Trouvez & Achetez au meilleur prix`
    : `${categoryName} — Find & Buy at the best price`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-4 md:right-4"
        >
          <a
            href="#references"
            className="block bg-gradient-wine text-white text-center py-3.5 px-6
                       md:rounded-xl md:max-w-2xl md:mx-auto md:shadow-deep
                       font-inter text-sm font-medium tracking-wide
                       hover:opacity-95 transition-opacity duration-fast"
          >
            {label}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

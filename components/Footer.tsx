'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeUp, staggerContainer } from '@/lib/animations'

export default function Footer() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const tFooter = useTranslations('footer')
  const year = new Date().getFullYear()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <footer ref={ref} className="bg-obsidian text-white/70 grain-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Gold accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {/* Brand */}
          <motion.div variants={fadeUp}>
            <Link href={`/${locale}`} className="inline-block group">
              <span className="text-2xl font-playfair font-bold text-white group-hover:text-gold transition-colors duration-normal">
                Bestwine
              </span>
              <span className="text-xs font-inter uppercase tracking-[0.2em] text-white/30 ml-1">
                Online
              </span>
            </Link>
            <p className="mt-3 text-sm text-white/50 font-inter leading-relaxed max-w-xs">
              {tFooter('description')}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeUp}>
            <h3 className="text-xs font-inter uppercase tracking-[0.2em] text-gold/70 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-sm font-inter text-white/60 hover:text-white transition-colors duration-normal"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/categories`}
                  className="text-sm font-inter text-white/60 hover:text-white transition-colors duration-normal"
                >
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/restaurants`}
                  className="text-sm font-inter text-white/60 hover:text-white transition-colors duration-normal"
                >
                  {t('restaurants')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div variants={fadeUp}>
            <h3 className="text-xs font-inter uppercase tracking-[0.2em] text-gold/70 mb-4">
              Legal
            </h3>
            <p className="text-xs text-white/40 font-inter leading-relaxed">
              {tFooter('alcohol_warning')}
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={`/${locale}/mentions-legales`}
                  className="text-sm text-white/40 font-inter hover:text-white transition-colors duration-normal"
                >
                  {tFooter('legal_notices')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/confidentialite`}
                  className="text-sm text-white/40 font-inter hover:text-white transition-colors duration-normal"
                >
                  {tFooter('privacy_policy')}
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <div className="h-px bg-white/10" />
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-inter">
            &copy; {year} Bestwine Online. All rights reserved.
          </p>
          <p className="text-xs text-white/20 font-inter">
            Powered by passion for fine wines
          </p>
        </div>
      </div>
    </footer>
  )
}

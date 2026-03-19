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
    <footer ref={ref} className="bg-obsidian-gradient text-white/70 grain-overlay relative">
      {/* Gold shimmer line at top */}
      <div className="shimmer-line h-px w-full" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="py-16 sm:py-20 grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16"
        >
          {/* Brand */}
          <motion.div variants={fadeUp} className="md:col-span-1">
            <Link href={`/${locale}`} className="inline-block group">
              <span className="text-lg font-playfair font-bold text-gold tracking-[0.3em] uppercase
                             group-hover:text-champagne transition-colors duration-slow">
                BESTWINE
              </span>
              <span className="text-white/30 mx-1 font-playfair text-xs">&#8226;</span>
              <span className="text-xs font-inter font-light text-white/40 tracking-[0.2em] uppercase">
                ONLINE
              </span>
            </Link>
            <p className="mt-5 text-sm text-white/40 font-inter leading-relaxed max-w-xs">
              {tFooter('description')}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeUp}>
            <h3 className="text-[11px] font-inter uppercase tracking-[0.25em] text-gold/60 mb-5">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-sm font-inter text-white/50 hover:text-white transition-colors duration-normal"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/categories`}
                  className="text-sm font-inter text-white/50 hover:text-white transition-colors duration-normal"
                >
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/restaurants`}
                  className="text-sm font-inter text-white/50 hover:text-white transition-colors duration-normal"
                >
                  {t('restaurants')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div variants={fadeUp}>
            <h3 className="text-[11px] font-inter uppercase tracking-[0.25em] text-gold/60 mb-5">
              Legal
            </h3>
            <ul className="space-y-3">
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
            <p className="mt-5 text-[11px] text-white/25 font-inter leading-relaxed max-w-xs">
              {tFooter('alcohol_warning')}
            </p>
          </motion.div>

          {/* Newsletter / Contact */}
          <motion.div variants={fadeUp}>
            <h3 className="text-[11px] font-inter uppercase tracking-[0.25em] text-gold/60 mb-5">
              Contact
            </h3>
            <p className="text-sm text-white/40 font-inter leading-relaxed">
              {locale === 'fr'
                ? 'Pour toute question ou partenariat, contactez-nous.'
                : 'For inquiries and partnerships, get in touch.'}
            </p>
            <a
              href="mailto:contact@bestwine.online"
              className="inline-block mt-4 text-sm text-gold/70 font-inter hover:text-gold transition-colors duration-normal"
            >
              contact@bestwine.online
            </a>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <div className="h-px bg-white/[0.06]" />
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/25 font-inter tracking-wider">
            &copy; {year} Bestwine <span className="text-gold/40">&#8226;</span> Online
            {' '}&mdash;{' '}
            {tFooter('legal_notices')}
          </p>
          <p className="text-[11px] text-white/15 font-inter tracking-wide">
            {locale === 'fr'
              ? 'Les meilleurs vins & spiritueux des restaurants etoiles'
              : 'The finest wines & spirits from starred restaurants'}
          </p>
        </div>
      </div>
    </footer>
  )
}

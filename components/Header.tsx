'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const headerBg = useTransform(scrollY, [0, 100], ['rgba(248, 244, 239, 0)', 'rgba(248, 244, 239, 0.85)'])
  const headerBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)'])
  const headerBorder = useTransform(scrollY, [0, 100], ['rgba(229, 221, 213, 0)', 'rgba(229, 221, 213, 0.6)'])

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/categories`, label: t('categories') },
    { href: `/${locale}/restaurants`, label: t('restaurants') },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        backgroundColor: headerBg,
        backdropFilter: headerBlur,
        borderBottomColor: headerBorder,
      }}
      className="fixed top-0 inset-x-0 z-50 border-b border-transparent transition-shadow"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group relative">
            <span className="text-xl lg:text-2xl font-playfair font-bold text-primary tracking-tight
                           group-hover:text-secondary transition-colors duration-normal">
              Bestwine
            </span>
            <span className="hidden sm:inline-block text-[10px] font-inter uppercase tracking-[0.2em] text-muted
                           border border-border rounded-full px-2 py-0.5 mt-0.5">
              Online
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold to-secondary transition-all duration-slow group-hover:w-full" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-inter font-medium text-text-main/80 hover:text-primary
                         transition-colors duration-normal link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-main hover:text-primary transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-current rounded transition-all duration-normal ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded transition-all duration-normal ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded transition-all duration-normal ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-border/40 overflow-hidden"
            aria-label="Mobile navigation"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-base font-inter text-text-main/80 hover:text-primary
                             hover:bg-fog/50 px-3 rounded-lg transition-colors duration-fast"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

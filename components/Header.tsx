'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <span className="text-xl lg:text-2xl font-playfair font-bold text-primary tracking-tight
                           group-hover:text-secondary transition-colors duration-normal">
              Bestwine
            </span>
            <span className="hidden sm:inline-block text-[10px] font-inter uppercase tracking-[0.2em] text-muted
                           border border-border rounded-full px-2 py-0.5 mt-0.5">
              Online
            </span>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileMenuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M3 7h18M3 12h18M3 17h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-surface/95 backdrop-blur-lg border-t border-border/40 pb-4"
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-4 pt-2 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-base font-inter text-text-main/80 hover:text-primary
                         hover:bg-fog/50 px-3 rounded-lg transition-colors duration-fast"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </motion.header>
  )
}

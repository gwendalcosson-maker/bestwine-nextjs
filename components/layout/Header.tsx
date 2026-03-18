'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/whisky`, label: 'Whisky' },
    { href: `/${locale}/vin-rouge`, label: 'Vins' },
    { href: `/${locale}/champagne`, label: 'Champagne' },
    { href: `/${locale}/restaurants`, label: t('restaurants') },
  ]

  return (
    <header
      role="banner"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-slow ease-wine ${
        scrolled
          ? 'glass-card border-b border-white/30 shadow-glass'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 group"
            aria-label="Bestwine — accueil"
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-center gap-2"
            >
              {/* Gold accent orb */}
              <div className="w-8 h-8 rounded-full bg-gradient-wine flex items-center justify-center shadow-wine group-hover:shadow-gold transition-shadow duration-normal">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-champagne" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
              <span className="font-playfair text-xl font-semibold tracking-wide text-text-main group-hover:text-primary transition-colors duration-normal">
                best<span className="text-secondary">wine</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-normal link-underline ${
                    pathname.startsWith(link.href) && link.href !== `/${locale}`
                      ? 'text-primary'
                      : 'text-text-main hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right: language switcher + CTA */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden sm:block"
            >
              <Link
                href={`/${locale}/restaurants`}
                className="gradient-border px-4 py-2 text-sm font-medium text-primary hover:text-secondary rounded-lg transition-colors duration-normal"
              >
                {t('restaurants')} →
              </Link>
            </motion.div>

            {/* Mobile burger */}
            <button
              className="lg:hidden p-2 rounded-md text-text-main"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              <div className="w-5 space-y-1">
                <span className={`block h-0.5 bg-current transition-all duration-normal ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all duration-normal ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all duration-normal ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:hidden glass-card border-t border-white/20 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-text-main hover:text-primary hover:bg-fog rounded-lg transition-colors duration-normal"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

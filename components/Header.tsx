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

  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ['rgba(248, 244, 239, 0)', 'rgba(248, 244, 239, 0.92)']
  )
  const headerBlur = useTransform(
    scrollY,
    [0, 80],
    ['blur(0px)', 'blur(16px)']
  )
  const headerShadow = useTransform(
    scrollY,
    [0, 80],
    ['0 0 0 rgba(0,0,0,0)', '0 4px 30px rgba(44, 24, 16, 0.06)']
  )
  const headerHeight = useTransform(scrollY, [0, 80], [80, 64])

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/categories`, label: t('categories') },
    { href: `/${locale}/restaurants`, label: t('restaurants') },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        backgroundColor: headerBg,
        backdropFilter: headerBlur,
        boxShadow: headerShadow,
      }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          style={{ height: headerHeight }}
          className="flex items-center justify-between"
        >
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-baseline gap-0 group">
            <span className="text-lg lg:text-xl font-playfair font-bold text-text-main tracking-[0.3em] uppercase
                           group-hover:text-primary transition-colors duration-slow">
              BESTWINE
            </span>
            <span className="text-gold mx-1.5 font-playfair text-sm">
              &#8226;
            </span>
            <span className="text-xs font-inter font-light text-muted tracking-[0.2em] uppercase">
              ONLINE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-inter font-normal text-text-main/70 hover:text-text-main
                         tracking-wide uppercase
                         transition-colors duration-normal link-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-main hover:text-primary transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span className={`block h-px w-full bg-current transition-all duration-normal ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-px w-full bg-current transition-all duration-normal ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-px w-full bg-current transition-all duration-normal ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-obsidian/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer from right */}
            <motion.nav
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 end-0 bottom-0 w-72 bg-bg/98 backdrop-blur-xl
                         border-s border-border/30 md:hidden z-50 overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <div className="px-6 pt-24 pb-8 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-4 text-base font-playfair text-text-main
                               border-b border-border/20
                               hover:text-primary transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Brand in drawer footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-12"
                >
                  <div className="divider-gold mb-6" />
                  <p className="text-xs font-inter text-muted tracking-wider uppercase">
                    BESTWINE <span className="text-gold">&#8226;</span> ONLINE
                  </p>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

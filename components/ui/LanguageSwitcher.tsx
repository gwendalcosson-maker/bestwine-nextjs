'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { locales, type Locale } from '@/i18n'

const LOCALE_LABELS: Record<string, string> = {
  'fr': 'FR', 'en-us': 'EN', 'en-gb': 'EN-GB',
  'es': 'ES', 'de': 'DE', 'it': 'IT',
  'pt': 'PT', 'zh': '中文', 'ja': '日本語',
  'ru': 'RU', 'ar': 'ع'
}

export function LanguageSwitcher() {
  const currentLocale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const switchLocale = (locale: Locale) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`)
    router.push(newPath)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-text-main rounded-md hover:bg-fog transition-colors duration-normal"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{LOCALE_LABELS[currentLocale] ?? currentLocale.toUpperCase()}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3 h-3 transition-transform duration-normal ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute end-0 top-full mt-2 w-32 glass-card rounded-xl shadow-deep overflow-hidden z-50"
            role="listbox"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                role="option"
                aria-selected={locale === currentLocale}
                onClick={() => switchLocale(locale)}
                className={`w-full text-start px-4 py-2.5 text-xs font-medium transition-colors duration-normal ${
                  locale === currentLocale
                    ? 'text-primary bg-champagne/50'
                    : 'text-text-main hover:bg-fog hover:text-primary'
                }`}
              >
                {LOCALE_LABELS[locale]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

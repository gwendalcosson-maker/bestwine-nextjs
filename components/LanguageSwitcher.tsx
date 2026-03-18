'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '@/i18n'
import { useState, useRef, useEffect } from 'react'

const localeLabels: Record<string, string> = {
  fr: 'FR',
  'en-us': 'EN',
  'en-gb': 'EN-GB',
  es: 'ES',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  zh: '中文',
  ja: '日本語',
  ru: 'RU',
  ar: 'عربي',
}

const localeFullNames: Record<string, string> = {
  fr: 'Français',
  'en-us': 'English (US)',
  'en-gb': 'English (UK)',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ru: 'Русский',
  ar: 'العربية',
}

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                   text-text-main hover:text-primary transition-colors duration-normal
                   border border-border hover:border-secondary/40 bg-surface/80 backdrop-blur-sm"
        aria-label="Change language"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {localeLabels[locale] || locale.toUpperCase()}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-fast ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-48 py-2 rounded-xl
                        bg-surface shadow-deep border border-border/60 animate-slide-down z-50">
          {locales.map(l => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full text-left rtl:text-right px-4 py-2 text-sm transition-colors duration-fast
                         hover:bg-fog ${l === locale ? 'text-primary font-medium bg-champagne/30' : 'text-text-main'}`}
            >
              {localeFullNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

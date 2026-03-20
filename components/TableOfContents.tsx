'use client'

import { useState, useEffect, useCallback } from 'react'

interface TOCItem {
  id: string
  label: string
}

interface TableOfContentsProps {
  items: TOCItem[]
  locale: string
}

export default function TableOfContents({ items, locale }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleScroll = useCallback(() => {
    const offsets = items.map((item) => {
      const el = document.getElementById(item.id)
      return { id: item.id, top: el ? el.getBoundingClientRect().top : Infinity }
    })
    // Find the first heading that is near or above the viewport center
    const active = offsets
      .filter((o) => o.top < 200)
      .sort((a, b) => b.top - a.top)[0]
    if (active) setActiveId(active.id)
  }, [items])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileOpen(false)
    }
  }

  if (items.length < 2) return null

  const tocLabel = locale === 'fr' ? 'Sommaire' : 'Table of contents'

  return (
    <>
      {/* Mobile: collapsible top section */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-lg
                     border border-border/20 bg-fog/30
                     font-inter text-sm text-text-main/80"
        >
          <span className="uppercase tracking-[0.2em] text-[11px] text-gold/70 font-medium">
            {tocLabel}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`w-4 h-4 text-gold/60 transition-transform duration-normal ${mobileOpen ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <nav className="mt-2 px-4 py-3 rounded-lg border border-border/20 bg-fog/30 animate-slide-down">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`block text-left text-sm font-inter transition-colors duration-fast
                      ${activeId === item.id
                        ? 'text-gold font-medium'
                        : 'text-text-main/60 hover:text-text-main/80'
                      }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-[11px] font-inter uppercase tracking-[0.3em] text-gold/70 font-medium mb-4">
            {tocLabel}
          </p>
          <nav>
            <ul className="space-y-2 border-l border-border/20">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`block text-left pl-4 py-1 text-sm font-inter transition-all duration-fast
                      border-l-2 -ml-px
                      ${activeId === item.id
                        ? 'text-gold border-gold font-medium'
                        : 'text-text-main/50 border-transparent hover:text-text-main/70 hover:border-gold/30'
                      }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

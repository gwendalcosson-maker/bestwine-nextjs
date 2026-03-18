'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import DrinkCard from '@/components/DrinkCard'
import type { WineListEntry, Drink, Category } from '@/lib/types'

interface WineListDrink extends Pick<Drink, 'id' | 'name' | 'producer' | 'vintage' | 'region' | 'appellation'> {
  categories: Pick<Category, 'slug'>
}

interface WineListItem extends Pick<WineListEntry, 'id' | 'price' | 'price_currency'> {
  drinks: WineListDrink
}

interface WineListAccordionProps {
  entries: WineListItem[]
  locale: string
}

export default function WineListAccordion({ entries, locale }: WineListAccordionProps) {
  const t = useTranslations('restaurant')
  // Group by category
  const grouped = entries.reduce<Record<string, WineListItem[]>>((acc, entry) => {
    const cat = entry.drinks.categories?.slug ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(entry)
    return acc
  }, {})

  const categoryNames = Object.keys(grouped)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(categoryNames))

  function toggleSection(cat: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  if (entries.length === 0) {
    return (
      <p className="text-muted text-center py-12 font-inter">
        {t('empty_wine_list')}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {categoryNames.map(cat => (
        <div key={cat} className="border border-border/40 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection(cat)}
            className="w-full flex items-center justify-between px-6 py-4 bg-fog/30
                     hover:bg-fog/60 transition-colors duration-fast text-left"
            aria-expanded={openSections.has(cat)}
          >
            <span className="font-playfair font-semibold text-text-main capitalize">
              {cat.replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-inter text-muted">
                {t('references_count', { count: grouped[cat].length })}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-fast ${openSections.has(cat) ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>
          {openSections.has(cat) && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-down">
              {grouped[cat].map(entry => (
                <div key={entry.id} className="relative">
                  <DrinkCard
                    name={entry.drinks.name}
                    producer={entry.drinks.producer}
                    vintage={entry.drinks.vintage}
                    region={entry.drinks.region}
                    appellation={entry.drinks.appellation}
                    locale={locale}
                  />
                  {entry.price && (
                    <div className="absolute top-3 right-3 z-20 bg-primary/90 text-white text-xs font-inter font-medium rounded-full px-2.5 py-1">
                      {entry.price} {entry.price_currency ?? '€'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

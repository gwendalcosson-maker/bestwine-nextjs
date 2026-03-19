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
  const isFr = locale === 'fr'

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
      <div className="text-center py-16 glass-card rounded-xl">
        <p className="text-muted font-inter">
          {t('empty_wine_list')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categoryNames.map(cat => {
        const isOpen = openSections.has(cat)
        return (
          <div key={cat} className="rounded-xl overflow-hidden border border-border/15 bg-white/40">
            <button
              onClick={() => toggleSection(cat)}
              className="w-full flex items-center justify-between px-7 py-5
                       hover:bg-fog/40 transition-colors duration-fast text-start"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <span className="font-playfair font-semibold text-lg text-text-main capitalize">
                  {cat.replace(/-/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-inter text-muted/60 uppercase tracking-wider">
                  {t('references_count', { count: grouped[cat].length })}
                </span>
                <span
                  className={`text-gold text-lg font-light transition-transform duration-normal
                            ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                >
                  +
                </span>
              </div>
            </button>

            {isOpen && (
              <div className="px-7 pb-7 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-down">
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
                      <div className="absolute top-3 end-3 z-20
                                    bg-obsidian/80 text-champagne text-xs font-inter font-medium
                                    rounded-full px-3 py-1 backdrop-blur-sm">
                        {entry.price} {entry.price_currency ?? '\u20AC'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

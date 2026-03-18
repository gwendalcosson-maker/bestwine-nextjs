'use client'
import { motion } from 'framer-motion'
import { scaleIn } from '@/lib/animations'
import { StarRating } from './StarRating'
import type { Drink } from '@/lib/types'

interface DrinkCardProps {
  drink: Pick<Drink, 'name' | 'producer' | 'vintage' | 'country' | 'region' | 'slug'>
  restaurantCount?: number
  locale: string
}

export function DrinkCard({ drink, restaurantCount = 0, locale }: DrinkCardProps) {
  const shopUrl = `https://www.google.com/search?q=${encodeURIComponent(`${drink.name} ${drink.vintage ?? ''} acheter`)}&tbm=shop`

  return (
    <motion.article
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="group relative bg-gradient-card rounded-2xl p-5 border border-border/60 hover:border-gold/40 shadow-wine hover:shadow-gold transition-all duration-slow ease-wine"
    >
      {/* Vintage badge */}
      {drink.vintage && (
        <div className="absolute top-4 end-4 px-2.5 py-1 bg-champagne text-primary text-xs font-semibold rounded-full border border-gold/30">
          {drink.vintage}
        </div>
      )}

      <div className="space-y-3">
        {/* Category dot + origin */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-wine" />
          <span className="text-xs text-muted font-medium uppercase tracking-wide">
            {drink.country}{drink.region ? ` · ${drink.region}` : ''}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-playfair text-lg font-semibold text-text-main group-hover:text-primary transition-colors duration-normal leading-snug">
          {drink.name}
        </h3>

        {/* Producer */}
        {drink.producer && (
          <p className="text-sm text-muted">{drink.producer}</p>
        )}

        {/* Restaurant count */}
        {restaurantCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-gold">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span>À la carte de {restaurantCount} restaurant{restaurantCount > 1 ? 's' : ''} étoilé{restaurantCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full text-sm font-medium text-secondary hover:text-primary transition-colors duration-normal group/link"
        >
          <span>Trouver &amp; Acheter</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 translate-x-0 group-hover/link:translate-x-1 transition-transform duration-fast">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </motion.article>
  )
}

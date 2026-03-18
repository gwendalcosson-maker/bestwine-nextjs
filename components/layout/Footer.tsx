import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('nav')

  const categories = [
    { slug: 'whisky', label: 'Whisky' },
    { slug: 'vin-rouge', label: 'Vin rouge' },
    { slug: 'vin-blanc', label: 'Vin blanc' },
    { slug: 'champagne', label: 'Champagne' },
    { slug: 'cognac', label: 'Cognac' },
    { slug: 'rhum', label: 'Rhum' },
  ]

  return (
    <footer className="relative bg-obsidian text-white/70 overflow-hidden">
      {/* Decorative gradient top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-wine opacity-60" />

      {/* Subtle grain */}
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="font-playfair text-2xl font-semibold text-white">
              best<span className="text-secondary">wine</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              La référence des vins & spiritueux à la carte des restaurants gastronomiques étoilés Michelin.
            </p>
            {/* Gold shimmer line */}
            <div className="shimmer-line h-px w-16" />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold">
              Catégories
            </h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/${locale}/${cat.slug}`}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-normal link-underline"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold">
              À propos
            </h3>
            <ul className="space-y-2 text-sm text-white/50">
              <li>
                <Link href={`/${locale}/restaurants`} className="hover:text-white transition-colors duration-normal">
                  {t('restaurants')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/mentions-legales`} className="hover:text-white transition-colors duration-normal">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/confidentialite`} className="hover:text-white transition-colors duration-normal">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} Bestwine — Tous droits réservés</p>
          <p>Conçu pour les amateurs de grands vins</p>
        </div>
      </div>
    </footer>
  )
}

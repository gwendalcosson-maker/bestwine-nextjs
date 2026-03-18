import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function Footer() {
  const locale = useLocale()
  const t = useTranslations('nav')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-fog/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="inline-block">
              <span className="text-2xl font-playfair font-bold text-primary">Bestwine</span>
              <span className="text-xs font-inter uppercase tracking-[0.2em] text-muted ml-1">Online</span>
            </Link>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-xs">
              {locale === 'fr'
                ? 'Les meilleures références de vins et spiritueux à la carte des restaurants étoilés Michelin.'
                : 'The finest wines and spirits from Michelin-starred restaurant wine lists.'}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-xs font-inter uppercase tracking-[0.15em] text-muted mb-4">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href={`/${locale}`} className="text-sm text-text-main/70 hover:text-primary transition-colors link-underline">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/categories`} className="text-sm text-text-main/70 hover:text-primary transition-colors link-underline">
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/restaurants`} className="text-sm text-text-main/70 hover:text-primary transition-colors link-underline">
                  {t('restaurants')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-inter uppercase tracking-[0.15em] text-muted mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-text-main/50">Mentions légales</span>
              </li>
              <li>
                <span className="text-sm text-text-main/50">Politique de confidentialité</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            &copy; {year} Bestwine Online. All rights reserved.
          </p>
          <div className="shimmer-line h-px w-16 opacity-40" />
        </div>
      </div>
    </footer>
  )
}

import AnimatedSection from '@/components/AnimatedSection'

export interface DrinkCardProps {
  name: string
  producer?: string | null
  vintage?: number | null
  region?: string | null
  appellation?: string | null
  country?: string | null
  locale: string
  restaurantCount?: number
}

const shoppingSearchTerm: Record<string, string> = {
  fr: 'acheter',
  'en-us': 'buy',
  'en-gb': 'buy',
  es: 'comprar',
  de: 'kaufen',
  it: 'comprare',
  pt: 'comprar',
  zh: '购买',
  ja: '購入',
  ru: 'купить',
  ar: 'شراء',
}

const shoppingLabel: Record<string, string> = {
  fr: 'Trouver & Acheter',
  'en-us': 'Find & Buy',
  'en-gb': 'Find & Buy',
  es: 'Encontrar y Comprar',
  de: 'Finden & Kaufen',
  it: 'Trova e Acquista',
  pt: 'Encontrar e Comprar',
  zh: '查找并购买',
  ja: '探して購入',
  ru: 'Найти и Купить',
  ar: 'ابحث واشتري',
}

function buildShoppingUrl(name: string, locale: string, vintage?: number | null): string {
  const searchTerm = shoppingSearchTerm[locale] ?? 'buy'
  const query = [name, vintage ? String(vintage) : null, searchTerm]
    .filter(Boolean)
    .join(' ')
  return `https://www.google.com/search?q=${encodeURIComponent(query).replace(/%20/g, '+')}&tbm=shop`
}

export default function DrinkCard({
  name,
  producer,
  vintage,
  region,
  appellation,
  country,
  locale,
  restaurantCount,
}: DrinkCardProps) {
  const shoppingUrl = buildShoppingUrl(name, locale, vintage)
  const label = shoppingLabel[locale] ?? 'Find & Buy'
  const ariaLabel = `${label} — ${name}${vintage ? ' ' + vintage : ''}`

  // Build origin string
  const originParts = [region, appellation, country].filter(Boolean)
  const origin = originParts.join(' — ')

  return (
    <AnimatedSection animation="scaleIn">
      <article
        className="
          group relative flex flex-col justify-between h-full
          glass-card rounded-xl p-6 lg:p-7
          card-hover
          hover:shadow-gold
          focus-within:ring-2 focus-within:ring-gold/40
        "
      >
        <div className="relative z-10">
          {/* Product name */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-playfair font-semibold text-lg text-text-main leading-snug">
              {name}
            </h3>
            {vintage && (
              <span className="shrink-0 text-xs font-playfair font-medium text-gold
                             bg-gold/[0.08] rounded-full px-2.5 py-1 border border-gold/20">
                {vintage}
              </span>
            )}
          </div>

          {/* Producer */}
          {producer && (
            <p className="text-sm font-inter text-muted mb-1 tracking-wide">{producer}</p>
          )}

          {/* Origin */}
          {origin && (
            <p className="text-xs font-inter text-muted/70 mt-2">{origin}</p>
          )}

          {/* Restaurant count */}
          {restaurantCount != null && restaurantCount > 0 && (
            <p className="mt-3 text-xs font-inter text-gold/80">
              {locale === 'fr'
                ? `Servi dans ${restaurantCount} restaurant${restaurantCount > 1 ? 's' : ''}`
                : `Served in ${restaurantCount} restaurant${restaurantCount > 1 ? 's' : ''}`}
              {' '}
              <span className="text-gold" aria-hidden="true">&#9733;</span>
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="relative z-10 mt-5 pt-4 border-t border-border/20">
          <a
            href={shoppingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              text-xs font-inter font-medium tracking-wide uppercase
              text-primary/80
              link-underline focus-wine
              group-hover:text-primary transition-colors duration-normal
            "
            aria-label={ariaLabel}
          >
            {label}
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="opacity-60 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform duration-fast"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>
      </article>
    </AnimatedSection>
  )
}

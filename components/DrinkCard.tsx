import AnimatedSection from '@/components/AnimatedSection'

export interface DrinkCardProps {
  name: string
  producer?: string | null
  vintage?: number | null
  region?: string | null
  appellation?: string | null
  locale: string
}

function buildShoppingUrl(name: string, vintage?: number | null): string {
  const query = [name, vintage ? String(vintage) : null, 'acheter']
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
  locale,
}: DrinkCardProps) {
  const shoppingUrl = buildShoppingUrl(name, vintage)

  return (
    <AnimatedSection animation="scaleIn">
      <article
        className="
          group relative flex flex-col justify-between h-full
          bg-gradient-card rounded-2xl p-6
          gradient-border
          hover:scale-[1.02] hover:shadow-wine
          transition-all duration-slow ease-wine
          focus-within:ring-2 focus-within:ring-secondary/60
        "
      >
        <div aria-hidden="true" className="absolute inset-0 rounded-2xl grain-overlay pointer-events-none opacity-30" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-playfair font-semibold text-lg text-text-main leading-tight">
              {name}
            </h3>
            {vintage && (
              <span className="shrink-0 text-xs font-inter font-medium text-secondary bg-champagne/60 rounded-full px-2 py-0.5">
                {vintage}
              </span>
            )}
          </div>

          {producer && (
            <p className="text-sm font-inter text-muted mb-2">{producer}</p>
          )}

          {(region || appellation) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {region && (
                <span className="inline-block text-xs font-inter text-text-main bg-fog rounded-full px-2 py-0.5 border border-border/40">
                  {region}
                </span>
              )}
              {appellation && (
                <span className="inline-block text-xs font-inter text-text-main bg-fog rounded-full px-2 py-0.5 border border-border/40">
                  {appellation}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="relative z-10 mt-5 pt-4 border-t border-border/30">
          <a
            href={shoppingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-1.5
              text-xs font-inter font-medium text-primary
              link-underline focus-wine
              group-hover:text-secondary transition-colors duration-fast
            "
            aria-label={`Acheter ${name}${vintage ? ' ' + vintage : ''} sur Google Shopping`}
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Trouver en boutique
          </a>
        </div>
      </article>
    </AnimatedSection>
  )
}

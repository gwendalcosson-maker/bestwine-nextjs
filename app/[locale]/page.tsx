import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import AnimatedSection from '@/components/AnimatedSection'

export default function HomePage() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  const locale = useLocale()

  const categories = [
    { slug: 'whisky', emoji: '🥃', gradient: 'from-amber-900/10 to-amber-700/5' },
    { slug: 'vin-rouge', emoji: '🍷', gradient: 'from-red-900/10 to-red-700/5' },
    { slug: 'vin-blanc', emoji: '🥂', gradient: 'from-yellow-100/40 to-yellow-50/20' },
    { slug: 'champagne', emoji: '🍾', gradient: 'from-amber-100/30 to-yellow-50/20' },
    { slug: 'cognac', emoji: '🥃', gradient: 'from-orange-900/10 to-orange-700/5' },
    { slug: 'rhum', emoji: '🍹', gradient: 'from-emerald-900/10 to-emerald-700/5' },
  ]

  return (
    <div className="grain-overlay">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[85vh] flex items-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gold/30 rounded-full animate-float" />
          <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-secondary/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="shimmer-line h-px w-8" />
                <span className="text-xs font-inter uppercase tracking-[0.25em] text-secondary">
                  Michelin Guide Reference
                </span>
                <div className="shimmer-line h-px w-8" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold text-text-main leading-[1.1] tracking-tight">
                {t('title')}
              </h1>

              <p className="mt-6 text-lg lg:text-xl text-muted leading-relaxed max-w-2xl">
                {t('subtitle')}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/${locale}/categories`}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full
                           bg-primary text-white font-inter font-medium text-sm
                           hover:bg-primary/90 transition-all duration-normal
                           shadow-wine hover:shadow-deep"
                >
                  {t('cta_explore')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="group-hover:translate-x-1 transition-transform duration-fast">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href={`/${locale}/restaurants`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full
                           font-inter font-medium text-sm text-primary
                           gradient-border hover:shadow-wine transition-all duration-normal"
                >
                  {t('cta_restaurants')}
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <AnimatedSection animation="fadeUp">
          <div className="text-center mb-12 lg:mb-16">
            <span className="text-xs font-inter uppercase tracking-[0.25em] text-secondary">
              {tNav('categories')}
            </span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-playfair font-bold text-text-main">
              {locale === 'fr' ? 'Explorer par catégorie' : 'Explore by category'}
            </h2>
            <div className="mt-4 mx-auto shimmer-line h-px w-24" />
          </div>
        </AnimatedSection>

        <AnimatedSection animation="stagger" className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat) => (
            <AnimatedSection key={cat.slug} animation="scaleIn">
              <Link
                href={`/${locale}/${cat.slug}`}
                className={`group block p-6 lg:p-8 rounded-2xl bg-gradient-to-br ${cat.gradient}
                          border border-border/40 hover:border-secondary/40
                          hover:shadow-wine transition-all duration-slow
                          text-center`}
              >
                <span className="text-3xl lg:text-4xl block mb-3 group-hover:scale-110 transition-transform duration-slow">
                  {cat.emoji}
                </span>
                <span className="text-sm lg:text-base font-playfair font-semibold text-text-main capitalize">
                  {cat.slug.replace(/-/g, ' ')}
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </AnimatedSection>
      </section>

      {/* Trust bar */}
      <section className="border-t border-border/40 bg-fog/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatedSection animation="fadeUp">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-playfair font-bold text-primary">100+</p>
                <p className="mt-1 text-sm text-muted">{locale === 'fr' ? 'Restaurants étoilés' : 'Michelin-starred restaurants'}</p>
              </div>
              <div>
                <p className="text-3xl font-playfair font-bold text-primary">1000+</p>
                <p className="mt-1 text-sm text-muted">{locale === 'fr' ? 'Références de vins & spiritueux' : 'Wine & spirits references'}</p>
              </div>
              <div>
                <p className="text-3xl font-playfair font-bold text-primary">10</p>
                <p className="mt-1 text-sm text-muted">{locale === 'fr' ? 'Langues disponibles' : 'Languages available'}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

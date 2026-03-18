import type { Metadata } from 'next'
import Link from 'next/link'
import { locales } from '@/i18n'
import { isRtlLocale } from '@/lib/utils'
import { getRestaurants } from '@/lib/queries'
import { generateAlternateLinks, generateCanonicalUrl } from '@/lib/seo'
import AnimatedSection from '@/components/AnimatedSection'
import StarRating from '@/components/StarRating'
import Breadcrumb from '@/components/Breadcrumb'

interface PageParams { locale: string }

export async function generateStaticParams(): Promise<PageParams[]> {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale } = await params
  const title = locale === 'fr'
    ? 'Restaurants étoilés Michelin — Bestwine Online'
    : 'Michelin-starred Restaurants — Bestwine Online'
  const description = locale === 'fr'
    ? 'Découvrez les restaurants étoilés Michelin dont les cartes des vins sont référencées sur Bestwine.'
    : 'Discover Michelin-starred restaurants whose wine lists are featured on Bestwine.'

  return {
    title,
    description,
    alternates: {
      canonical: generateCanonicalUrl(locale, '/restaurants'),
      languages: generateAlternateLinks('/restaurants'),
    },
    openGraph: { title, description, type: 'website', locale, siteName: 'Bestwine Online' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RestaurantsPage({
  params,
}: { params: Promise<PageParams> }) {
  const { locale } = await params
  const isRtl = isRtlLocale(locale)
  const restaurants = await getRestaurants(locale)

  const breadcrumbItems = [
    { label: locale === 'fr' ? 'Accueil' : 'Home', href: `/${locale}` },
    { label: 'Restaurants' },
  ]

  return (
    <div className="grain-overlay min-h-screen">
      <section className="relative bg-gradient-hero py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} isRtl={isRtl} />
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="shimmer-line h-px w-8" />
              <span className="text-xs font-inter uppercase tracking-[0.25em] text-secondary">
                Michelin Guide
              </span>
            </div>
            <h1 className="font-playfair font-bold text-4xl lg:text-5xl text-text-main">
              {locale === 'fr' ? 'Restaurants étoilés' : 'Michelin-starred Restaurants'}
            </h1>
            <p className="mt-4 text-lg text-muted max-w-2xl">
              {locale === 'fr'
                ? 'Les cartes des vins des plus grands restaurants gastronomiques.'
                : 'Wine lists from the world\'s finest gastronomic restaurants.'}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {restaurants.length === 0 ? (
          <p className="text-muted text-center py-20 font-inter">
            {locale === 'fr' ? 'Aucun restaurant disponible.' : 'No restaurants available.'}
          </p>
        ) : (
          <AnimatedSection animation="stagger" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const translation = restaurant.restaurant_translations[0]
              return (
                <AnimatedSection key={restaurant.id} animation="scaleIn">
                  <Link
                    href={`/${locale}/restaurants/${restaurant.slug}`}
                    className="group block p-6 rounded-2xl gradient-border hover:shadow-wine
                             transition-all duration-slow ease-wine bg-gradient-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="font-playfair font-semibold text-lg text-text-main group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h2>
                      <StarRating count={restaurant.michelin_stars} />
                    </div>
                    {restaurant.city && (
                      <p className="text-sm font-inter text-muted">
                        {restaurant.city}{restaurant.country ? `, ${restaurant.country}` : ''}
                      </p>
                    )}
                    {translation?.description && (
                      <p className="mt-3 text-sm text-text-main/70 line-clamp-2 leading-relaxed">
                        {translation.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-inter font-medium text-secondary">
                      {locale === 'fr' ? 'Voir la carte des vins' : 'View wine list'}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-fast">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </AnimatedSection>
              )
            })}
          </AnimatedSection>
        )}
      </section>
    </div>
  )
}

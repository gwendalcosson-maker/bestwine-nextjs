import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales } from '@/i18n'
import { isRtlLocale } from '@/lib/utils'
import { getRestaurants, getRestaurantBySlug, getWineListForRestaurant } from '@/lib/queries'
import { generateAlternateLinks, generateCanonicalUrl } from '@/lib/seo'
import { generateRestaurantSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/schema'
import AnimatedSection from '@/components/AnimatedSection'
import StarRating from '@/components/StarRating'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import WineListAccordion from '@/components/WineListAccordion'

interface PageParams { locale: string; slug: string }

export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = []
  for (const locale of locales) {
    const restaurants = await getRestaurants(locale)
    for (const r of restaurants) {
      params.push({ locale, slug: r.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: { params: Promise<PageParams> }): Promise<Metadata> {
  const { locale, slug } = await params
  const restaurant = await getRestaurantBySlug(slug, locale)
  if (!restaurant) return {}

  const translation = restaurant.restaurant_translations[0]
  const title = translation?.meta_title ??
    `Carte des vins du Restaurant ${restaurant.name}${restaurant.city ? ` — ${restaurant.city}` : ''} | Bestwine`
  const description = translation?.meta_description ??
    `Découvrez la carte des vins du restaurant ${restaurant.name}, ${restaurant.michelin_stars} étoile${restaurant.michelin_stars > 1 ? 's' : ''} Michelin.`

  return {
    title,
    description,
    alternates: {
      canonical: generateCanonicalUrl(locale, `/restaurants/${slug}`),
      languages: generateAlternateLinks(`/restaurants/${slug}`),
    },
    openGraph: {
      title, description, type: 'article',
      url: `https://www.bestwine.online/${locale}/restaurants/${slug}`,
      locale, siteName: 'Bestwine Online',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RestaurantDetailPage({
  params,
}: { params: Promise<PageParams> }) {
  const { locale, slug } = await params
  const isRtl = isRtlLocale(locale)

  const restaurant = await getRestaurantBySlug(slug, locale)
  if (!restaurant) notFound()

  const translation = restaurant.restaurant_translations[0]
  const wineList = await getWineListForRestaurant(restaurant.id, locale)

  const breadcrumbItems = [
    { label: locale === 'fr' ? 'Accueil' : 'Home', href: `/${locale}` },
    { label: 'Restaurants', href: `/${locale}/restaurants` },
    { label: restaurant.name },
  ]

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateRestaurantSchema(restaurant)} />
      <JsonLd data={generateArticleSchema(restaurant, locale)} />

      {/* Hero */}
      <section className="relative bg-gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-deep-burgundy/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} isRtl={isRtl} />
          <AnimatedSection animation="fadeUp">
            <StarRating count={restaurant.michelin_stars} className="mb-4" />
            <h1 className="font-playfair font-bold text-4xl lg:text-5xl xl:text-6xl text-text-main leading-tight">
              {locale === 'fr' ? 'Carte des vins du Restaurant' : 'Wine List at Restaurant'}{' '}
              <span className="text-primary">{restaurant.name}</span>
            </h1>
            {restaurant.city && (
              <p className="mt-3 text-lg font-inter text-muted">
                {restaurant.city}{restaurant.country ? `, ${restaurant.country}` : ''}
              </p>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Editorial content */}
      {(translation?.description || translation?.wine_list_critique) && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {translation.description && (
            <AnimatedSection animation="fadeUp">
              <p className="text-lg text-text-main leading-relaxed font-inter">
                {translation.description}
              </p>
            </AnimatedSection>
          )}
          {translation.wine_list_critique && (
            <AnimatedSection animation="fadeUp" delay={0.2}>
              <blockquote className="mt-8 relative pl-6 border-l-2 border-gold/60">
                <div className="absolute -left-3 top-0 w-6 h-6 bg-gold/20 rounded-full blur-sm" />
                <p className="text-base text-text-main/80 leading-relaxed italic font-inter">
                  {translation.wine_list_critique}
                </p>
                <footer className="mt-3 text-xs font-inter text-muted uppercase tracking-wider">
                  — Critique sommelier Bestwine
                </footer>
              </blockquote>
            </AnimatedSection>
          )}
        </section>
      )}

      {/* Wine list accordion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatedSection animation="fadeUp">
          <div className="flex items-center gap-3 mb-8">
            <div className="shimmer-line h-px w-8" />
            <h2 className="font-playfair font-semibold text-2xl text-text-main">
              {locale === 'fr' ? 'Sélection de la carte' : 'Wine list selection'}
            </h2>
          </div>
        </AnimatedSection>
        <WineListAccordion entries={wineList as any} locale={locale} />
      </section>
    </div>
  )
}

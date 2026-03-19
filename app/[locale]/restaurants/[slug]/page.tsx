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
import { getTranslations } from 'next-intl/server'

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
    `Decouvrez la carte des vins du restaurant ${restaurant.name}, ${restaurant.michelin_stars} etoile${restaurant.michelin_stars > 1 ? 's' : ''} Michelin.`

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
  const isFr = locale === 'fr'

  const restaurant = await getRestaurantBySlug(slug, locale)
  if (!restaurant) notFound()

  const translation = restaurant.restaurant_translations[0]
  const wineList = await getWineListForRestaurant(restaurant.id, locale)
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const breadcrumbItems = [
    { label: tNav('home'), href: `/${locale}` },
    { label: 'Restaurants', href: `/${locale}/restaurants` },
    { label: restaurant.name },
  ]

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateRestaurantSchema(restaurant)} />
      <JsonLd data={generateArticleSchema(restaurant, locale)} />

      {/* ─── HERO ─── Restaurant name with Michelin stars */}
      <section className="relative bg-gradient-hero py-24 lg:py-36">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 end-0 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 start-0 w-[600px] h-[600px] bg-deep-burgundy/[0.03] rounded-full blur-[120px]" />
          {/* Vertical accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Breadcrumb items={breadcrumbItems} isRtl={isRtl} />

          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl">
              {/* Michelin stars */}
              <div className="mb-5">
                <StarRating count={restaurant.michelin_stars} size="lg" />
              </div>

              {/* Restaurant name */}
              <h1 className="font-playfair font-bold text-4xl lg:text-5xl xl:text-6xl text-text-main leading-[1.05] tracking-tight">
                {restaurant.name}
              </h1>

              {/* City, Country */}
              {(restaurant.city || restaurant.country) && (
                <p className="mt-4 text-lg font-inter font-light text-muted/70 tracking-wide">
                  {[restaurant.city, restaurant.country].filter(Boolean).join(', ')}
                </p>
              )}

              <div className="mt-6 divider-gold !mx-0 !w-16" />

              {/* Expert description */}
              {translation?.description && (
                <p className="mt-8 text-base font-inter text-text-main/70 leading-[1.8] max-w-2xl">
                  {translation.description}
                </p>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── WINE LIST CRITIQUE ─── Sommelier editorial */}
      {translation?.wine_list_critique && (
        <section className="bg-obsidian-gradient grain-overlay relative py-20 lg:py-28">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-gold/25 to-transparent" />
          </div>

          <AnimatedSection animation="fadeUp">
            <div className="relative max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
              <blockquote className="text-lg lg:text-xl font-playfair font-normal text-white/75 leading-relaxed italic">
                &ldquo;{translation.wine_list_critique}&rdquo;
              </blockquote>
              <div className="mt-8 divider-gold" />
              <p className="mt-5 text-[11px] font-inter uppercase tracking-[0.3em] text-gold/50">
                {isFr ? 'Critique sommelier' : 'Sommelier Review'} &mdash; Bestwine
              </p>
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* ─── WINE LIST ─── Grouped by category */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
        <AnimatedSection animation="fadeUp">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
              {isFr ? 'Carte des vins' : 'Wine List'}
            </span>
            <div className="divider-gold !mx-0 !w-12" />
          </div>
          <h2 className="font-playfair font-bold text-2xl lg:text-3xl text-text-main tracking-tight mb-10">
            {isFr ? 'Selection de la carte' : 'Wine List Selection'}
          </h2>
        </AnimatedSection>

        <WineListAccordion entries={wineList as any} locale={locale} />
      </section>
    </div>
  )
}

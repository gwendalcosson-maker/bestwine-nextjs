import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales } from '@/i18n'
import { isRtlLocale } from '@/lib/utils'
import { getCategories, getCategoryBySlug, getDrinksByCategory } from '@/lib/queries'
import { generateAlternateLinks, generateCanonicalUrl } from '@/lib/seo'
import { generateItemListSchema, generateBreadcrumbSchema } from '@/lib/schema'
import AnimatedSection from '@/components/AnimatedSection'
import DrinkCard from '@/components/DrinkCard'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import Link from 'next/link'

interface PageParams {
  locale: string
  category: string
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = []
  for (const locale of locales) {
    const categories = await getCategories(locale)
    for (const cat of categories) {
      if (cat.parent_id === null) {
        params.push({ locale, category: cat.slug })
      }
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { locale, category } = await params
  const cat = await getCategoryBySlug(category, locale)
  if (!cat) return {}

  const translation = cat.category_translations[0]
  const name = translation?.name ?? category
  const title =
    translation?.meta_title ??
    `${name} : les meilleures bouteilles à la carte des restaurants étoilés`
  const description =
    translation?.meta_description ??
    `Découvrez les ${name.toLowerCase()} présents sur les cartes des grands restaurants Michelin.`

  return {
    title,
    description,
    alternates: {
      canonical: generateCanonicalUrl(locale, `/${category}`),
      languages: generateAlternateLinks(`/${category}`),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.bestwine.online/${locale}/${category}`,
      locale,
      siteName: 'Bestwine Online',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { locale, category } = await params
  const isRtl = isRtlLocale(locale)

  const cat = await getCategoryBySlug(category, locale)
  if (!cat) notFound()

  const translation = cat.category_translations[0]
  const name = translation?.name ?? category

  const drinks = await getDrinksByCategory(cat.id, locale)

  const breadcrumbItems = [
    { label: locale === 'fr' ? 'Accueil' : 'Home', href: `/${locale}` },
    { label: name },
  ]

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateItemListSchema(drinks, locale, cat)} />

      {/* Hero */}
      <section className="relative bg-gradient-hero py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} isRtl={isRtl} />
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="shimmer-line h-px w-8" />
              <span className="text-xs font-inter uppercase tracking-[0.25em] text-secondary">
                Bestwine Online
              </span>
            </div>
            <h1 className="font-playfair font-bold text-4xl lg:text-5xl text-text-main leading-tight">
              {name}
            </h1>
            {translation?.description && (
              <p className="mt-4 text-lg text-muted leading-relaxed max-w-2xl">
                {translation.description}
              </p>
            )}
            <p className="mt-3 text-sm text-muted font-inter">
              {drinks.length} référence{drinks.length > 1 ? 's' : ''}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Subcategory pills */}
      {cat.children && cat.children.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AnimatedSection animation="fadeUp">
            <h2 className="font-playfair font-semibold text-xl text-text-main mb-5">
              {locale === 'fr' ? 'Sous-catégories' : 'Subcategories'}
            </h2>
          </AnimatedSection>
          <AnimatedSection animation="stagger" className="flex flex-wrap gap-3">
            {cat.children.map((child) => (
              <AnimatedSection key={child.slug} animation="scaleIn">
                <Link
                  href={`/${locale}/${category}/${child.slug}`}
                  className="inline-block px-5 py-2.5 rounded-full font-inter text-sm font-medium
                             text-primary gradient-border hover:shadow-wine transition-all duration-normal"
                >
                  {child.category_translations[0]?.name ?? child.slug}
                </Link>
              </AnimatedSection>
            ))}
          </AnimatedSection>
        </section>
      )}

      {/* Drinks grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {drinks.length === 0 ? (
          <AnimatedSection animation="fadeUp">
            <p className="text-muted font-inter text-center py-20">
              {locale === 'fr' ? 'Aucune référence disponible pour le moment.' : 'No references available yet.'}
            </p>
          </AnimatedSection>
        ) : (
          <AnimatedSection animation="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {drinks.map((drink) => (
              <DrinkCard
                key={drink.id}
                name={drink.name}
                producer={drink.producer}
                vintage={drink.vintage}
                region={drink.region}
                appellation={drink.appellation}
                locale={locale}
              />
            ))}
          </AnimatedSection>
        )}
      </section>
    </div>
  )
}

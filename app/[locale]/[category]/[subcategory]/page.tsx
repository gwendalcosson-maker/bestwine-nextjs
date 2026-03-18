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
import { getTranslations } from 'next-intl/server'

interface PageParams {
  locale: string
  category: string
  subcategory: string
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = []
  for (const locale of locales) {
    const categories = await getCategories(locale)
    for (const cat of categories) {
      if (cat.parent_id !== null) {
        // Find parent slug
        const parent = categories.find(c => c.id === cat.parent_id)
        if (parent) {
          params.push({ locale, category: parent.slug, subcategory: cat.slug })
        }
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
  const { locale, category, subcategory } = await params
  const cat = await getCategoryBySlug(subcategory, locale)
  if (!cat) return {}

  const translation = cat.category_translations[0]
  const name = translation?.name ?? subcategory
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
      canonical: generateCanonicalUrl(locale, `/${category}/${subcategory}`),
      languages: generateAlternateLinks(`/${category}/${subcategory}`),
    },
    openGraph: {
      title, description, type: 'website',
      url: `https://www.bestwine.online/${locale}/${category}/${subcategory}`,
      locale, siteName: 'Bestwine Online',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { locale, category, subcategory } = await params
  const isRtl = isRtlLocale(locale)

  const cat = await getCategoryBySlug(subcategory, locale)
  if (!cat) notFound()

  const parentCat = await getCategoryBySlug(category, locale)
  const parentName = parentCat?.category_translations[0]?.name ?? category

  const translation = cat.category_translations[0]
  const name = translation?.name ?? subcategory

  const drinks = await getDrinksByCategory(cat.id, locale)
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const breadcrumbItems = [
    { label: tNav('home'), href: `/${locale}` },
    { label: parentName, href: `/${locale}/${category}` },
    { label: name },
  ]

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateItemListSchema(drinks, locale, cat)} />

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
                {parentName}
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

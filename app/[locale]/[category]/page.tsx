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
import { getTranslations } from 'next-intl/server'

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
    `${name} : les meilleures bouteilles a la carte des restaurants etoiles`
  const description =
    translation?.meta_description ??
    `Decouvrez les ${name.toLowerCase()} presents sur les cartes des grands restaurants Michelin.`

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
  const isFr = locale === 'fr'

  const cat = await getCategoryBySlug(category, locale)
  if (!cat) notFound()

  const translation = cat.category_translations[0]
  const name = translation?.name ?? category

  const drinks = await getDrinksByCategory(cat.id, locale)
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  // Split featured (first 6) and rest
  const featuredDrinks = drinks.slice(0, 6)
  const allDrinks = drinks

  const breadcrumbItems = [
    { label: tNav('home'), href: `/${locale}` },
    { label: name },
  ]

  // Generate FAQ schema if we have description
  const faqSchema = translation?.description ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: isFr
          ? `Quels sont les meilleurs ${name.toLowerCase()} des restaurants etoiles ?`
          : `What are the best ${name.toLowerCase()} from starred restaurants?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: translation.description,
        },
      },
    ],
  } : null

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateItemListSchema(drinks, locale, cat)} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* ─── HERO BANNER ─── */}
      <section className="relative bg-gradient-hero py-20 lg:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 end-0 w-96 h-96 bg-gold/[0.04] rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 start-0 w-[500px] h-[500px] bg-secondary/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Breadcrumb items={breadcrumbItems} isRtl={isRtl} />

          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl">
              <h1 className="font-playfair font-bold text-4xl lg:text-5xl xl:text-6xl text-text-main leading-[1.05] tracking-tight">
                {name}
              </h1>

              {translation?.description && (
                <p className="mt-6 text-lg text-muted/80 leading-relaxed font-inter font-light max-w-2xl">
                  {translation.description}
                </p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="divider-gold !mx-0 !w-12" />
                <p className="text-sm text-gold/70 font-inter tracking-wide">
                  {drinks.length} {isFr ? 'reference' : 'reference'}{drinks.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── SUBCATEGORIES ─── */}
      {cat.children && cat.children.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                {isFr ? 'Sous-categories' : 'Subcategories'}
              </h2>
              <div className="flex-1 h-px bg-border/20" />
            </div>
          </AnimatedSection>
          <AnimatedSection animation="stagger" className="flex flex-wrap gap-3">
            {cat.children.map((child) => (
              <AnimatedSection key={child.slug} animation="scaleIn">
                <Link
                  href={`/${locale}/${category}/${child.slug}`}
                  className="inline-block px-6 py-2.5 rounded-full font-inter text-sm
                             text-primary/80 hover:text-primary
                             gradient-border hover:shadow-gold
                             transition-all duration-normal"
                >
                  {child.category_translations[0]?.name ?? child.slug}
                </Link>
              </AnimatedSection>
            ))}
          </AnimatedSection>
        </section>
      )}

      {/* ─── FEATURED REFERENCES ─── Star products */}
      {featuredDrinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                {isFr ? 'Selection' : 'Selection'}
              </span>
              <div className="divider-gold !mx-0 !w-12" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-text-main tracking-tight mb-10">
              {isFr
                ? `Les meilleurs ${name.toLowerCase()}`
                : `The finest ${name.toLowerCase()}`}
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {featuredDrinks.map((drink) => (
              <DrinkCard
                key={drink.id}
                name={drink.name}
                producer={drink.producer}
                vintage={drink.vintage}
                region={drink.region}
                appellation={drink.appellation}
                country={drink.country}
                locale={locale}
              />
            ))}
          </AnimatedSection>
        </section>
      )}

      {/* ─── COMPLETE TABLE ─── Full reference list */}
      {allDrinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                {isFr ? 'Toutes les references' : 'All References'}
              </span>
              <div className="flex-1 h-px bg-border/20" />
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp">
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-fog/40 border-b border-border/20">
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {isFr ? 'Nom' : 'Name'}
                    </th>
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {isFr ? 'Producteur' : 'Producer'}
                    </th>
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {isFr ? 'Origine' : 'Origin'}
                    </th>
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {isFr ? 'Millesime' : 'Vintage'}
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {allDrinks.map((drink, i) => (
                    <tr
                      key={drink.id}
                      className={`border-b border-border/10 transition-colors duration-fast hover:bg-champagne/20
                                ${i % 2 === 0 ? 'bg-white/40' : 'bg-fog/10'}`}
                    >
                      <td className="px-6 py-4 font-playfair font-medium text-text-main">
                        {drink.name}
                      </td>
                      <td className="px-6 py-4 font-inter text-muted">
                        {drink.producer ?? '—'}
                      </td>
                      <td className="px-6 py-4 font-inter text-muted">
                        {[drink.region, drink.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-6 py-4 font-playfair text-gold">
                        {drink.vintage ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(drink.name + (drink.vintage ? ' ' + drink.vintage : '') + (locale === 'fr' ? ' acheter' : ' buy')).replace(/%20/g, '+')}&tbm=shop`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-inter font-medium text-primary/70 hover:text-primary
                                   link-underline transition-colors duration-fast uppercase tracking-wide"
                        >
                          {isFr ? 'Trouver & Acheter' : 'Find & Buy'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allDrinks.map((drink) => (
                <DrinkCard
                  key={drink.id}
                  name={drink.name}
                  producer={drink.producer}
                  vintage={drink.vintage}
                  region={drink.region}
                  appellation={drink.appellation}
                  country={drink.country}
                  locale={locale}
                />
              ))}
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* ─── EDITORIAL CONTENT ─── */}
      {translation?.description && (
        <section className="border-t border-border/20 bg-fog/20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
            <AnimatedSection animation="fadeUp">
              <div className="section-editorial">
                <h2 className="text-2xl font-playfair font-bold text-text-main mb-8">
                  {isFr ? `A propos des ${name.toLowerCase()}` : `About ${name.toLowerCase()}`}
                </h2>
                <p className="text-base font-inter text-text-main/70 leading-[1.9]">
                  {translation.description}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
        <AnimatedSection animation="fadeUp">
          <h2 className="text-2xl font-playfair font-bold text-text-main mb-10">
            {isFr ? 'Questions frequentes' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-0 divide-y divide-border/20">
            {[
              {
                q: isFr
                  ? `Quels sont les meilleurs ${name.toLowerCase()} des restaurants etoiles ?`
                  : `What are the best ${name.toLowerCase()} from starred restaurants?`,
                a: isFr
                  ? `Notre selection reunit les ${name.toLowerCase()} les plus presents sur les cartes des vins des restaurants etoiles Michelin. Chaque reference a ete identifiee par notre equipe editoriale.`
                  : `Our selection brings together the ${name.toLowerCase()} most frequently featured on Michelin-starred restaurant wine lists. Each reference has been identified by our editorial team.`,
              },
              {
                q: isFr
                  ? `Comment acheter ces ${name.toLowerCase()} ?`
                  : `How can I purchase these ${name.toLowerCase()}?`,
                a: isFr
                  ? `Chaque reference dispose d'un lien "Trouver & Acheter" qui vous redirige vers les meilleures offres disponibles en ligne.`
                  : `Each reference includes a "Find & Buy" link that redirects you to the best available offers online.`,
              },
            ].map((faq, i) => (
              <details key={i} className="group py-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-inter font-medium text-text-main text-[15px] pe-4">
                    {faq.q}
                  </span>
                  <span className="shrink-0 text-gold text-lg font-light
                                 group-open:rotate-45 transition-transform duration-normal">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm font-inter text-muted leading-relaxed max-w-2xl">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Empty state */}
      {drinks.length === 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-20 glass-card rounded-xl">
              <p className="text-muted font-inter">
                {isFr ? 'Aucune reference disponible pour le moment.' : 'No references available yet.'}
              </p>
            </div>
          </AnimatedSection>
        </section>
      )}
    </div>
  )
}

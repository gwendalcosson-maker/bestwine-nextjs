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

  const cat = await getCategoryBySlug(category, locale)
  if (!cat) notFound()

  const translation = cat.category_translations[0]
  const name = translation?.name ?? category
  const nameLower = name.toLowerCase()

  const drinks = await getDrinksByCategory(cat.id, locale)
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tEditorial = await getTranslations({ locale, namespace: 'editorial' })

  // Split featured (first 6) and rest
  const featuredDrinks = drinks.slice(0, 6)
  const allDrinks = drinks

  const breadcrumbItems = [
    { label: tNav('home'), href: `/${locale}` },
    { label: name },
  ]

  // Parse editorial description into paragraphs
  const descriptionParagraphs = translation?.description
    ? translation.description.split('\n\n').filter((p: string) => p.trim())
    : []

  // Build FAQ data from translation messages
  const faqItems = [
    { q: tEditorial('faq_q1', { category: nameLower }), a: tEditorial('faq_a1', { category: nameLower }) },
    { q: tEditorial('faq_q2', { category: nameLower }), a: tEditorial('faq_a2', { category: nameLower }) },
    { q: tEditorial('faq_q3', { category: nameLower }), a: tEditorial('faq_a3', { category: nameLower }) },
    { q: tEditorial('faq_q4', { category: nameLower }), a: tEditorial('faq_a4', { category: nameLower }) },
  ]

  // HowTo steps
  const howtoSteps = [
    tEditorial('howto_step1'),
    tEditorial('howto_step2', { category: nameLower }),
    tEditorial('howto_step3'),
    tEditorial('howto_step4'),
  ]

  // Generate FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  // Generate HowTo schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tEditorial('howto_title', { category: nameLower }),
    step: howtoSteps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
  }

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateItemListSchema(drinks, locale, cat)} />
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />

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

              {descriptionParagraphs.length > 0 && (
                <p className="mt-6 text-lg text-muted/80 leading-relaxed font-inter font-light max-w-2xl">
                  {descriptionParagraphs[0]}
                </p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="divider-gold !mx-0 !w-12" />
                <p className="text-sm text-gold/70 font-inter tracking-wide">
                  {drinks.length} reference{drinks.length > 1 ? 's' : ''}
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
                {tEditorial('about_title', { category: '' }).includes('propos') ? 'Sous-categories' : 'Subcategories'}
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

      {/* ─── EDITORIAL: FIND & BUY ─── */}
      <section className="border-t border-border/20 bg-fog/20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
          <AnimatedSection animation="fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-text-main mb-4">
                  {tEditorial('find_title', { category: nameLower })}
                </h2>
                <p className="text-base font-inter text-text-main/70 leading-[1.9]">
                  {tEditorial('find_text', { category: nameLower })}
                </p>
              </div>
              <div>
                <h2 className="font-playfair text-2xl font-bold text-text-main mb-4">
                  {tEditorial('buy_title', { category: nameLower })}
                </h2>
                <p className="text-base font-inter text-text-main/70 leading-[1.9]">
                  {tEditorial('buy_text', { category: nameLower })}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FEATURED REFERENCES ─── Star products */}
      {featuredDrinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                Selection
              </span>
              <div className="divider-gold !mx-0 !w-12" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-text-main tracking-tight mb-10">
              {tEditorial('find_title', { category: nameLower })}
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

      {/* ─── HOW TO ─── 4 steps */}
      <section className="bg-obsidian-gradient grain-overlay relative py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-gold/30 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-gold/30 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-white tracking-tight mb-12 text-center">
              {tEditorial('howto_title', { category: nameLower })}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {howtoSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-playfair font-bold text-gold text-lg">
                    {i + 1}
                  </span>
                  <p className="font-inter text-white/80 text-sm leading-relaxed pt-2">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── COMPLETE TABLE ─── Full reference list */}
      {allDrinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                {locale === 'fr' ? 'Toutes les references' : 'All References'}
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
                      {locale === 'fr' ? 'Nom' : 'Name'}
                    </th>
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {locale === 'fr' ? 'Producteur' : 'Producer'}
                    </th>
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {locale === 'fr' ? 'Origine' : 'Origin'}
                    </th>
                    <th className="text-start px-6 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {locale === 'fr' ? 'Millesime' : 'Vintage'}
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
                        {drink.producer ?? '\u2014'}
                      </td>
                      <td className="px-6 py-4 font-inter text-muted">
                        {[drink.region, drink.country].filter(Boolean).join(', ') || '\u2014'}
                      </td>
                      <td className="px-6 py-4 font-playfair text-gold">
                        {drink.vintage ?? '\u2014'}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(drink.name + (drink.vintage ? ' ' + drink.vintage : '') + (locale === 'fr' ? ' acheter' : ' buy')).replace(/%20/g, '+')}&tbm=shop`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-inter font-medium text-primary/70 hover:text-primary
                                   link-underline transition-colors duration-fast uppercase tracking-wide"
                        >
                          {locale === 'fr' ? 'Trouver & Acheter' : 'Find & Buy'}
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

      {/* ─── EDITORIAL CONTENT ─── Full description from DB */}
      {descriptionParagraphs.length > 1 && (
        <section className="border-t border-border/20 bg-fog/20">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
            <AnimatedSection animation="fadeUp">
              <div className="section-editorial">
                <h2 className="text-2xl font-playfair font-bold text-text-main mb-8">
                  {tEditorial('about_title', { category: nameLower })}
                </h2>
                <div className="space-y-6">
                  {descriptionParagraphs.slice(1).map((paragraph: string, i: number) => (
                    <p key={i} className="text-base font-inter text-text-main/80 leading-[1.9]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ─── METHODOLOGY ─── */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <AnimatedSection animation="fadeUp">
          <div className="space-y-6">
            <p className="text-base font-inter text-text-main/70 leading-[1.9]">
              {tEditorial('methodology_text', { category: nameLower })}
            </p>
            <p className="text-base font-inter text-text-main/70 leading-[1.9]">
              {tEditorial('update_text', { category: nameLower })}
            </p>
            <p className="text-base font-inter text-text-main/70 leading-[1.9]">
              {tEditorial('why_choose_text')}
            </p>
            <div className="shimmer-line h-px w-16 mx-auto !my-8" />
            <p className="text-sm font-inter text-text-main/50 leading-[1.9] italic text-center max-w-xl mx-auto">
              {tEditorial('personal_statement')}
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-t border-border/20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-2xl font-playfair font-bold text-text-main mb-10">
              {tEditorial('faq_title')}
            </h2>
            <div className="space-y-0 divide-y divide-border/20">
              {faqItems.map((faq, i) => (
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
        </div>
      </section>

      {/* Empty state */}
      {drinks.length === 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-20 glass-card rounded-xl">
              <p className="text-muted font-inter">
                {locale === 'fr' ? 'Aucune reference disponible pour le moment.' : 'No references available yet.'}
              </p>
            </div>
          </AnimatedSection>
        </section>
      )}
    </div>
  )
}

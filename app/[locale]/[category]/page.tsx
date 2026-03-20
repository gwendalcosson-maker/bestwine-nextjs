import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { locales } from '@/i18n'
import { isRtlLocale } from '@/lib/utils'
import { getCategories, getCategoryBySlug, getDrinksWithRestaurants } from '@/lib/queries'
import type { DrinkWithRestaurants } from '@/lib/queries'
import { generateAlternateLinks, generateCanonicalUrl } from '@/lib/seo'
import { generateItemListSchema, generateBreadcrumbSchema } from '@/lib/schema'
import AnimatedSection from '@/components/AnimatedSection'
// DrinkCard no longer used — replaced by reference table
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import StickyCTA from '@/components/StickyCTA'
import ShareButtons from '@/components/ShareButtons'
import NewsletterSignup from '@/components/NewsletterSignup'
import BackToTop from '@/components/BackToTop'
import TableOfContents from '@/components/TableOfContents'
import RelatedCategories from '@/components/RelatedCategories'

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

// ─── Editorial content parser ───

interface EditorialSection {
  heading?: string
  headingId?: string
  content: string
}

function parseEditorial(description: string): EditorialSection[] {
  const sections: EditorialSection[] = []
  const lines = description.split('\n')
  let current: EditorialSection = { content: '' }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current.content.trim() || current.heading) sections.push(current)
      const heading = line.replace('## ', '')
      const headingId = heading
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      current = { heading, headingId, content: '' }
    } else {
      current.content += line + '\n'
    }
  }
  if (current.content.trim() || current.heading) sections.push(current)
  return sections
}

function isFounderSection(section: EditorialSection): boolean {
  const c = section.content.toLowerCase()
  return (
    c.includes('gwendal') &&
    (c.includes('créateur') || c.includes('creator')) &&
    c.includes('bestwine')
  )
}

function renderParagraphs(content: string, isFounder: boolean) {
  const paragraphs = content
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)

  return paragraphs.map((paragraph, i) => {
    // Check for list items
    if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
      const listItems = paragraph.split('\n').filter((l) => l.startsWith('- '))
      const prefix = paragraph.split('\n').find((l) => !l.startsWith('- ') && l.trim())
      return (
        <div key={i} className="mb-6">
          {prefix && (
            <p className="text-text-main/80 leading-relaxed mb-3 max-w-3xl" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(prefix) }} />
          )}
          <ul className="space-y-2 max-w-3xl">
            {listItems.map((item, j) => (
              <li key={j} className="flex items-start gap-3">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-gold/60 mt-2" />
                <span
                  className="text-text-main/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item.replace(/^- /, '')) }}
                />
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // Check for founder statement (last paragraph of last section)
    if (isFounder && paragraph.includes('Gwendal')) {
      return (
        <div
          key={i}
          className="border-l-2 border-gold/40 pl-6 py-2 my-8 italic text-center max-w-2xl mx-auto"
        >
          <p
            className="text-text-main/70 leading-relaxed font-inter"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(paragraph) }}
          />
        </div>
      )
    }

    return (
      <p
        key={i}
        className="text-text-main/80 leading-relaxed mb-6 max-w-3xl"
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(paragraph) }}
      />
    )
  })
}

function renderInlineMarkdown(text: string): string {
  // Bold: **text** → <strong>text</strong>
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-main">$1</strong>')
}

// ─── Spirits vs Wines grouping for related categories ───

const spiritSlugs = new Set([
  'whisky', 'cognac', 'rhum', 'gin', 'vodka', 'scotch', 'bourbon',
  'rhum-martiniquais', 'tequila', 'mezcal', 'armagnac', 'calvados',
])
const wineSlugs = new Set([
  'vin-rouge', 'vin-blanc', 'vin-rose', 'champagne',
])

function getRelatedSlugs(slug: string): Set<string> {
  if (spiritSlugs.has(slug)) return spiritSlugs
  if (wineSlugs.has(slug)) return wineSlugs
  // Fallback: return all
  return new Set([...spiritSlugs, ...wineSlugs])
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

  const drinks = await getDrinksWithRestaurants(cat.id, locale)
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tEditorial = await getTranslations({ locale, namespace: 'editorial' })
  const tCategory = await getTranslations({ locale, namespace: 'category' })

  // Top 3 by restaurant count = featured "meilleurs"
  const featuredDrinks = drinks.slice(0, 3)
  const allDrinks = drinks

  const breadcrumbItems = [
    { label: tNav('home'), href: `/${locale}` },
    { label: name },
  ]

  // Parse editorial content from description
  const rawDescription = translation?.description ?? ''
  const editorialSections = parseEditorial(rawDescription)

  // Extract intro paragraph (first section without heading)
  const introSection = editorialSections.length > 0 && !editorialSections[0].heading
    ? editorialSections[0]
    : null
  const contentSections = introSection
    ? editorialSections.slice(1)
    : editorialSections

  // TOC items from headings
  const tocItems = contentSections
    .filter((s) => s.heading && s.headingId)
    .map((s) => ({ id: s.headingId!, label: s.heading! }))

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

  // Related categories
  const allCategories = await getCategories(locale)
  const relatedSlugs = getRelatedSlugs(category)
  const relatedCategories = allCategories
    .filter((c) => c.parent_id === null && relatedSlugs.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.category_translations[0]?.name ?? c.slug,
    }))

  const pageUrl = `https://www.bestwine.online/${locale}/${category}`

  return (
    <div className="grain-overlay min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={generateItemListSchema(drinks, locale, cat)} />
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />

      {/* Sticky CTA bar */}
      <StickyCTA categoryName={name} locale={locale} />

      {/* Back to top */}
      <BackToTop />

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

              {introSection && introSection.content.trim() && (
                <p className="mt-6 text-lg text-muted/80 leading-relaxed font-inter font-light max-w-2xl">
                  {introSection.content.trim()}
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
                {locale === 'fr' ? 'Sous-catégories' : 'Subcategories'}
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

      {/* ─── FEATURED REFERENCES ─── Top 3 by restaurant endorsements */}
      {featuredDrinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                {tCategory('selection')}
              </span>
              <div className="divider-gold !mx-0 !w-12" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-text-main tracking-tight mb-10">
              {tEditorial('find_title', { category: nameLower })}
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {featuredDrinks.map((drink, rank) => {
              const restaurants = drink.wine_list_entries?.map(wle => wle.restaurants).filter(Boolean) ?? []
              const googleShoppingUrl = `https://www.google.com/search?q=${encodeURIComponent(drink.name + (drink.vintage ? ' ' + drink.vintage : '') + (locale === 'fr' ? ' acheter' : ' buy')).replace(/%20/g, '+')}&tbm=shop`

              return (
                <div key={drink.id} className="glass-card rounded-xl p-6 relative overflow-hidden hover:shadow-gold transition-shadow duration-normal">
                  {/* Gold ranking number */}
                  <span className="absolute top-4 end-4 w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-playfair font-bold text-gold text-lg">
                    {rank + 1}
                  </span>

                  <h3 className="font-playfair font-bold text-xl text-text-main pe-12 leading-snug">
                    {drink.name}
                  </h3>

                  <div className="mt-3 space-y-1 text-sm font-inter text-text-main/70">
                    {drink.country && (
                      <p>{drink.country}{drink.region && ` \u2013 ${drink.region}`}</p>
                    )}
                    {drink.vintage && <p>{drink.vintage}</p>}
                    {drink.appellation && <p>{drink.appellation}</p>}
                  </div>

                  {restaurants.length > 0 && (
                    <p className="mt-4 text-sm font-inter font-semibold text-gold">
                      {tCategory('featured_at', { count: restaurants.length })}
                    </p>
                  )}

                  {restaurants.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {restaurants.slice(0, 3).map((rest, j) => (
                        <div key={j} className="text-xs font-inter text-text-main/60">
                          <span className="text-gold">{'★'.repeat(rest.michelin_stars)}</span>
                          {' '}
                          {rest.name}
                        </div>
                      ))}
                      {restaurants.length > 3 && (
                        <p className="text-xs text-muted">+{restaurants.length - 3}</p>
                      )}
                    </div>
                  )}

                  <a
                    href={googleShoppingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block px-5 py-2.5 rounded-full text-xs font-inter font-semibold uppercase tracking-wider
                               bg-gradient-gold text-white hover:opacity-90 transition-opacity"
                  >
                    {tCategory('find_buy')}
                  </a>
                </div>
              )
            })}
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

      {/* ─── REFERENCE TABLE ─── Core of bestwine: sorted by restaurant endorsement count */}
      {allDrinks.length > 0 && (
        <section id="references" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-20">
          <AnimatedSection animation="fadeUp">
            <div className="flex items-center gap-3 mb-10">
              <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                {tCategory('all_references')}
              </span>
              <div className="flex-1 h-px bg-border/20" />
            </div>
            <h2 className="font-playfair text-2xl md:text-3xl text-text-main mb-2">
              {tCategory('drinks_count', { count: allDrinks.length })}
            </h2>
            <div className="divider-gold mb-8" />
          </AnimatedSection>

          <AnimatedSection animation="fadeUp">
            {/* Desktop table */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-border/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-fog/40 border-b border-border/20">
                    <th className="text-start px-5 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {tCategory('table_brand')}
                    </th>
                    <th className="text-start px-5 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {tCategory('table_origin')}
                    </th>
                    <th className="text-start px-5 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {tCategory('table_vintage')}
                    </th>
                    <th className="text-start px-5 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {tCategory('table_type')}
                    </th>
                    <th className="text-start px-5 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {tCategory('table_restaurants')}
                    </th>
                    <th className="text-start px-5 py-4 font-inter font-medium text-muted/70 text-[11px] uppercase tracking-[0.2em]">
                      {tCategory('table_price')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allDrinks.map((drink, i) => {
                    const restaurants = drink.wine_list_entries?.map(wle => wle.restaurants).filter(Boolean) ?? []
                    const googleShoppingUrl = `https://www.google.com/search?q=${encodeURIComponent(drink.name + (drink.vintage ? ' ' + drink.vintage : '') + (locale === 'fr' ? ' acheter' : ' buy')).replace(/%20/g, '+')}&tbm=shop`

                    return (
                      <tr
                        key={drink.id}
                        className={`border-b border-border/10 transition-colors duration-fast hover:bg-champagne/20
                                  ${i % 2 === 0 ? 'bg-white/40' : 'bg-fog/10'}`}
                      >
                        <td className="px-5 py-4 font-playfair font-semibold text-text-main">
                          {drink.name}
                        </td>
                        <td className="px-5 py-4 font-inter text-text-main/70 text-sm">
                          {drink.country ?? '—'}
                          {drink.region ? ` – ${drink.region}` : ''}
                        </td>
                        <td className="px-5 py-4 font-inter text-text-main/70 text-sm">
                          {drink.vintage ? `${drink.vintage}` : '—'}
                        </td>
                        <td className="px-5 py-4 font-inter text-text-main/70 text-sm">
                          {drink.appellation ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          {restaurants.length > 0 ? (
                            <div className="space-y-1">
                              {restaurants.map((rest, j) => (
                                <div key={j} className="text-sm">
                                  <span className="text-gold">
                                    {'★'.repeat(rest.michelin_stars)}
                                  </span>
                                  {' – '}
                                  <Link
                                    href={`/${locale}/restaurants/${rest.slug}`}
                                    className="text-secondary hover:text-primary link-underline"
                                  >
                                    {rest.name}
                                  </Link>
                                  {rest.country ? ` – ${rest.country}` : ''}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted text-sm">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <a
                            href={googleShoppingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-inter font-medium text-secondary hover:text-primary
                                     link-underline transition-colors duration-fast"
                          >
                            {tCategory('table_see_price')}
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-4">
              {allDrinks.map((drink) => {
                const restaurants = drink.wine_list_entries?.map(wle => wle.restaurants).filter(Boolean) ?? []
                const googleShoppingUrl = `https://www.google.com/search?q=${encodeURIComponent(drink.name + (drink.vintage ? ' ' + drink.vintage : '') + (locale === 'fr' ? ' acheter' : ' buy')).replace(/%20/g, '+')}&tbm=shop`

                return (
                  <div key={drink.id} className="glass-card rounded-xl p-4">
                    <h3 className="font-playfair font-semibold text-lg text-text-main">
                      {drink.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-text-main/70">
                      {drink.country && <p>{drink.country}{drink.region && ` \u2013 ${drink.region}`}</p>}
                      {drink.vintage && <p>{drink.vintage}</p>}
                      {drink.appellation && <p>{drink.appellation}</p>}
                    </div>
                    {restaurants.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {restaurants.map((rest, j) => (
                          <div key={j} className="text-sm">
                            <span className="text-gold">{'★'.repeat(rest.michelin_stars)}</span>
                            {' – '}
                            <Link href={`/${locale}/restaurants/${rest.slug}`} className="text-secondary hover:text-primary">
                              {rest.name}
                            </Link>
                            {rest.country ? ` – ${rest.country}` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                    <a href={googleShoppingUrl} target="_blank" rel="noopener noreferrer"
                       className="mt-3 inline-block text-secondary text-sm font-semibold hover:text-primary font-inter">
                      {tCategory('table_see_price')} &rarr;
                    </a>
                  </div>
                )
              })}
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* ─── FULL EDITORIAL CONTENT ─── Rich content from DB */}
      {contentSections.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="divider-gold mb-12" />
            <div className="flex gap-12">
              {/* Table of Contents — desktop sidebar */}
              {tocItems.length >= 2 && (
                <div className="hidden lg:block w-64 shrink-0">
                  <TableOfContents items={tocItems} locale={locale} />
                </div>
              )}

              <div className="flex-1 max-w-4xl">
                {/* Table of Contents — mobile */}
                {tocItems.length >= 2 && (
                  <div className="lg:hidden">
                    <TableOfContents items={tocItems} locale={locale} />
                  </div>
                )}

                {contentSections.map((section, i) => (
                  <div key={i}>
                    {section.heading && (
                      <h2
                        id={section.headingId}
                        className="font-playfair text-2xl md:text-3xl text-text-main mt-16 mb-6 first:mt-0 scroll-mt-24"
                      >
                        {section.heading}
                      </h2>
                    )}
                    {renderParagraphs(section.content, isFounderSection(section))}
                  </div>
                ))}

                {/* Share buttons at end of editorial */}
                <div className="mt-12 pt-8 border-t border-border/20">
                  <ShareButtons url={pageUrl} title={`${name} - Bestwine Online`} locale={locale} />
                </div>
              </div>
            </div>
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

      {/* ─── NEWSLETTER SIGNUP ─── */}
      <NewsletterSignup locale={locale} />

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

      {/* ─── RELATED CATEGORIES ─── */}
      <RelatedCategories
        categories={relatedCategories}
        currentSlug={category}
        locale={locale}
      />

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

import { getTranslations } from 'next-intl/server'
import { locales, type Locale } from '@/i18n'
import Link from 'next/link'
import AnimatedSection from '@/components/AnimatedSection'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getCategories, type CategoryWithTranslation } from '@/lib/queries'

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tCat = await getTranslations({ locale, namespace: 'categories_page' })

  return {
    title: `${t('categories')} — Bestwine`,
    description: tCat('meta_description'),
    alternates: {
      languages: Object.fromEntries(
        locales.map(l => [l, `https://www.bestwine.online/${l}/categories`])
      ),
    },
  }
}

const categoryEmoji: Record<string, string> = {
  whisky: '\u{1F943}',
  'vin-rouge': '\u{1F377}',
  'vin-blanc': '\u{1F942}',
  champagne: '\u{1F37E}',
  cognac: '\u{1F943}',
  rhum: '\u{1F379}',
}

const categoryGradient: Record<string, string> = {
  whisky: 'from-amber-900/10 to-amber-700/5',
  'vin-rouge': 'from-red-900/10 to-red-700/5',
  'vin-blanc': 'from-yellow-100/40 to-yellow-50/20',
  champagne: 'from-amber-100/30 to-yellow-50/20',
  cognac: 'from-orange-900/10 to-orange-700/5',
  rhum: 'from-emerald-900/10 to-emerald-700/5',
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tCat = await getTranslations({ locale, namespace: 'categories_page' })

  let categories: CategoryWithTranslation[] = []
  try {
    const all = await getCategories(locale)
    // Only top-level categories (no parent)
    categories = all.filter(c => c.parent_id === null)
  } catch {
    // Supabase not configured — show empty state
  }

  const breadcrumbItems = [
    { label: t('home'), href: `/${locale}` },
    { label: t('categories') },
  ]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('categories'),
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cat.category_translations[0]?.name ?? cat.slug,
      url: `https://www.bestwine.online/${locale}/${cat.slug}`,
    })),
  }

  return (
    <div className="grain-overlay">
      <JsonLd data={itemListSchema} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 lg:pb-28">
        <Breadcrumb items={breadcrumbItems} isRtl={locale === 'ar'} />

        <AnimatedSection animation="fadeUp">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="shimmer-line h-px w-8" />
              <span className="text-xs font-inter uppercase tracking-[0.25em] text-secondary">
                Bestwine Online
              </span>
              <div className="shimmer-line h-px w-8" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-text-main">
              {tCat('title')}
            </h1>

            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              {tCat('subtitle')}
            </p>

            <div className="mt-6 mx-auto shimmer-line h-px w-24" />
          </div>
        </AnimatedSection>

        {categories.length === 0 ? (
          <AnimatedSection animation="fadeUp">
            <p className="text-muted text-center py-12 font-inter">
              {tCat('empty')}
            </p>
          </AnimatedSection>
        ) : (
          <AnimatedSection animation="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const translation = cat.category_translations[0]
              const name = translation?.name ?? cat.slug.replace(/-/g, ' ')
              const description = translation?.description
              const emoji = categoryEmoji[cat.slug] ?? '\u{1F37D}'
              const gradient = categoryGradient[cat.slug] ?? 'from-slate-100/30 to-slate-50/20'

              return (
                <AnimatedSection key={cat.id} animation="scaleIn">
                  <Link
                    href={`/${locale}/${cat.slug}`}
                    className={`group block p-6 lg:p-8 rounded-2xl bg-gradient-to-br ${gradient}
                              gradient-border hover:shadow-wine
                              transition-all duration-slow hover:scale-[1.02]`}
                  >
                    <span className="text-3xl lg:text-4xl block mb-4 group-hover:scale-110 transition-transform duration-slow">
                      {emoji}
                    </span>
                    <h2 className="text-lg lg:text-xl font-playfair font-semibold text-text-main capitalize mb-2">
                      {name}
                    </h2>
                    {description && (
                      <p className="text-sm text-muted font-inter line-clamp-3">
                        {description}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-inter font-medium text-primary group-hover:text-secondary transition-colors duration-fast">
                      {tCat('explore_category')}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="group-hover:translate-x-1 transition-transform duration-fast">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
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

import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import AnimatedSection from '@/components/AnimatedSection'
import JsonLd from '@/components/JsonLd'
import { generateWebSiteSchema, generateOrganizationSchema } from '@/lib/schema'
import { generateAlternateLinks, generateCanonicalUrl } from '@/lib/seo'

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const title = locale === 'fr'
    ? 'Bestwine : les meilleurs vins & spiritueux des restaurants etoiles Michelin'
    : 'Bestwine: the finest wines & spirits from Michelin-starred restaurants'
  const description = locale === 'fr'
    ? 'Decouvrez les references incontournables de vins et spiritueux a la carte des plus grands restaurants Michelin.'
    : 'Discover the must-have wines and spirits featured on the world\'s finest Michelin-starred restaurant wine lists.'

  return {
    title,
    description,
    alternates: {
      canonical: generateCanonicalUrl(locale, ''),
      languages: generateAlternateLinks(''),
    },
    openGraph: { title, description, type: 'website', locale, siteName: 'Bestwine Online' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

const FEATURED_CATEGORIES = [
  { slug: 'whisky', gradient: 'from-[#3D2B1F]/10 via-[#5C3D2E]/5 to-transparent' },
  { slug: 'vin-rouge', gradient: 'from-[#5C1A1A]/10 via-[#722F37]/5 to-transparent' },
  { slug: 'champagne', gradient: 'from-[#C9A96E]/10 via-[#F7E7C6]/5 to-transparent' },
  { slug: 'cognac', gradient: 'from-[#8B4513]/10 via-[#A0522D]/5 to-transparent' },
  { slug: 'rhum', gradient: 'from-[#2F4F4F]/10 via-[#3B6B5E]/5 to-transparent' },
  { slug: 'gin', gradient: 'from-[#4A6670]/10 via-[#708090]/5 to-transparent' },
]

const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  whisky: { fr: 'Whisky', en: 'Whisky' },
  'vin-rouge': { fr: 'Vin Rouge', en: 'Red Wine' },
  champagne: { fr: 'Champagne', en: 'Champagne' },
  cognac: { fr: 'Cognac', en: 'Cognac' },
  rhum: { fr: 'Rhum', en: 'Rum' },
  gin: { fr: 'Gin', en: 'Gin' },
}

export default function HomePage() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const isFr = locale === 'fr'

  return (
    <div className="grain-overlay">
      <JsonLd data={generateWebSiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />

      {/* ─── HERO ─── Full viewport, cinematic */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[100vh] flex items-center">
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gold/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-60 -left-40 w-[700px] h-[700px] bg-secondary/[0.03] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 w-px h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32 lg:py-40">
          <AnimatedSection animation="fadeUp">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="shimmer-line h-px w-12" />
                <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/80">
                  {isFr ? 'Guide des vins Michelin' : 'Michelin Wine Guide'}
                </span>
                <div className="shimmer-line h-px w-12" />
              </div>

              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold text-text-main leading-[1.05] tracking-tight">
                {t('title')}
              </h1>

              {/* Subtitle */}
              <p className="mt-8 text-lg lg:text-xl text-muted/80 leading-relaxed max-w-2xl font-inter font-light">
                {t('subtitle')}
              </p>

              {/* Decorative gold line */}
              <div className="mt-10 divider-gold !mx-0 !w-16" />

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-5">
                <Link
                  href={`/${locale}/categories`}
                  className="group inline-flex items-center gap-2.5 px-9 py-4 rounded-full
                           bg-primary text-white font-inter font-medium text-sm tracking-wide
                           hover:bg-primary/90 transition-all duration-slow
                           shadow-wine hover:shadow-deep"
                >
                  {t('cta_explore')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-fast opacity-70">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href={`/${locale}/restaurants`}
                  className="btn-gold"
                >
                  {t('cta_restaurants')}
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── TRUST BAR ─── Minimal stats, elegant */}
      <section className="border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14">
          <AnimatedSection animation="fadeUp">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-border/30">
              <div className="sm:px-12 text-center">
                <p className="text-3xl lg:text-4xl font-playfair font-bold text-gold-gradient">100+</p>
                <p className="mt-1.5 text-[11px] font-inter text-muted/70 uppercase tracking-[0.2em]">
                  {t('trust_restaurants')}
                </p>
              </div>
              <div className="sm:px-12 text-center">
                <p className="text-3xl lg:text-4xl font-playfair font-bold text-gold-gradient">1 000+</p>
                <p className="mt-1.5 text-[11px] font-inter text-muted/70 uppercase tracking-[0.2em]">
                  {t('trust_references')}
                </p>
              </div>
              <div className="sm:px-12 text-center">
                <p className="text-3xl lg:text-4xl font-playfair font-bold text-gold-gradient">10</p>
                <p className="mt-1.5 text-[11px] font-inter text-muted/70 uppercase tracking-[0.2em]">
                  {t('trust_languages')}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── LA SELECTION ─── Editorial category grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
        <AnimatedSection animation="fadeUp">
          <div className="text-center mb-16 lg:mb-20">
            <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
              {isFr ? 'Notre collection' : 'Our Collection'}
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl xl:text-5xl font-playfair font-bold text-text-main tracking-tight">
              {isFr ? 'La Selection' : 'The Selection'}
            </h2>
            <div className="mt-5 divider-gold" />
          </div>
        </AnimatedSection>

        <AnimatedSection animation="stagger" className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {FEATURED_CATEGORIES.map((cat) => {
            const catName = CATEGORY_NAMES[cat.slug]?.[isFr ? 'fr' : 'en'] ?? cat.slug
            return (
              <AnimatedSection key={cat.slug} animation="scaleIn">
                <Link
                  href={`/${locale}/${cat.slug}`}
                  className={`group block relative overflow-hidden rounded-xl
                            bg-gradient-to-br ${cat.gradient}
                            p-8 lg:p-10 xl:p-12
                            border border-border/20 hover:border-gold/30
                            card-hover hover:shadow-gold
                            text-start`}
                >
                  {/* Subtle corner accent */}
                  <div className="absolute top-0 end-0 w-24 h-24 bg-gradient-to-bl from-gold/[0.06] to-transparent rounded-bl-full" />

                  <span className="relative z-10 block text-lg lg:text-xl xl:text-2xl font-playfair font-semibold text-text-main
                                 group-hover:text-primary transition-colors duration-slow">
                    {catName}
                  </span>

                  {/* Subtle arrow */}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className="mt-4 text-muted/30 group-hover:text-gold group-hover:translate-x-1
                             rtl:group-hover:-translate-x-1 transition-all duration-slow"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </Link>
              </AnimatedSection>
            )
          })}
        </AnimatedSection>
      </section>

      {/* ─── SOMMELIER QUOTE ─── Full-width editorial banner */}
      <section className="bg-obsidian-gradient grain-overlay relative py-24 lg:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-gold/30 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-gold/30 to-transparent" />
        </div>

        <AnimatedSection animation="fadeUp">
          <div className="relative max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <blockquote className="text-xl lg:text-2xl xl:text-3xl font-playfair font-normal text-white/80 leading-relaxed italic">
              {isFr
                ? '"Le vin est la partie intellectuelle d\'un repas. Les viandes et les legumes n\'en sont que la partie materielle."'
                : '"Wine is the intellectual part of a meal. Meat and vegetables are merely the material part."'}
            </blockquote>
            <div className="mt-8 divider-gold" />
            <p className="mt-6 text-[11px] font-inter uppercase tracking-[0.3em] text-gold/60">
              Alexandre Dumas
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── HOW IT WORKS ─── 3 steps, minimal */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
        <AnimatedSection animation="fadeUp">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-text-main tracking-tight">
              {isFr ? 'Comment ca fonctionne' : 'How It Works'}
            </h2>
            <div className="mt-5 divider-gold" />
          </div>
        </AnimatedSection>

        <AnimatedSection animation="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {[
            {
              num: '01',
              title: isFr ? 'Explorez' : 'Explore',
              desc: isFr
                ? 'Parcourez notre selection curatee de vins et spiritueux par categorie.'
                : 'Browse our curated selection of wines and spirits by category.',
            },
            {
              num: '02',
              title: isFr ? 'Decouvrez' : 'Discover',
              desc: isFr
                ? 'Chaque reference est presente a la carte des meilleurs restaurants etoiles Michelin.'
                : 'Every reference is featured on the wine lists of top Michelin-starred restaurants.',
            },
            {
              num: '03',
              title: isFr ? 'Trouvez' : 'Find',
              desc: isFr
                ? 'Achetez les memes bouteilles que les sommeliers des plus grands restaurants.'
                : 'Purchase the same bottles chosen by sommeliers at the world\'s finest restaurants.',
            },
          ].map((step) => (
            <AnimatedSection key={step.num} animation="fadeUp">
              <div className="text-center md:text-start">
                <span className="text-4xl lg:text-5xl font-playfair font-bold text-gold/30">
                  {step.num}
                </span>
                <h3 className="mt-3 text-xl font-playfair font-semibold text-text-main">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-inter text-muted/70 leading-relaxed max-w-xs md:max-w-none">
                  {step.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </AnimatedSection>
      </section>

      {/* ─── RESTAURANTS PREVIEW ─── */}
      <section className="bg-fog/40 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
          <AnimatedSection animation="fadeUp">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
              <div>
                <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
                  Michelin Guide
                </span>
                <h2 className="mt-3 text-3xl lg:text-4xl font-playfair font-bold text-text-main tracking-tight">
                  {isFr ? 'Les restaurants etoiles' : 'Starred Restaurants'}
                </h2>
              </div>
              <Link
                href={`/${locale}/restaurants`}
                className="text-sm font-inter text-primary link-underline tracking-wide"
              >
                {isFr ? 'Voir tous les restaurants' : 'View all restaurants'}
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: isFr ? 'Decouvrez notre selection' : 'Discover our selection', desc: isFr ? 'Plus de 100 restaurants etoiles references dans notre guide.' : 'Over 100 starred restaurants featured in our guide.' },
              ].map((item, i) => (
                <div key={i} className="md:col-span-3 text-center py-12 glass-card rounded-xl">
                  <p className="text-lg font-playfair text-text-main">{item.name}</p>
                  <p className="mt-2 text-sm font-inter text-muted">{item.desc}</p>
                  <Link
                    href={`/${locale}/restaurants`}
                    className="inline-flex items-center gap-2 mt-6 px-8 py-3 rounded-full
                             bg-primary text-white font-inter text-sm font-medium
                             hover:bg-primary/90 transition-all duration-normal shadow-wine"
                  >
                    {t('cta_restaurants')}
                  </Link>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

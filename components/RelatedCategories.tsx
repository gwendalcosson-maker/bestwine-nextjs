import Link from 'next/link'
import AnimatedSection from './AnimatedSection'

interface RelatedCategory {
  slug: string
  name: string
}

interface RelatedCategoriesProps {
  categories: RelatedCategory[]
  currentSlug: string
  locale: string
}

export default function RelatedCategories({ categories, currentSlug, locale }: RelatedCategoriesProps) {
  // Filter out current category and pick up to 4
  const related = categories
    .filter((c) => c.slug !== currentSlug)
    .slice(0, 4)

  if (related.length === 0) return null

  const isFr = locale === 'fr'

  return (
    <section className="border-t border-border/20 bg-fog/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
        <AnimatedSection animation="fadeUp">
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[11px] font-inter uppercase tracking-[0.35em] text-gold/70">
              {isFr ? 'Vous pourriez aussi aimer' : 'You might also like'}
            </span>
            <div className="flex-1 h-px bg-border/20" />
          </div>
        </AnimatedSection>
        <AnimatedSection animation="stagger" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {related.map((cat) => (
            <AnimatedSection key={cat.slug} animation="scaleIn">
              <Link
                href={`/${locale}/${cat.slug}`}
                className="block group"
              >
                <div className="glass-card rounded-xl p-6 text-center
                               border border-border/20 hover:border-gold/30
                               hover:shadow-gold
                               transition-all duration-normal">
                  <h3 className="font-playfair font-bold text-lg text-text-main
                                group-hover:text-primary transition-colors duration-fast">
                    {cat.name}
                  </h3>
                  <div className="mt-3 mx-auto w-8 h-px bg-gold/40 group-hover:w-12 transition-all duration-normal" />
                  <p className="mt-3 text-xs font-inter text-gold/60 uppercase tracking-wider">
                    {isFr ? 'Découvrir' : 'Discover'}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

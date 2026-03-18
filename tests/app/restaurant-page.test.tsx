import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/queries', () => ({
  getRestaurants: vi.fn().mockResolvedValue([
    {
      id: 5, name: "L'Arpège", slug: 'larpege', country: 'France', city: 'Paris',
      michelin_stars: 3, created_at: '',
      restaurant_translations: [{
        locale: 'fr', description: 'Restaurant végétal.',
        wine_list_critique: 'Cave exceptionnelle.', meta_title: "Carte des vins — L'Arpège",
        meta_description: 'Les vins du restaurant.', restaurant_id: 5, id: 5, created_at: '',
      }],
    },
  ]),
  getRestaurantBySlug: vi.fn().mockResolvedValue({
    id: 5, name: "L'Arpège", slug: 'larpege', country: 'France', city: 'Paris',
    michelin_stars: 3, created_at: '',
    restaurant_translations: [{
      locale: 'fr', description: 'Restaurant végétal.',
      wine_list_critique: 'Cave exceptionnelle.', meta_title: "Carte des vins — L'Arpège",
      meta_description: 'Les vins du restaurant.', restaurant_id: 5, id: 5, created_at: '',
    }],
  }),
  getWineListForRestaurant: vi.fn().mockResolvedValue([]),
  getCategories: vi.fn().mockResolvedValue([]),
  getCategoryBySlug: vi.fn().mockResolvedValue(null),
  getDrinksByCategory: vi.fn().mockResolvedValue([]),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

describe('generateStaticParams — restaurants listing', () => {
  it('returns one entry per locale', async () => {
    const { generateStaticParams } = await import('@/app/[locale]/restaurants/page')
    const params = await generateStaticParams()
    expect(params).toHaveLength(11) // 11 locales
    expect(params[0]).toHaveProperty('locale')
  })
})

describe('generateMetadata — restaurant detail', () => {
  it('uses meta_title from restaurant_translations', async () => {
    const { generateMetadata } = await import('@/app/[locale]/restaurants/[slug]/page')
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'fr', slug: 'larpege' }),
    })
    expect(meta.title).toBe("Carte des vins — L'Arpège")
  })
})

describe('generateStaticParams — restaurant detail', () => {
  it('returns one entry per restaurant × locale', async () => {
    const { generateStaticParams } = await import('@/app/[locale]/restaurants/[slug]/page')
    const params = await generateStaticParams()
    expect(params).toHaveLength(11) // 1 restaurant × 11 locales
    expect(params[0]).toHaveProperty('slug')
    expect(params[0]).toHaveProperty('locale')
  })
})

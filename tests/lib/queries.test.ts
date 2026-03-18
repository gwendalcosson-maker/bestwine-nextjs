import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
  Category,
  CategoryTranslation,
  Drink,
  DrinkTranslation,
  Restaurant,
  RestaurantTranslation,
  WineListEntry,
} from '@/lib/types'

const makeSelectBuilder = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data, error }),
  single: vi.fn().mockResolvedValue({ data, error }),
  then: vi.fn().mockResolvedValue({ data, error }),
})

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAnon: { from: mockFrom },
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

const categoryFixture: Category = {
  id: 1, slug: 'whisky', parent_id: null, sort_order: 1, created_at: '2024-01-01T00:00:00Z',
}
const categoryTranslationFixture: CategoryTranslation = {
  id: 1, category_id: 1, locale: 'fr', name: 'Whisky',
  description: 'Les grands whiskies.', meta_title: 'Whisky : meilleures bouteilles',
  meta_description: 'Découvrez les whiskies des cartes des restaurants étoilés.',
  created_at: '2024-01-01T00:00:00Z',
}
const drinkFixture: Drink = {
  id: 10, category_id: 1, name: 'Yamazaki 18', slug: 'yamazaki-18',
  producer: 'Suntory', vintage: null, country: 'Japan', region: 'Osaka',
  appellation: null, created_at: '2024-01-01T00:00:00Z',
}
const restaurantFixture: Restaurant = {
  id: 5, name: "L'Arpège", slug: 'larpege', country: 'France', city: 'Paris',
  michelin_stars: 3, created_at: '2024-01-01T00:00:00Z',
}
const restaurantTranslationFixture: RestaurantTranslation = {
  id: 5, restaurant_id: 5, locale: 'fr',
  description: "Restaurant végétal d'Alain Passard.",
  wine_list_critique: 'Cave exceptionnelle axée sur la Bourgogne.',
  meta_title: "L'Arpège | Carte des vins",
  meta_description: "Vins servis à L'Arpège, 3 étoiles Michelin Paris.",
  created_at: '2024-01-01T00:00:00Z',
}
const wineListEntryFixture: WineListEntry = {
  id: 99, restaurant_id: 5, drink_id: 10, price: 380,
  price_currency: 'EUR', year_on_list: 2024, created_at: '2024-01-01T00:00:00Z',
}

describe('getCategories', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ ...categoryFixture, category_translations: [categoryTranslationFixture] }],
        error: null,
      }),
    })
  })

  it('returns categories with translations for the given locale', async () => {
    const { getCategories } = await import('@/lib/queries')
    const result = await getCategories('fr')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('whisky')
    expect(result[0].category_translations[0].name).toBe('Whisky')
  })

  it('calls supabaseAnon.from with "categories"', async () => {
    const { getCategories } = await import('@/lib/queries')
    await getCategories('fr')
    expect(mockFrom).toHaveBeenCalledWith('categories')
  })
})

describe('getCategoryBySlug', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...categoryFixture, category_translations: [categoryTranslationFixture], children: [] },
        error: null,
      }),
    })
  })

  it('returns a single category matching the slug', async () => {
    const { getCategoryBySlug } = await import('@/lib/queries')
    const result = await getCategoryBySlug('whisky', 'fr')
    expect(result).not.toBeNull()
    expect(result?.slug).toBe('whisky')
  })

  it('returns null when category is not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    })
    const { getCategoryBySlug } = await import('@/lib/queries')
    const result = await getCategoryBySlug('does-not-exist', 'fr')
    expect(result).toBeNull()
  })
})

describe('getDrinksByCategory', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ ...drinkFixture, drink_translations: [] }],
        error: null,
      }),
    })
  })

  it('returns drinks for a given category id', async () => {
    const { getDrinksByCategory } = await import('@/lib/queries')
    const result = await getDrinksByCategory(1, 'fr')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Yamazaki 18')
  })
})

describe('getRestaurants', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ ...restaurantFixture, restaurant_translations: [restaurantTranslationFixture] }],
        error: null,
      }),
    })
  })

  it('returns restaurants with translations', async () => {
    const { getRestaurants } = await import('@/lib/queries')
    const result = await getRestaurants('fr')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('larpege')
    expect(result[0].michelin_stars).toBe(3)
  })
})

describe('getRestaurantBySlug', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { ...restaurantFixture, restaurant_translations: [restaurantTranslationFixture] },
        error: null,
      }),
    })
  })

  it('returns the restaurant matching the slug', async () => {
    const { getRestaurantBySlug } = await import('@/lib/queries')
    const result = await getRestaurantBySlug('larpege', 'fr')
    expect(result?.name).toBe("L'Arpège")
  })

  it('returns null for unknown slug', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    })
    const { getRestaurantBySlug } = await import('@/lib/queries')
    const result = await getRestaurantBySlug('unknown', 'fr')
    expect(result).toBeNull()
  })
})

describe('getWineListForRestaurant', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{
          ...wineListEntryFixture,
          drinks: { ...drinkFixture, drink_translations: [], categories: categoryFixture },
        }],
        error: null,
      }),
    })
  })

  it('returns wine list entries with drink details', async () => {
    const { getWineListForRestaurant } = await import('@/lib/queries')
    const result = await getWineListForRestaurant(5, 'fr')
    expect(result).toHaveLength(1)
    expect(result[0].drinks.name).toBe('Yamazaki 18')
    expect(result[0].price).toBe(380)
  })
})

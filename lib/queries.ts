// lib/queries.ts
import { unstable_cache } from 'next/cache'
import { supabaseAnon } from './supabase'
import type {
  Category,
  CategoryTranslation,
  Drink,
  DrinkTranslation,
  Restaurant,
  RestaurantTranslation,
  WineListEntry,
} from './types'

// Composite return types
export type CategoryWithTranslation = Category & {
  category_translations: CategoryTranslation[]
}

export type CategoryWithChildren = CategoryWithTranslation & {
  children: CategoryWithTranslation[]
}

export type DrinkWithTranslation = Drink & {
  drink_translations: DrinkTranslation[]
}

export type RestaurantWithTranslation = Restaurant & {
  restaurant_translations: RestaurantTranslation[]
}

export type WineListEntryWithDrink = WineListEntry & {
  drinks: DrinkWithTranslation & { categories: Category }
}

const TAGS = {
  categories: 'categories',
  drinks: 'drinks',
  restaurants: 'restaurants',
  wineList: 'wine-list',
} as const

export const getCategories = unstable_cache(
  async (locale: string): Promise<CategoryWithTranslation[]> => {
    const { data, error } = await supabaseAnon
      .from('categories')
      .select('*, category_translations!inner(*)')
      .eq('category_translations.locale', locale)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[getCategories]', error.message)
      return []
    }
    return (data ?? []) as CategoryWithTranslation[]
  },
  ['getCategories'],
  { revalidate: 3600, tags: [TAGS.categories] }
)

export const getCategoryBySlug = unstable_cache(
  async (slug: string, locale: string): Promise<CategoryWithChildren | null> => {
    const { data, error } = await supabaseAnon
      .from('categories')
      .select(`
        *,
        category_translations!inner(*),
        children:categories!parent_id(
          *,
          category_translations!inner(*)
        )
      `)
      .eq('slug', slug)
      .eq('category_translations.locale', locale)
      .eq('children.category_translations.locale', locale)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('[getCategoryBySlug]', error.message)
      return null
    }
    return data as CategoryWithChildren
  },
  ['getCategoryBySlug'],
  { revalidate: 3600, tags: [TAGS.categories] }
)

export const getDrinksByCategory = unstable_cache(
  async (categoryId: number, locale: string): Promise<DrinkWithTranslation[]> => {
    // First get drinks directly in this category
    const { data: directDrinks, error: directError } = await supabaseAnon
      .from('drinks')
      .select('*, drink_translations(*)')
      .eq('category_id', categoryId)
      .eq('drink_translations.locale', locale)
      .order('name', { ascending: true })

    if (directError) {
      console.error('[getDrinksByCategory]', directError.message)
      return []
    }

    // Also get drinks from child categories
    const { data: childCategories } = await supabaseAnon
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)

    let childDrinks: DrinkWithTranslation[] = []
    if (childCategories && childCategories.length > 0) {
      const childIds = childCategories.map((c: { id: number }) => c.id)
      const { data: subDrinks, error: subError } = await supabaseAnon
        .from('drinks')
        .select('*, drink_translations(*)')
        .in('category_id', childIds)
        .eq('drink_translations.locale', locale)
        .order('name', { ascending: true })

      if (!subError && subDrinks) {
        childDrinks = subDrinks as DrinkWithTranslation[]
      }
    }

    // Merge and deduplicate
    const allDrinks = [...(directDrinks ?? []) as DrinkWithTranslation[], ...childDrinks]
    const seen = new Set<number>()
    return allDrinks.filter(d => {
      if (seen.has(d.id)) return false
      seen.add(d.id)
      return true
    })
  },
  ['getDrinksByCategory'],
  { revalidate: 3600, tags: [TAGS.drinks] }
)

export const getRestaurants = unstable_cache(
  async (locale: string): Promise<RestaurantWithTranslation[]> => {
    const { data, error } = await supabaseAnon
      .from('restaurants')
      .select('*, restaurant_translations(*)')
      .eq('restaurant_translations.locale', locale)
      .order('michelin_stars', { ascending: false })

    if (error) {
      console.error('[getRestaurants]', error.message)
      return []
    }
    return (data ?? []) as RestaurantWithTranslation[]
  },
  ['getRestaurants'],
  { revalidate: 3600, tags: [TAGS.restaurants] }
)

export const getRestaurantBySlug = unstable_cache(
  async (slug: string, locale: string): Promise<RestaurantWithTranslation | null> => {
    const { data, error } = await supabaseAnon
      .from('restaurants')
      .select('*, restaurant_translations(*)')
      .eq('slug', slug)
      .eq('restaurant_translations.locale', locale)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('[getRestaurantBySlug]', error.message)
      return null
    }
    return data as RestaurantWithTranslation
  },
  ['getRestaurantBySlug'],
  { revalidate: 3600, tags: [TAGS.restaurants] }
)

export const getWineListForRestaurant = unstable_cache(
  async (restaurantId: number, locale: string): Promise<WineListEntryWithDrink[]> => {
    const { data, error } = await supabaseAnon
      .from('wine_list_entries')
      .select(`
        *,
        drinks(
          *,
          drink_translations(*),
          categories(*)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('drinks.drink_translations.locale', locale)
      .order('drinks.name', { ascending: true })

    if (error) {
      console.error('[getWineListForRestaurant]', error.message)
      return []
    }
    return (data ?? []) as WineListEntryWithDrink[]
  },
  ['getWineListForRestaurant'],
  { revalidate: 3600, tags: [TAGS.wineList] }
)

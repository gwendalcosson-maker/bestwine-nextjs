// lib/pdf-import.ts
import { createServiceClient } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Restaurant, Drink, Category } from './types'

/** Structured data extracted from a PDF wine list */
export interface ExtractedDrink {
  name: string
  producer?: string
  vintage?: number
  category: string // e.g., "vin-rouge", "whisky", "champagne"
  subcategory?: string // e.g., "bordeaux", "bourbon"
  country?: string
  region?: string
  appellation?: string
  price?: number
  currency?: string // ISO 4217 (EUR, USD, GBP...)
}

export interface ImportResult {
  restaurant: { id: number; slug: string; name: string; created: boolean }
  drinks: {
    inserted: number
    updated: number
    skipped: number // already existed with same data
    errors: string[]
  }
  categories: {
    created: string[] // new subcategories auto-created
  }
  wineListEntries: number
}

/**
 * Import a parsed wine list into Supabase.
 * This function receives already-extracted structured data (not raw PDF).
 * PDF parsing happens at the API layer or externally (e.g., Claude).
 */
export async function importWineList(
  restaurantData: {
    name: string
    country?: string
    city?: string
    michelinStars: number
  },
  drinks: ExtractedDrink[],
  yearOnList?: number
): Promise<ImportResult> {
  // Use untyped client to avoid Database generic inference issues with insert/upsert
  const supabase = createServiceClient() as unknown as SupabaseClient

  const result: ImportResult = {
    restaurant: { id: 0, slug: '', name: restaurantData.name, created: false },
    drinks: { inserted: 0, updated: 0, skipped: 0, errors: [] },
    categories: { created: [] },
    wineListEntries: 0,
  }

  // 1. Upsert restaurant
  const restaurantSlug = slugify(restaurantData.name)
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('id, slug')
    .eq('slug', restaurantSlug)
    .single() as { data: Pick<Restaurant, 'id' | 'slug'> | null }

  if (existingRestaurant) {
    result.restaurant = {
      ...result.restaurant,
      id: existingRestaurant.id,
      slug: existingRestaurant.slug,
    }
  } else {
    const { data: newRestaurant, error } = await supabase
      .from('restaurants')
      .insert({
        name: restaurantData.name,
        slug: restaurantSlug,
        country: restaurantData.country,
        city: restaurantData.city,
        michelin_stars: restaurantData.michelinStars,
      })
      .select('id, slug')
      .single()

    if (error || !newRestaurant) {
      throw new Error(`Failed to create restaurant: ${error?.message}`)
    }
    const r = newRestaurant as Pick<Restaurant, 'id' | 'slug'>
    result.restaurant = {
      ...result.restaurant,
      id: r.id,
      slug: r.slug,
      created: true,
    }
  }

  // 2. Process each drink
  for (const drink of drinks) {
    try {
      // 2a. Ensure category exists
      const categoryId = await ensureCategory(supabase, drink.category, null)

      // 2b. Ensure subcategory exists (auto-create if needed)
      let finalCategoryId = categoryId
      if (drink.subcategory) {
        finalCategoryId = await ensureCategory(
          supabase,
          drink.subcategory,
          categoryId
        )
        if (finalCategoryId !== categoryId) {
          result.categories.created.push(
            `${drink.category}/${drink.subcategory}`
          )
        }
      }

      // 2c. Deduplicate: check if drink already exists (name + producer + vintage)
      const drinkSlug = generateDrinkSlug(drink)
      const { data: existingDrink } = await supabase
        .from('drinks')
        .select('id')
        .eq('slug', drinkSlug)
        .single() as { data: Pick<Drink, 'id'> | null }

      let drinkId: number

      if (existingDrink) {
        drinkId = existingDrink.id
        result.drinks.skipped++
      } else {
        const { data: newDrink, error } = await supabase
          .from('drinks')
          .insert({
            category_id: finalCategoryId,
            name: drink.name,
            producer: drink.producer,
            vintage: drink.vintage,
            country: drink.country,
            region: drink.region,
            appellation: drink.appellation,
            slug: drinkSlug,
          })
          .select('id')
          .single()

        if (error || !newDrink) {
          result.drinks.errors.push(
            `Failed to insert ${drink.name}: ${error?.message}`
          )
          continue
        }
        drinkId = (newDrink as Pick<Drink, 'id'>).id
        result.drinks.inserted++
      }

      // 2d. Create wine list entry
      const { error: entryError } = await supabase
        .from('wine_list_entries')
        .upsert(
          {
            restaurant_id: result.restaurant.id,
            drink_id: drinkId,
            price: drink.price,
            price_currency: drink.currency,
            year_on_list: yearOnList || new Date().getFullYear(),
          },
          {
            onConflict: 'restaurant_id,drink_id,year_on_list',
          }
        )

      if (!entryError) {
        result.wineListEntries++
      }
    } catch (err) {
      result.drinks.errors.push(
        `Error processing ${drink.name}: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  return result
}

/** Ensure a category exists, creating it if needed. Returns category ID. */
async function ensureCategory(
  supabase: SupabaseClient,
  slug: string,
  parentId: number | null
): Promise<number> {
  // Check existing
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single() as { data: Pick<Category, 'id'> | null }

  if (existing) return existing.id

  // Auto-create
  const { data: maxSort } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single() as { data: Pick<Category, 'sort_order'> | null }

  const nextSort = (maxSort?.sort_order || 0) + 1

  const { data: created, error } = await supabase
    .from('categories')
    .insert({ slug, parent_id: parentId, sort_order: nextSort })
    .select('id')
    .single()

  if (error || !created) {
    throw new Error(`Failed to create category "${slug}": ${error?.message}`)
  }

  const categoryId = (created as Pick<Category, 'id'>).id

  // Auto-create FR translation
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  await supabase.from('category_translations').insert({
    category_id: categoryId,
    locale: 'fr',
    name,
    meta_title: `${name} : les meilleures bouteilles à la carte des restaurants étoilés`,
    meta_description: `Découvrez les meilleurs ${name.toLowerCase()} référencés à la carte des grands restaurants gastronomiques étoilés Michelin.`,
  })

  return categoryId
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateDrinkSlug(drink: ExtractedDrink): string {
  const parts = [drink.name]
  if (drink.producer) parts.push(drink.producer)
  if (drink.vintage) parts.push(String(drink.vintage))
  return slugify(parts.join(' '))
}

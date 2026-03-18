import type { MetadataRoute } from 'next'
import { locales } from '@/i18n'

const BASE_URL = 'https://www.bestwine.online'

// Build full path for a category (handles N-level depth)
function buildCategoryPath(cat: { slug: string; parent_id: number | null }, allCategories: Array<{ id: number; slug: string; parent_id: number | null }>): string {
  if (!cat.parent_id) return cat.slug

  const parent = allCategories.find(c => c.id === cat.parent_id)
  if (!parent) return cat.slug

  return `${buildCategoryPath(parent, allCategories)}/${cat.slug}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // 1. Homepage per locale
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}`])),
          'x-default': `${BASE_URL}/en-us`,
        },
      },
    })
  }

  // 2. Categories page per locale
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/categories`])),
          'x-default': `${BASE_URL}/en-us/categories`,
        },
      },
    })
  }

  // 3. Dynamic category + restaurant pages from Supabase
  try {
    const { supabaseAnon } = await import('@/lib/supabase')

    const { data: categories } = await supabaseAnon
      .from('categories')
      .select('id, slug, parent_id') as { data: Array<{ id: number; slug: string; parent_id: number | null }> | null }

    if (categories) {
      for (const cat of categories) {
        const path = buildCategoryPath(cat, categories)

        for (const locale of locales) {
          entries.push({
            url: `${BASE_URL}/${locale}/${path}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
              languages: {
                ...Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/${path}`])),
                'x-default': `${BASE_URL}/en-us/${path}`,
              },
            },
          })
        }
      }
    }

    // 4. Restaurant pages
    const { data: restaurants } = await supabaseAnon
      .from('restaurants')
      .select('slug') as { data: Array<{ slug: string }> | null }

    if (restaurants) {
      for (const rest of restaurants) {
        for (const locale of locales) {
          entries.push({
            url: `${BASE_URL}/${locale}/restaurants/${rest.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
            alternates: {
              languages: {
                ...Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/restaurants/${rest.slug}`])),
                'x-default': `${BASE_URL}/en-us/restaurants/${rest.slug}`,
              },
            },
          })
        }
      }
    }
  } catch {
    // Supabase not configured — return static entries only
  }

  // 5. Restaurants index per locale
  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}/restaurants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/restaurants`])),
          'x-default': `${BASE_URL}/en-us/restaurants`,
        },
      },
    })
  }

  return entries
}

import type { MetadataRoute } from 'next'
import { locales } from '@/i18n'

const BASE_URL = 'https://www.bestwine.online'

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
        languages: Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}`])),
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
        languages: Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/categories`])),
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
        let path = cat.slug
        if (cat.parent_id) {
          const parent = categories.find(c => c.id === cat.parent_id)
          if (parent) path = `${parent.slug}/${cat.slug}`
        }

        for (const locale of locales) {
          entries.push({
            url: `${BASE_URL}/${locale}/${path}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
              languages: Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/${path}`])),
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
              languages: Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/restaurants/${rest.slug}`])),
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
        languages: Object.fromEntries(locales.map(l => [l, `${BASE_URL}/${l}/restaurants`])),
      },
    })
  }

  return entries
}

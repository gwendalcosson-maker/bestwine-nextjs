import type { MetadataRoute } from 'next'
import { locales } from '@/i18n'

const BASE_URL = 'https://www.bestwine.online'
const CATEGORY_SLUGS = ['whisky', 'vin-rouge', 'vin-blanc', 'champagne', 'cognac', 'rhum']
const SUBCATEGORY_MAP: Record<string, string[]> = {
  whisky: ['bourbon', 'scotch-whisky'],
  'vin-blanc': ['jura'],
}
const RESTAURANT_SLUGS = ['le-jules-verne']

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  for (const locale of locales) {
    entries.push({ url: `${BASE_URL}/${locale}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 })
    for (const cat of CATEGORY_SLUGS) {
      entries.push({ url: `${BASE_URL}/${locale}/${cat}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 })
      const subs = SUBCATEGORY_MAP[cat]
      if (subs) {
        for (const sub of subs) {
          entries.push({ url: `${BASE_URL}/${locale}/${cat}/${sub}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 })
        }
      }
    }
    entries.push({ url: `${BASE_URL}/${locale}/restaurants`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 })
    for (const slug of RESTAURANT_SLUGS) {
      entries.push({ url: `${BASE_URL}/${locale}/restaurants/${slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 })
    }
  }
  return entries
}

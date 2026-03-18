// lib/schema.ts
import type { BreadcrumbItem } from '@/components/Breadcrumb'

const BASE_URL = 'https://www.bestwine.online'

export function generateBreadcrumbSchema(items: BreadcrumbItem[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? `${BASE_URL}${item.href}` : undefined,
    })),
  }
}

export function generateItemListSchema(drinks: Array<{ name: string; slug: string }>, locale: string, category: { slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category.slug,
    numberOfItems: drinks.length,
    itemListElement: drinks.map((drink, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: drink.name,
      url: `${BASE_URL}/${locale}/${category.slug}#${drink.slug}`,
    })),
  }
}

export function generateRestaurantSchema(restaurant: { name: string; city?: string | null; country?: string | null; michelin_stars: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: restaurant.city,
      addressCountry: restaurant.country,
    },
    starRating: {
      '@type': 'Rating',
      ratingValue: restaurant.michelin_stars,
    },
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bestwine Online',
    url: BASE_URL,
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bestwine Online',
    url: BASE_URL,
  }
}

export function generateArticleSchema(restaurant: { name: string }, locale: string) {
  const headline = locale === 'fr'
    ? `Carte des vins du Restaurant ${restaurant.name}`
    : `Wine List at Restaurant ${restaurant.name}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    publisher: { '@type': 'Organization', name: 'Bestwine Online' },
  }
}

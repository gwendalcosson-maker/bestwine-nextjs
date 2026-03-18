import { describe, it, expect } from 'vitest'
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateRestaurantSchema,
  generateArticleSchema,
} from '@/lib/schema'

describe('generateWebSiteSchema', () => {
  it('returns WebSite schema with correct type', () => {
    const schema = generateWebSiteSchema()
    expect(schema['@type']).toBe('WebSite')
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema.name).toBe('Bestwine Online')
    expect(schema.url).toBe('https://www.bestwine.online')
  })
})

describe('generateOrganizationSchema', () => {
  it('returns Organization schema', () => {
    const schema = generateOrganizationSchema()
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('Bestwine Online')
  })
})

describe('generateBreadcrumbSchema', () => {
  it('returns BreadcrumbList with correct items', () => {
    const items = [
      { label: 'Accueil', href: '/fr' },
      { label: 'Whisky' },
    ]
    const schema = generateBreadcrumbSchema(items, 'fr')
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement).toHaveLength(2)
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[0].name).toBe('Accueil')
  })
})

describe('generateItemListSchema', () => {
  it('returns ItemList with drinks', () => {
    const drinks = [{ name: 'Yamazaki 18', slug: 'yamazaki-18' }]
    const category = { slug: 'whisky' }
    const schema = generateItemListSchema(drinks, 'fr', category)
    expect(schema['@type']).toBe('ItemList')
    expect(schema.numberOfItems).toBe(1)
    expect(schema.itemListElement[0].name).toBe('Yamazaki 18')
  })
})

describe('generateRestaurantSchema', () => {
  it('returns Restaurant schema', () => {
    const restaurant = { name: "L'Arpège", city: 'Paris', country: 'France', michelin_stars: 3 }
    const schema = generateRestaurantSchema(restaurant)
    expect(schema['@type']).toBe('Restaurant')
    expect(schema.name).toBe("L'Arpège")
  })
})

describe('generateArticleSchema', () => {
  it('returns Article schema for wine list critique', () => {
    const restaurant = { name: "L'Arpège" }
    const schema = generateArticleSchema(restaurant, 'fr')
    expect(schema['@type']).toBe('Article')
    expect(schema.headline).toContain("L'Arpège")
  })
})

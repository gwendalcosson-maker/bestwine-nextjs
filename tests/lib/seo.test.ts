import { describe, it, expect } from 'vitest'
import { generateCanonicalUrl, generateAlternateLinks } from '@/lib/seo'

describe('generateCanonicalUrl', () => {
  it('builds correct canonical URL', () => {
    expect(generateCanonicalUrl('fr', '/whisky')).toBe('https://www.bestwine.online/fr/whisky')
  })

  it('handles root path', () => {
    expect(generateCanonicalUrl('en-us', '')).toBe('https://www.bestwine.online/en-us')
  })
})

describe('generateAlternateLinks', () => {
  it('returns links for all 11 locales + x-default', () => {
    const links = generateAlternateLinks('/whisky')
    expect(Object.keys(links)).toHaveLength(12) // 11 locales + x-default
    expect(links['fr']).toBe('https://www.bestwine.online/fr/whisky')
    expect(links['en-us']).toBe('https://www.bestwine.online/en-us/whisky')
    expect(links['x-default']).toBe('https://www.bestwine.online/en-us/whisky')
    expect(links['ar']).toBe('https://www.bestwine.online/ar/whisky')
  })
})

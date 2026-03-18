import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('returns an array of entries', () => {
    const entries = sitemap()
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })
  it('homepage has priority 1.0', () => {
    const entries = sitemap()
    const fr = entries.find(e => e.url === 'https://www.bestwine.online/fr')
    expect(fr?.priority).toBe(1.0)
  })
  it('category pages have priority 0.8', () => {
    const entries = sitemap()
    const whisky = entries.find(e => e.url === 'https://www.bestwine.online/fr/whisky')
    expect(whisky?.priority).toBe(0.8)
  })
  it('restaurant pages have priority 0.7', () => {
    const entries = sitemap()
    const resto = entries.find(e => e.url.includes('/restaurants/le-jules-verne'))
    expect(resto?.priority).toBe(0.7)
  })
  it('includes all 11 locales for homepage', () => {
    const entries = sitemap()
    const homepages = entries.filter(e => e.priority === 1.0)
    expect(homepages).toHaveLength(11)
  })
})

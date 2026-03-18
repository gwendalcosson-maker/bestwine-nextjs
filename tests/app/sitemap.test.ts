import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('returns an array of entries', async () => {
    const entries = await sitemap()
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })
  it('homepage has priority 1.0', async () => {
    const entries = await sitemap()
    const fr = entries.find(e => e.url === 'https://www.bestwine.online/fr')
    expect(fr?.priority).toBe(1.0)
  })
  it('category pages exist', async () => {
    const entries = await sitemap()
    const categories = entries.find(e => e.url === 'https://www.bestwine.online/fr/categories')
    expect(categories?.priority).toBe(0.9)
  })
  it('restaurants index exists', async () => {
    const entries = await sitemap()
    const resto = entries.find(e => e.url === 'https://www.bestwine.online/fr/restaurants')
    expect(resto?.priority).toBe(0.9)
  })
  it('includes all 11 locales for homepage', async () => {
    const entries = await sitemap()
    const homepages = entries.filter(e => e.priority === 1.0)
    expect(homepages).toHaveLength(11)
  })
})

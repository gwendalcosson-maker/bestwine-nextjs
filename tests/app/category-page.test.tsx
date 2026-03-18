import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/queries', () => ({
  getCategories: vi.fn().mockResolvedValue([
    {
      id: 1, slug: 'whisky', parent_id: null, sort_order: 1, created_at: '',
      category_translations: [{ name: 'Whisky', meta_title: 'Whisky — Bestwine', meta_description: 'Top whiskies', locale: 'fr' }],
      children: [],
    },
    {
      id: 2, slug: 'vin-rouge', parent_id: null, sort_order: 2, created_at: '',
      category_translations: [{ name: 'Vin rouge', meta_title: null, meta_description: null, locale: 'fr' }],
      children: [],
    },
  ]),
  getCategoryBySlug: vi.fn().mockResolvedValue({
    id: 1, slug: 'whisky', parent_id: null, sort_order: 1, created_at: '',
    category_translations: [{ name: 'Whisky', meta_title: 'Whisky — Bestwine', meta_description: 'Top whiskies', locale: 'fr' }],
    children: [],
  }),
  getDrinksByCategory: vi.fn().mockResolvedValue([
    {
      id: 10, name: 'Yamazaki 18', slug: 'yamazaki-18', category_id: 1,
      producer: 'Suntory', vintage: null, country: 'Japan', region: 'Osaka', appellation: null, created_at: '',
      drink_translations: [],
    },
  ]),
}))

vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn().mockImplementation((fn: unknown) => fn),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

describe('generateStaticParams — category page', () => {
  it('returns one entry per top-level category × locale', async () => {
    const { generateStaticParams } = await import('@/app/[locale]/[category]/page')
    const params = await generateStaticParams()
    // 2 top-level categories × 11 locales = 22 entries
    expect(params).toHaveLength(22)
    expect(params[0]).toHaveProperty('locale')
    expect(params[0]).toHaveProperty('category')
  })
})

describe('generateMetadata — category page', () => {
  it('uses meta_title from category_translations when present', async () => {
    const { generateMetadata } = await import('@/app/[locale]/[category]/page')
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'fr', category: 'whisky' }),
    })
    expect(meta.title).toBe('Whisky — Bestwine')
  })

  it('falls back to generated title when meta_title is null', async () => {
    const { getCategoryBySlug } = await import('@/lib/queries')
    ;(getCategoryBySlug as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 2, slug: 'vin-rouge', parent_id: null, sort_order: 2, created_at: '',
      category_translations: [{ name: 'Vin rouge', meta_title: null, meta_description: null, locale: 'fr' }],
      children: [],
    })
    const { generateMetadata } = await import('@/app/[locale]/[category]/page')
    const meta = await generateMetadata({
      params: Promise.resolve({ locale: 'fr', category: 'vin-rouge' }),
    })
    expect(String(meta.title)).toContain('Vin rouge')
  })
})

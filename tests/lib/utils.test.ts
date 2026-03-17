import { describe, it, expect } from 'vitest'
import { isRtlLocale, getCjkLocale, slugify } from '@/lib/utils'

describe('locale helpers', () => {
  it('identifies RTL locales', () => {
    expect(isRtlLocale('ar')).toBe(true)
    expect(isRtlLocale('fr')).toBe(false)
    expect(isRtlLocale('en-us')).toBe(false)
  })

  it('identifies CJK locales', () => {
    expect(getCjkLocale('zh')).toBe('zh')
    expect(getCjkLocale('ja')).toBe('ja')
    expect(getCjkLocale('fr')).toBe(null)
  })
})

describe('slugify', () => {
  it('converts Latin text with accents', () => {
    expect(slugify('Château Pétrus')).toBe('chateau-petrus')
  })
  it('handles hyphens and spaces', () => {
    expect(slugify('Côte-de-Nuits Villages')).toBe('cote-de-nuits-villages')
  })
  it('strips leading and trailing separators', () => {
    expect(slugify('  premier cru  ')).toBe('premier-cru')
  })
  it('returns empty string for CJK-only input (expected behavior, slug must be provided externally)', () => {
    expect(slugify('山崎')).toBe('')
  })
})

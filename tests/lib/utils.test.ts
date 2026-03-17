import { describe, it, expect } from 'vitest'
import { isRtlLocale, getCjkLocale } from '@/lib/utils'

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

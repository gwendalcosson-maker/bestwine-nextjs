import { describe, it, expect } from 'vitest'
import { locales, defaultLocale } from '@/i18n'

describe('i18n config', () => {
  it('has 11 locales', () => {
    expect(locales).toHaveLength(11)
  })

  it('includes all required locales', () => {
    const required = ['fr', 'en-us', 'en-gb', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ru', 'ar']
    required.forEach(l => expect(locales).toContain(l))
  })

  it('defaults to fr', () => {
    expect(defaultLocale).toBe('fr')
  })
})

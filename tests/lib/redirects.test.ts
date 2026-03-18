import { describe, it, expect } from 'vitest'
import { resolveWordPressRedirect } from '@/lib/redirects'

describe('resolveWordPressRedirect', () => {
  it('redirects /whisky/ to /fr/whisky', () => {
    expect(resolveWordPressRedirect('/whisky/')).toBe('/fr/whisky')
    expect(resolveWordPressRedirect('/whisky')).toBe('/fr/whisky')
  })

  it('redirects /rhum/martiniquais/ to /fr/rhum/martiniquais', () => {
    expect(resolveWordPressRedirect('/rhum/martiniquais/')).toBe('/fr/rhum/martiniquais')
  })

  it('does NOT redirect already-localized paths', () => {
    expect(resolveWordPressRedirect('/fr/whisky')).toBeNull()
    expect(resolveWordPressRedirect('/en-us/whisky')).toBeNull()
    expect(resolveWordPressRedirect('/ar/whisky')).toBeNull()
  })

  it('does NOT redirect API routes', () => {
    expect(resolveWordPressRedirect('/api/revalidate')).toBeNull()
  })

  it('does NOT redirect static files', () => {
    expect(resolveWordPressRedirect('/favicon.ico')).toBeNull()
    expect(resolveWordPressRedirect('/fonts/NotoSansSC.woff2')).toBeNull()
  })

  it('does NOT redirect _next paths', () => {
    expect(resolveWordPressRedirect('/_next/static/chunk.js')).toBeNull()
  })

  it('does NOT redirect empty path', () => {
    expect(resolveWordPressRedirect('/')).toBeNull()
  })

  it('redirects unknown category-like paths to /fr/', () => {
    expect(resolveWordPressRedirect('/vin-rose')).toBe('/fr/vin-rose')
    expect(resolveWordPressRedirect('/vin-blanc/savoie')).toBe('/fr/vin-blanc/savoie')
  })
})

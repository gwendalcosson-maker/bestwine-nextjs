// tests/lib/revalidate.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache
const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: (tag: string) => mockRevalidateTag(tag),
}))

describe('revalidation logic', () => {
  beforeEach(() => {
    mockRevalidateTag.mockClear()
    process.env.REVALIDATE_SECRET = 'test-secret-123'
  })

  it('rejects requests without secret', async () => {
    const { validateRevalidateRequest } = await import('@/lib/revalidate')
    const result = validateRevalidateRequest('', 'drinks')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('secret')
  })

  it('rejects requests with wrong secret', async () => {
    const { validateRevalidateRequest } = await import('@/lib/revalidate')
    const result = validateRevalidateRequest('wrong-secret', 'drinks')
    expect(result.valid).toBe(false)
  })

  it('accepts valid request', async () => {
    const { validateRevalidateRequest } = await import('@/lib/revalidate')
    const result = validateRevalidateRequest('test-secret-123', 'drinks')
    expect(result.valid).toBe(true)
  })

  it('validates allowed tags', async () => {
    const { validateRevalidateRequest } = await import('@/lib/revalidate')
    const result = validateRevalidateRequest('test-secret-123', 'invalid-tag')
    expect(result.valid).toBe(false)
  })

  it('accepts all allowed tags', async () => {
    const { validateRevalidateRequest } = await import('@/lib/revalidate')
    const allowedTags = ['drinks', 'categories', 'restaurants', 'wine-list']
    for (const tag of allowedTags) {
      const result = validateRevalidateRequest('test-secret-123', tag)
      expect(result.valid).toBe(true)
      expect(result.tag).toBe(tag)
    }
  })
})

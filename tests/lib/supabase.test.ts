// tests/lib/supabase.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({ select: vi.fn() })),
  })),
}))

describe('Supabase client', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  it('creates anon client with public env vars', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const { supabaseAnon } = await import('@/lib/supabase')
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
    expect(supabaseAnon).toBeDefined()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the import function
vi.mock('@/lib/pdf-import', () => ({
  importWineList: vi.fn().mockResolvedValue({
    restaurant: {
      id: 1,
      slug: 'le-jules-verne',
      name: 'Le Jules Verne',
      created: true,
    },
    drinks: { inserted: 3, updated: 0, skipped: 1, errors: [] },
    categories: { created: ['vin-rouge/bordeaux'] },
    wineListEntries: 4,
  }),
}))

vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('POST /api/import', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.REVALIDATE_SECRET
  })

  it('rejects requests without auth token', async () => {
    const { POST } = await import('@/app/api/import/route')

    const request = new Request('http://localhost:3000/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant: { name: 'Test' }, drinks: [] }),
    })

    // Without REVALIDATE_SECRET env var, should return 401
    const response = await POST(request as any)
    expect(response.status).toBe(401)
  })

  it('rejects requests with missing fields', async () => {
    process.env.REVALIDATE_SECRET = 'test-secret'
    const { POST } = await import('@/app/api/import/route')

    const request = new Request('http://localhost:3000/api/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-secret',
      },
      body: JSON.stringify({ restaurant: {} }),
    })

    const response = await POST(request as any)
    expect(response.status).toBe(400)
  })
})

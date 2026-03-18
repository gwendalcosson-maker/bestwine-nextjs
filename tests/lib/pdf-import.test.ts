import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpsert = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()

const mockFrom = vi.fn(() => ({
  select: mockSelect.mockReturnValue({
    eq: mockEq.mockReturnValue({
      single: mockSingle,
    }),
    order: mockOrder.mockReturnValue({
      limit: mockLimit.mockReturnValue({
        single: mockSingle,
      }),
    }),
  }),
  insert: mockInsert.mockReturnValue({
    select: mockSelect.mockReturnValue({
      single: mockSingle,
    }),
  }),
  upsert: mockUpsert.mockReturnValue({
    select: mockSelect,
  }),
}))

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe('pdf-import', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports importWineList function', async () => {
    const { importWineList } = await import('@/lib/pdf-import')
    expect(importWineList).toBeDefined()
    expect(typeof importWineList).toBe('function')
  })

  it('exports ExtractedDrink type', async () => {
    // Type-level check — if this compiles, the type exists
    const drink: import('@/lib/pdf-import').ExtractedDrink = {
      name: 'Test Wine',
      category: 'vin-rouge',
    }
    expect(drink.name).toBe('Test Wine')
  })

  it('exports ImportResult type', async () => {
    const result: import('@/lib/pdf-import').ImportResult = {
      restaurant: { id: 1, slug: 'test', name: 'Test', created: false },
      drinks: { inserted: 0, updated: 0, skipped: 0, errors: [] },
      categories: { created: [] },
      wineListEntries: 0,
    }
    expect(result.restaurant.id).toBe(1)
  })
})

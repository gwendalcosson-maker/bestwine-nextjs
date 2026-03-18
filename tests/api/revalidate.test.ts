import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache
vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

describe('Revalidation API', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.REVALIDATE_SECRET = 'test-secret-token-that-is-long-enough'
  })

  it('rejects requests without secret', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag: 'drinks' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('rejects requests with wrong secret', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer wrong-secret',
      },
      body: JSON.stringify({ tag: 'drinks' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('rejects requests without tag or path', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-that-is-long-enough',
      },
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('accepts valid tag revalidation', async () => {
    const { updateTag } = await import('next/cache')
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-that-is-long-enough',
      },
      body: JSON.stringify({ tag: 'drinks' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(updateTag).toHaveBeenCalledWith('drinks')
  })

  it('accepts valid path revalidation', async () => {
    const { revalidatePath } = await import('next/cache')
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-that-is-long-enough',
      },
      body: JSON.stringify({ path: '/fr/whisky' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/fr/whisky')
  })

  it('rejects tag with invalid characters', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-that-is-long-enough',
      },
      body: JSON.stringify({ tag: '../../../etc/passwd' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('rejects GET requests', async () => {
    const { GET } = await import('@/app/api/revalidate/route')
    const response = await GET()
    expect(response.status).toBe(405)
  })

  it('rejects path with traversal attempt', async () => {
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-secret-token-that-is-long-enough',
      },
      body: JSON.stringify({ path: '/../../../etc/passwd' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})

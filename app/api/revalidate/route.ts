import { NextRequest, NextResponse } from 'next/server'
import { updateTag, revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'crypto'

/** Validate tag: lowercase alphanumeric + hyphens only, max 50 chars */
function isValidTag(tag: string): boolean {
  return /^[a-z0-9-]{1,50}$/.test(tag)
}

/** Validate path: must start with /, lowercase alphanumeric + hyphens + slashes, max 200 chars */
function isValidPath(path: string): boolean {
  return /^\/[a-z0-9/-]{1,200}$/.test(path)
}

/** Constant-time secret comparison to prevent timing attacks */
function verifySecret(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) {
    // Still perform a comparison to maintain constant-time behavior
    const a = Buffer.from(provided.padEnd(expected.length, '\0'))
    const b = Buffer.from(expected)
    timingSafeEqual(a, b)
    return false
  }
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify secret
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
      console.error('REVALIDATE_SECRET is not configured')
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    if (!verifySecret(token, secret)) {
      return NextResponse.json(
        { error: 'Invalid authorization' },
        { status: 401 }
      )
    }

    // 2. Parse and validate body
    let body: { tag?: string; path?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { tag, path } = body

    if (!tag && !path) {
      return NextResponse.json(
        { error: 'Either "tag" or "path" is required' },
        { status: 400 }
      )
    }

    // 3. Revalidate by tag
    if (tag) {
      if (!isValidTag(tag)) {
        return NextResponse.json(
          { error: 'Invalid tag format' },
          { status: 400 }
        )
      }
      updateTag(tag)
      return NextResponse.json({ revalidated: true, tag })
    }

    // 4. Revalidate by path
    if (path) {
      if (!isValidPath(path)) {
        return NextResponse.json(
          { error: 'Invalid path format' },
          { status: 400 }
        )
      }
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, path })
    }

    return NextResponse.json({ error: 'Unexpected state' }, { status: 500 })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only POST is allowed
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

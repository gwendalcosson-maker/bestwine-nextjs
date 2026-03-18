// lib/revalidate.ts
const ALLOWED_TAGS = ['drinks', 'categories', 'restaurants', 'wine-list'] as const
type RevalidateTag = typeof ALLOWED_TAGS[number]

interface ValidationResult {
  valid: boolean
  error?: string
  tag?: RevalidateTag
}

export function validateRevalidateRequest(
  secret: string,
  tag: string
): ValidationResult {
  const expectedSecret = process.env.REVALIDATE_SECRET

  if (!secret || secret !== expectedSecret) {
    return { valid: false, error: 'Invalid or missing secret' }
  }

  if (!ALLOWED_TAGS.includes(tag as RevalidateTag)) {
    return {
      valid: false,
      error: `Invalid tag. Allowed: ${ALLOWED_TAGS.join(', ')}`,
    }
  }

  return { valid: true, tag: tag as RevalidateTag }
}

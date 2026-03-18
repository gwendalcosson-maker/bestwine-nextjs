// lib/redirects.ts

/** Known WordPress category slugs */
const KNOWN_SLUGS = new Set([
  'whisky', 'vin-rouge', 'vin-blanc', 'champagne', 'cognac', 'rhum',
  'bourbon', 'scotch-whisky', 'jura',
  'rhum/martiniquais', 'rhum/guadeloupe', 'rhum/jamaique',
  'vin-rouge/bourgogne', 'vin-rouge/bordeaux',
  'vin-blanc/alsace', 'vin-blanc/loire',
])

/**
 * Check if a pathname is an old WordPress URL that needs redirecting.
 * Returns the new path if redirect needed, null otherwise.
 *
 * Rules:
 * - Path must NOT already have a locale prefix
 * - Path must match a known category slug
 * - Redirect to /fr/{path}
 */
export function resolveWordPressRedirect(pathname: string): string | null {
  // Skip paths that already have a locale prefix
  const localePattern = /^\/(fr|en-us|en-gb|es|de|it|pt|zh|ja|ru|ar)(\/|$)/
  if (localePattern.test(pathname)) return null

  // Skip API routes, static files, Next.js internals
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/fonts/') ||
      pathname.includes('.')) {
    return null
  }

  // Normalize: remove trailing slash, remove leading slash for matching
  const clean = pathname.replace(/\/+$/, '').replace(/^\//, '')

  if (!clean) return null

  // Check against known slugs
  if (KNOWN_SLUGS.has(clean)) {
    return `/fr/${clean}`
  }

  // Check if it looks like a category path (slug or slug/sub-slug pattern)
  // but isn't in our known set — could be a new subcategory
  if (/^[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(clean) && !clean.includes('.')) {
    // Redirect all unlocalized category-like paths to /fr/
    return `/fr/${clean}`
  }

  return null
}

// lib/seo.ts
import { locales } from '@/i18n'

const BASE_URL = 'https://www.bestwine.online'

export function generateCanonicalUrl(locale: string, path: string): string {
  return `${BASE_URL}/${locale}${path}`
}

export function generateAlternateLinks(path: string): Record<string, string> {
  const links: Record<string, string> = {}
  for (const locale of locales) {
    links[locale] = `${BASE_URL}/${locale}${path}`
  }
  links['x-default'] = `${BASE_URL}/en-us${path}`
  return links
}

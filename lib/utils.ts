export const RTL_LOCALES = ['ar'] as const
export const CJK_LOCALES = ['zh', 'ja'] as const

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale as typeof RTL_LOCALES[number])
}

export function getCjkLocale(locale: string): 'zh' | 'ja' | null {
  if (locale === 'zh') return 'zh'
  if (locale === 'ja') return 'ja'
  return null
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

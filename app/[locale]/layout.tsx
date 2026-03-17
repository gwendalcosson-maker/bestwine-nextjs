import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { playfair, inter, notoSansSC, notoSansJP, notoNaskhArabic } from '@/app/fonts'
import { locales, type Locale } from '@/i18n'
import { isRtlLocale, getCjkLocale } from '@/lib/utils'
import '@/app/globals.css'

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bestwine.online'),
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()
  const isRtl = isRtlLocale(locale)
  const cjk = getCjkLocale(locale)

  const fontClass = [
    playfair.variable,
    inter.variable,
    cjk === 'zh' ? notoSansSC.variable : '',
    cjk === 'ja' ? notoSansJP.variable : '',
    isRtl ? notoNaskhArabic.variable : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className={fontClass}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

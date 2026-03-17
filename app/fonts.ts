import { Playfair_Display, Inter } from 'next/font/google'
import localFont from 'next/font/local'

export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const notoSansSC = localFont({
  src: '../public/fonts/NotoSansSC-Regular.woff2',
  variable: '--font-noto-sc',
  display: 'swap',
  weight: '400',
})

export const notoSansJP = localFont({
  src: '../public/fonts/NotoSansJP-Regular.woff2',
  variable: '--font-noto-jp',
  display: 'swap',
  weight: '400',
})

export const notoNaskhArabic = localFont({
  src: '../public/fonts/NotoNaskhArabic-Regular.woff2',
  variable: '--font-noto-arabic',
  display: 'swap',
  weight: '400',
})

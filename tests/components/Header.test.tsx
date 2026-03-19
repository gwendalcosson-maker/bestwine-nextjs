import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      home: 'Accueil',
      categories: 'Catégories',
      restaurants: 'Restaurants',
    }
    return map[key] || key
  },
  useLocale: () => 'fr',
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/fr',
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: any) => <header data-testid="header" {...props}>{children}</header>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: (_: any, __: any, values: any[]) => values[0],
}))

import Header from '@/components/Header'

describe('Header', () => {
  it('renders the site logo/brand', () => {
    render(<Header />)
    expect(screen.getByText('BESTWINE')).toBeDefined()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Accueil')).toBeDefined()
    expect(screen.getByText('Catégories')).toBeDefined()
    expect(screen.getByText('Restaurants')).toBeDefined()
  })

  it('renders as a header element', () => {
    render(<Header />)
    expect(screen.getByTestId('header')).toBeDefined()
  })
})

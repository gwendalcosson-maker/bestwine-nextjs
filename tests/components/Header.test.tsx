import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'fr',
}))
vi.mock('next/navigation', () => ({
  usePathname: () => '/fr',
  useRouter: () => ({ push: vi.fn() }),
}))

import { Header } from '@/components/layout/Header'

describe('Header', () => {
  it('renders the site logo/brand', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeDefined()
  })
})

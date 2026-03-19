import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DrinkCard from '@/components/DrinkCard'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  useInView: () => true,
}))

vi.mock('@/components/AnimatedSection', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('DrinkCard', () => {
  const baseProps = { name: 'Yamazaki 18', locale: 'fr' }

  it('renders the drink name', () => {
    render(<DrinkCard {...baseProps} />)
    expect(screen.getByText('Yamazaki 18')).toBeInTheDocument()
  })

  it('renders producer when provided', () => {
    render(<DrinkCard {...baseProps} producer="Suntory" />)
    expect(screen.getByText('Suntory')).toBeInTheDocument()
  })

  it('renders vintage when provided', () => {
    render(<DrinkCard {...baseProps} vintage={2015} />)
    expect(screen.getByText('2015')).toBeInTheDocument()
  })

  it('renders region and appellation', () => {
    render(<DrinkCard {...baseProps} region="Speyside" appellation="Single Malt" />)
    // Origin is now combined into a single string
    expect(screen.getByText(/Speyside/)).toBeInTheDocument()
    expect(screen.getByText(/Single Malt/)).toBeInTheDocument()
  })

  it('renders a Google Shopping CTA link with correct URL', () => {
    render(<DrinkCard {...baseProps} vintage={2018} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining('google.com/search'))
    expect(link).toHaveAttribute('href', expect.stringContaining('tbm=shop'))
    expect(link).toHaveAttribute('href', expect.stringContaining('Yamazaki'))
  })

  it('Google Shopping URL includes vintage when present', () => {
    render(<DrinkCard {...baseProps} vintage={2018} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining('2018'))
  })

  it('Google Shopping URL does not include vintage when absent', () => {
    render(<DrinkCard {...baseProps} />)
    const link = screen.getByRole('link')
    const href = link.getAttribute('href') ?? ''
    expect(href).not.toMatch(/\d{4}/)
  })

  it('renders with no optional props without crashing', () => {
    const { container } = render(<DrinkCard name="Pomerol" locale="en-us" />)
    expect(container.firstChild).toBeTruthy()
  })
})

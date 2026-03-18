import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
}))

import StarRating from '@/components/StarRating'

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    const { container } = render(<StarRating count={3} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(3)
  })

  it('renders 1 star', () => {
    const { container } = render(<StarRating count={1} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(1)
  })

  it('applies custom className', () => {
    const { container } = render(<StarRating count={2} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('has accessible label', () => {
    render(<StarRating count={3} />)
    const rating = screen.getByRole('img', { name: '3 Michelin stars' })
    expect(rating).toBeInTheDocument()
  })

  it('renders non-animated version when animated=false', () => {
    const { container } = render(<StarRating count={2} animated={false} />)
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(2)
  })

  it('applies size classes', () => {
    const { container } = render(<StarRating count={1} size="lg" />)
    const star = container.querySelector('svg')
    expect(star).toHaveClass('w-6', 'h-6')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StarRating from '@/components/StarRating'

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating count={3} />)
    const stars = screen.getAllByRole('img', { hidden: true })
    expect(stars).toHaveLength(3)
  })

  it('renders 1 star by default', () => {
    render(<StarRating count={1} />)
    const stars = screen.getAllByRole('img', { hidden: true })
    expect(stars).toHaveLength(1)
  })

  it('applies custom className', () => {
    const { container } = render(<StarRating count={2} className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})

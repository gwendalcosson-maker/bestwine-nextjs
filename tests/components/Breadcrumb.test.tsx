import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Breadcrumb from '@/components/Breadcrumb'

describe('Breadcrumb', () => {
  const items = [
    { label: 'Accueil', href: '/fr' },
    { label: 'Whisky', href: '/fr/whisky' },
    { label: 'Yamazaki 18' },
  ]

  it('renders all item labels', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Whisky')).toBeInTheDocument()
    expect(screen.getByText('Yamazaki 18')).toBeInTheDocument()
  })

  it('renders links for items that have href', () => {
    render(<Breadcrumb items={items} />)
    const homeLink = screen.getByRole('link', { name: 'Accueil' })
    expect(homeLink).toHaveAttribute('href', '/fr')
    const catLink = screen.getByRole('link', { name: 'Whisky' })
    expect(catLink).toHaveAttribute('href', '/fr/whisky')
  })

  it('renders current item as plain text (no link)', () => {
    render(<Breadcrumb items={items} />)
    const current = screen.getByText('Yamazaki 18')
    expect(current.tagName).not.toBe('A')
  })

  it('has aria-label="breadcrumb" on nav', () => {
    render(<Breadcrumb items={items} />)
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
  })

  it('marks current item with aria-current="page"', () => {
    render(<Breadcrumb items={items} />)
    const current = screen.getByText('Yamazaki 18')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('embeds a JSON-LD script tag', () => {
    const { container } = render(<Breadcrumb items={items} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeTruthy()
    const json = JSON.parse(script?.textContent ?? '{}')
    expect(json['@type']).toBe('BreadcrumbList')
    expect(json.itemListElement).toHaveLength(3)
  })

  it('renders LTR separator → between items', () => {
    render(<Breadcrumb items={items} isRtl={false} />)
    const separators = screen.getAllByText('→')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('renders RTL separator ← when isRtl is true', () => {
    render(<Breadcrumb items={items} isRtl={true} />)
    const separators = screen.getAllByText('←')
    expect(separators.length).toBeGreaterThan(0)
  })
})

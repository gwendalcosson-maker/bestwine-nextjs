import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  isRtl?: boolean
}

function buildJsonLd(items: BreadcrumbItem[], baseUrl = 'https://www.bestwine.online') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  }
}

export default function Breadcrumb({ items, isRtl = false }: BreadcrumbProps) {
  const separator = isRtl ? '←' : '→'
  const jsonLd = buildJsonLd(items)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm font-inter">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex items-center gap-1.5">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="text-muted font-medium truncate max-w-[200px]"
                  >
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="text-text-main link-underline focus-wine hover:text-secondary transition-colors duration-fast"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-text-main">{item.label}</span>
                )}
                {!isLast && (
                  <span aria-hidden="true" className="text-muted select-none">
                    {separator}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

'use client'

import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: 'chevron' | 'slash'
}

export function Breadcrumb({ items, separator = 'chevron' }: BreadcrumbProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://soundprints.com${item.href}` : undefined,
    })),
  }
  
  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <nav aria-label="Breadcrumb" className="flex items-center text-sm">
        <ol className="flex items-center gap-1">
          <li>
            <a
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </a>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {separator === 'chevron' ? (
                <ChevronRight className="h-4 w-4 text-gray-300" />
              ) : (
                <span className="text-gray-300 mx-2">/</span>
              )}
              
              {item.href && index < items.length - 1 ? (
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// Breadcrumb with background
export function BreadcrumbWithBackground({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb items={items} />
      </div>
    </div>
  )
}

// Compact breadcrumb for mobile
export function BreadcrumbCompact({ items }: { items: BreadcrumbItem[] }) {
  const lastTwo = items.slice(-2)
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <a
        href={lastTwo[0]?.href || '/'}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span>{lastTwo[0]?.label || 'Back'}</span>
      </a>
    </nav>
  )
}

'use client'

import { useState } from 'react'
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  ShoppingBag,
  User,
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  Gift,
  Sparkles,
  Star,
  Percent
} from 'lucide-react'

// Mobile Navigation Drawer
export function MobileNavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const menuItems = [
    {
      label: 'Create',
      href: '/create',
      icon: Sparkles,
      featured: true
    },
    {
      label: 'Products',
      submenu: [
        { label: 'Canvas Prints', href: '/products/canvas' },
        { label: 'Metal Prints', href: '/products/metal' },
        { label: 'Framed Prints', href: '/products/framed' },
        { label: 'All Products', href: '/products' }
      ]
    },
    {
      label: 'Gallery',
      href: '/gallery',
      icon: Star
    },
    {
      label: 'Gift Cards',
      href: '/gift-cards',
      icon: Gift
    },
    {
      label: 'Sale',
      href: '/sale',
      icon: Percent,
      highlight: true
    },
    {
      label: 'Help',
      submenu: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Contact', href: '/contact' },
        { label: 'Shipping', href: '/shipping' },
        { label: 'Returns', href: '/refund-policy' }
      ]
    }
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-xl font-bold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => setExpandedSection(expandedSection === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${expandedSection === item.label ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  {expandedSection === item.label && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <a
                          key={subitem.label}
                          href={subitem.href}
                          className="block px-4 py-2 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          {subitem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${item.featured
                      ? 'bg-rose-500 text-white'
                      : item.highlight
                        ? 'text-rose-500 hover:bg-rose-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="font-medium">{item.label}</span>
                </a>
              )}
            </div>
          ))}
        </nav>

        {/* Quick Links */}
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <a href="/account" className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <User className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-600">Account</span>
            </a>
            <a href="/wishlist" className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <Heart className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-600">Wishlist</span>
            </a>
            <a href="/cart" className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <ShoppingBag className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-600">Cart</span>
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
          <div className="space-y-3 text-sm">
            <a href="tel:+15551234567" className="flex items-center gap-3 text-gray-600 hover:text-rose-500">
              <Phone className="h-4 w-4" />
              +1 (555) 123-4567
            </a>
            <a href="mailto:support@soundprints.com" className="flex items-center gap-3 text-gray-600 hover:text-rose-500">
              <Mail className="h-4 w-4" />
              support@soundprints.com
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

// Mega Menu Dropdown
export function MegaMenuDropdown() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const menus = {
    products: {
      title: 'Products',
      sections: [
        {
          title: 'Print Types',
          links: [
            { label: 'Canvas Prints', href: '/products/canvas', description: 'Gallery-wrapped canvas' },
            { label: 'Metal Prints', href: '/products/metal', description: 'HD vibrant colors' },
            { label: 'Framed Prints', href: '/products/framed', description: 'Museum-quality framing' },
            { label: 'Poster Prints', href: '/products/poster', description: 'Affordable art prints' }
          ]
        },
        {
          title: 'By Occasion',
          links: [
            { label: 'Wedding Songs', href: '/gallery/wedding' },
            { label: 'Baby First Words', href: '/gallery/baby' },
            { label: 'Anniversary', href: '/gallery/anniversary' },
            { label: 'Memorial Gifts', href: '/gallery/memorial' }
          ]
        },
        {
          title: 'Popular',
          links: [
            { label: 'Best Sellers', href: '/best-sellers', highlight: true },
            { label: 'New Arrivals', href: '/new' },
            { label: 'Gift Sets', href: '/gift-sets' },
            { label: 'Sale', href: '/sale', highlight: true }
          ]
        }
      ],
      featured: {
        title: 'Valentine&apos;s Day Sale',
        description: 'Save 25% on all prints',
        cta: 'Shop Now',
        href: '/sale'
      }
    },
    help: {
      title: 'Help & Support',
      sections: [
        {
          title: 'Customer Service',
          links: [
            { label: 'FAQ', href: '/faq' },
            { label: 'Contact Us', href: '/contact' },
            { label: 'Track Order', href: '/track-order' },
            { label: 'Returns & Exchanges', href: '/refund-policy' }
          ]
        },
        {
          title: 'Information',
          links: [
            { label: 'Shipping Info', href: '/shipping' },
            { label: 'Size Guide', href: '/size-guide' },
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'Care Instructions', href: '/care' }
          ]
        }
      ]
    }
  }

  return (
    <div className="relative">
      <nav className="flex items-center gap-6">
        {Object.entries(menus).map(([key, menu]) => (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => setActiveMenu(key)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-1 py-4 text-gray-700 hover:text-rose-500 font-medium transition-colors">
              {menu.title}
              <ChevronDown className="h-4 w-4" />
            </button>

            {activeMenu === key && (
              <div className="absolute top-full left-0 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50">
                <div className="grid grid-cols-3 gap-8">
                  {menu.sections.map((section, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
                      <ul className="space-y-3">
                        {section.links.map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              className={`block hover:text-rose-500 transition-colors ${'highlight' in link && link.highlight ? 'text-rose-500 font-medium' : 'text-gray-600'
                                }`}
                            >
                              {link.label}
                              {'description' in link && (
                                <span className="block text-xs text-gray-400">{link.description}</span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {'featured' in menu && menu.featured && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-4 text-white flex items-center justify-between">
                      <div>
                        <p className="font-bold">{menu.featured.title}</p>
                        <p className="text-rose-100 text-sm">{menu.featured.description}</p>
                      </div>
                      <a
                        href={menu.featured.href}
                        className="px-4 py-2 bg-white text-rose-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {menu.featured.cta}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

// Breadcrumb Navigation
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {item.href ? (
            <a href={item.href} className="text-gray-500 hover:text-rose-500 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Category Navigation Pills
export function CategoryNavPills({ categories, active, onChange }: {
  categories: { id: string; label: string; count?: number }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${active === cat.id
              ? 'bg-rose-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {cat.label}
          {cat.count !== undefined && (
            <span className={`ml-2 text-xs ${active === cat.id ? 'text-rose-200' : 'text-gray-400'}`}>
              ({cat.count})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Tab Navigation
export function TabNavigation({ tabs, active, onChange }: {
  tabs: { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors ${active === tab.id
                ? 'border-rose-500 text-rose-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.icon && <tab.icon className="h-5 w-5" />}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

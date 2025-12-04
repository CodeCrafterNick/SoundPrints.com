'use client'

import { useState } from 'react'
import { X, Ruler, Info, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react'

// Size Guide Modal
export function SizeGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches')

  const sizes = [
    { name: 'Small', inches: { width: 12, height: 6 }, cm: { width: 30, height: 15 }, recommended: 'Desk or shelf' },
    { name: 'Medium', inches: { width: 16, height: 8 }, cm: { width: 40, height: 20 }, recommended: 'Small wall space' },
    { name: 'Large', inches: { width: 24, height: 12 }, cm: { width: 60, height: 30 }, recommended: 'Living room' },
    { name: 'X-Large', inches: { width: 36, height: 18 }, cm: { width: 90, height: 45 }, recommended: 'Statement piece' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Ruler className="h-5 w-5 text-rose-500" />
            Size Guide
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Unit Toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setUnit('inches')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${unit === 'inches' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${unit === 'cm' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
            >
              Centimeters
            </button>
          </div>

          {/* Size Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Dimensions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Best For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sizes.map((size) => (
                  <tr key={size.name} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{size.name}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {unit === 'inches'
                        ? `${size.inches.width}" × ${size.inches.height}"`
                        : `${size.cm.width} × ${size.cm.height} cm`}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{size.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual Guide */}
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 mb-4">Visual Comparison</h4>
            <div className="relative bg-gray-50 rounded-xl p-8">
              {/* Room context */}
              <div className="flex items-end justify-center gap-4">
                {sizes.map((size, idx) => (
                  <div key={size.name} className="text-center">
                    <div
                      className="bg-rose-100 border-2 border-rose-300 rounded-lg mx-auto"
                      style={{
                        width: `${40 + idx * 20}px`,
                        height: `${20 + idx * 10}px`
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-2">{size.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-rose-50 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Measuring Tips:</p>
              <ul className="space-y-1">
                <li>• Consider the wall space where you&apos;ll hang your print</li>
                <li>• Larger prints work best for longer audio clips</li>
                <li>• Leave 6-12 inches of space above furniture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Size Selector Component
export function SizeSelector({
  sizes,
  selected,
  onSelect
}: {
  sizes: { id: string; name: string; dimensions: string; price: number }[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Select Size</label>
        <button className="text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1">
          <Ruler className="h-4 w-4" />
          Size Guide
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sizes.map((size) => (
          <button
            key={size.id}
            onClick={() => onSelect(size.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${selected === size.id
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <p className="font-semibold text-gray-900">{size.name}</p>
            <p className="text-sm text-gray-500">{size.dimensions}</p>
            <p className="text-rose-500 font-bold mt-1">${size.price}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// Product Type Comparison
export function ProductTypeComparison() {
  const products = [
    {
      name: 'Canvas',
      description: 'Gallery-wrapped canvas with solid wood frame',
      sizes: ['12×6"', '16×8"', '24×12"', '36×18"'],
      features: ['1.5" deep frame', 'Ready to hang', 'Fade-resistant UV coating'],
      priceRange: '$49-$149'
    },
    {
      name: 'Metal',
      description: 'HD metal print with vibrant colors',
      sizes: ['12×6"', '16×8"', '24×12"'],
      features: ['Ultra-vivid colors', 'Waterproof', 'Float mount included'],
      priceRange: '$79-$199'
    },
    {
      name: 'Framed',
      description: 'Museum-quality framed print',
      sizes: ['16×8"', '24×12"', '36×18"'],
      features: ['Premium wood frame', 'Archival paper', 'UV-protective glass'],
      priceRange: '$99-$249'
    }
  ]

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Choose Your Print Type</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.name} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
              {/* Preview placeholder */}
              <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-gray-400 font-medium">{product.name} Preview</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Available Sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span key={size} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="font-bold text-rose-500">{product.priceRange}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Zoom Controls (for size preview)
export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset
}: {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
      <button
        onClick={onZoomOut}
        disabled={zoom <= 0.5}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <ZoomOut className="h-5 w-5 text-gray-600" />
      </button>
      <button
        onClick={onReset}
        className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        disabled={zoom >= 2}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <ZoomIn className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  )
}

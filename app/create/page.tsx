'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { FullEditor } from '@/components/customizer/full-editor'
import { type WaveformEditorHandle } from '@/components/customizer/waveform-editor'
import { type ProductMockupRef } from '@/components/products/product-mockup'
import { CartDialog } from '@/components/cart/cart-dialog'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts'
import { ChevronLeft } from 'lucide-react'
import { 
  PRINTIFY_PRODUCTS, 
  type PrintifyProduct,
  type ProductSize 
} from '@/lib/printify-product-catalog'

export default function CreatePage() {
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<PrintifyProduct>(PRINTIFY_PRODUCTS[0])
  const [selectedSize, setSelectedSize] = useState<ProductSize>(PRINTIFY_PRODUCTS[0].sizes[2]) // Default 18x24
  const [selectedWallArtSize, setSelectedWallArtSize] = useState({ width: 18, height: 24 })
  const [selectedFrameColor, setSelectedFrameColor] = useState<'black' | 'white' | 'walnut'>('black')

  // Refs
  const mockupRef = useRef<ProductMockupRef>(null)
  const waveformEditorRef = useRef<WaveformEditorHandle>(null)

  // Enable keyboard shortcuts
  useKeyboardShortcuts({ enabled: true })

  // Sync wall art size when size changes
  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size)
    setSelectedWallArtSize({ width: size.width, height: size.height })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 bg-dot-pattern">
      {/* Header - Simplified */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="w-full px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <Link href="/" className="shrink-0">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            
            {/* Title */}
            <h1 className="text-lg font-semibold text-gray-900">Create Your SoundPrint</h1>
            
            {/* Cart */}
            <div className="shrink-0">
              <CartDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Editor Only */}
      <main className="flex-1 w-full">
        <ErrorBoundary>
          <FullEditor
            mockupRef={mockupRef}
            waveformEditorRef={waveformEditorRef}
            selectedWallArtSize={selectedWallArtSize}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedSize={selectedSize}
            setSelectedSize={handleSizeChange}
            setSelectedWallArtSize={setSelectedWallArtSize}
            selectedFrameColor={selectedFrameColor}
            setSelectedFrameColor={setSelectedFrameColor}
          />
        </ErrorBoundary>
      </main>
    </div>
  )
}

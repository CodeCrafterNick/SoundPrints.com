'use client'

import { useState, useRef } from 'react'
import { 
  ChevronLeft, ChevronRight, ZoomIn, Heart, Share2, Truck, Shield, 
  RotateCcw, Star, Check, Minus, Plus, ShoppingCart
} from 'lucide-react'

interface ProductImage {
  id: string
  src: string
  alt: string
}

const mockImages: ProductImage[] = [
  { id: '1', src: '/products/canvas-1.jpg', alt: 'Canvas Print - Front View' },
  { id: '2', src: '/products/canvas-2.jpg', alt: 'Canvas Print - Angle View' },
  { id: '3', src: '/products/canvas-3.jpg', alt: 'Canvas Print - Detail' },
  { id: '4', src: '/products/canvas-4.jpg', alt: 'Canvas Print - In Room' },
  { id: '5', src: '/products/canvas-5.jpg', alt: 'Canvas Print - Close Up' }
]

export function ProductImageGallery() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % mockImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + mockImages.length) % mockImages.length)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        ref={imageRef}
        className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <div
          className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center transition-transform duration-200"
          style={{
            transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          }}
        >
          <span className="text-rose-300 text-lg">Product Image {selectedImage + 1}</span>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 p-2 bg-white/90 rounded-full">
          <ZoomIn className="h-5 w-5 text-gray-600" />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
          {selectedImage + 1} / {mockImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {mockImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
              selectedImage === index
                ? 'border-rose-500'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
              <span className="text-xs text-rose-200">{index + 1}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ProductInfoPanel() {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('24x36')
  const [isWishlisted, setIsWishlisted] = useState(false)

  const sizes = [
    { id: '12x16', label: '12" x 16"', price: 49.99 },
    { id: '18x24', label: '18" x 24"', price: 69.99 },
    { id: '24x36', label: '24" x 36"', price: 89.99 },
    { id: '30x40', label: '30" x 40"', price: 119.99 }
  ]

  const selectedSizeData = sizes.find(s => s.id === selectedSize)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <span className="hover:text-rose-500 cursor-pointer">Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-rose-500 cursor-pointer">Wall Art</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Premium Canvas</span>
      </nav>

      {/* Title & Rating */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Premium Canvas Print
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-gray-600">4.9 (2,547 reviews)</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-gray-900">
          ${selectedSizeData?.price.toFixed(2)}
        </span>
        <span className="text-lg text-gray-400 line-through">
          ${(selectedSizeData?.price ? selectedSizeData.price * 1.2 : 0).toFixed(2)}
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
          Save 20%
        </span>
      </div>

      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Size
        </label>
        <div className="grid grid-cols-2 gap-3">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedSize === size.id
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-rose-300'
              }`}
            >
              <span className="font-medium text-gray-900">{size.label}</span>
              <span className="block text-sm text-gray-500">${size.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Quantity
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-100 transition-colors"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-100 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <span className="text-sm text-gray-500">Only 12 left in stock</span>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`p-4 rounded-xl border-2 transition-all ${
            isWishlisted
              ? 'border-rose-500 bg-rose-50 text-rose-500'
              : 'border-gray-200 text-gray-600 hover:border-rose-300'
          }`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
        <button className="p-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-rose-300 transition-all">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <Truck className="h-6 w-6 mx-auto text-gray-400 mb-2" />
          <span className="text-xs text-gray-600">Free Shipping</span>
        </div>
        <div className="text-center">
          <Shield className="h-6 w-6 mx-auto text-gray-400 mb-2" />
          <span className="text-xs text-gray-600">Secure Payment</span>
        </div>
        <div className="text-center">
          <RotateCcw className="h-6 w-6 mx-auto text-gray-400 mb-2" />
          <span className="text-xs text-gray-600">30-Day Returns</span>
        </div>
      </div>
    </div>
  )
}

export function ProductFeatures() {
  const features = [
    'Museum-quality archival canvas',
    'Fade-resistant for 100+ years',
    'Ready to hang with included hardware',
    'Gallery-wrapped edges',
    'Handcrafted in the USA'
  ]

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Product Features</h3>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProductTabs() {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specs', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'reviews', label: 'Reviews (2,547)' }
  ]

  return (
    <div className="border-t border-gray-200 pt-8">
      {/* Tab Headers */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-rose-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <p>
              Transform your favorite sound—a song, voice recording, or heartbeat—into stunning wall art 
              with our Premium Canvas Print. Each piece is custom-created using your unique audio, 
              resulting in a one-of-a-kind visualization that captures a meaningful moment in time.
            </p>
            <p>
              Our canvas prints are produced using museum-quality archival materials that resist fading 
              for over 100 years. The gallery-wrapped design means the image continues around the edges 
              for a polished, frameless look that&apos;s ready to hang right out of the box.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Material', 'Premium cotton canvas'],
              ['Finish', 'Matte'],
              ['Frame', 'Gallery wrapped'],
              ['Depth', '1.5 inches'],
              ['Hanging', 'Wire hanger included'],
              ['Origin', 'Made in USA']
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Truck className="h-6 w-6 text-gray-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Standard Shipping</h4>
                <p className="text-sm text-gray-600">5-7 business days • Free on orders over $50</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Truck className="h-6 w-6 text-rose-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">Express Shipping</h4>
                <p className="text-sm text-gray-600">2-3 business days • $12.99</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-8">
            <p className="text-gray-500">Reviews section would load here</p>
          </div>
        )}
      </div>
    </div>
  )
}

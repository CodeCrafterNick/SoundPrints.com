'use client'

import { X, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className={`relative bg-white rounded-2xl shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-auto`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Close button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {/* Content */}
        <div className={title ? 'p-6' : 'p-6 pt-12'}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          onClick={() => { onConfirm(); onClose(); }}
          className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-rose-500 hover:bg-rose-600'}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

// Size Guide Modal
const sizes = [
  { name: '8×10"', dimensions: '8" × 10"', cm: '20cm × 25cm', recommended: 'Desk or shelf display' },
  { name: '11×14"', dimensions: '11" × 14"', cm: '28cm × 36cm', recommended: 'Small wall or gallery wall' },
  { name: '16×20"', dimensions: '16" × 20"', cm: '41cm × 51cm', recommended: 'Medium wall space' },
  { name: '18×24"', dimensions: '18" × 24"', cm: '46cm × 61cm', recommended: 'Statement piece' },
  { name: '24×36"', dimensions: '24" × 36"', cm: '61cm × 91cm', recommended: 'Large wall or above sofa' },
]

export function SizeGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState('16×20"')
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Size Guide" size="lg">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Visual comparison */}
        <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
          <div className="relative w-full aspect-[4/3] max-w-xs">
            {/* Wall outline */}
            <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg" />
            
            {/* Size visualization */}
            {sizes.map((size) => {
              const scale = {
                '8×10"': 0.3,
                '11×14"': 0.4,
                '16×20"': 0.55,
                '18×24"': 0.65,
                '24×36"': 0.85,
              }[size.name] || 0.5
              
              return (
                <div
                  key={size.name}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                    selectedSize === size.name ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className="bg-gray-900 rounded-lg flex items-center justify-center"
                    style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
                  >
                    <svg viewBox="0 0 60 30" className="w-3/4 h-1/3">
                      <defs>
                        <linearGradient id="size-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                      </defs>
                      {Array.from({ length: 30 }).map((_, i) => {
                        const height = 3 + Math.sin(i * 0.3) * 10
                        return (
                          <rect
                            key={i}
                            x={i * 2}
                            y={15 - height / 2}
                            width="1.5"
                            height={height}
                            rx="0.75"
                            fill="url(#size-grad)"
                          />
                        )
                      })}
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Size options */}
        <div>
          <p className="text-gray-600 mb-4">
            Choose the perfect size for your space. All prints are made to order on premium materials.
          </p>
          
          <div className="space-y-2">
            {sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => setSelectedSize(size.name)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedSize === size.name
                    ? 'bg-rose-50 border-2 border-rose-300'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">{size.name}</span>
                    <span className="text-gray-400 text-sm ml-2">({size.cm})</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{size.recommended}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Quick View Modal
interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product?: {
    title: string
    price: number
    colors: string[]
  }
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  if (!product) return null
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center">
          <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
            <defs>
              <linearGradient id="qv-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={product.colors[0]} />
                <stop offset="100%" stopColor={product.colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 50 }).map((_, i) => {
              const height = 5 + Math.sin(i * 0.2) * 18
              return (
                <rect
                  key={i}
                  x={i * 2}
                  y={25 - height / 2}
                  width="1.5"
                  height={height}
                  rx="0.75"
                  fill="url(#qv-grad)"
                />
              )
            })}
          </svg>
        </div>
        
        {/* Content */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
          <p className="text-3xl font-bold text-rose-500 mb-6">${product.price}</p>
          
          <p className="text-gray-600 mb-6">
            Transform your favorite sound into stunning visual art. Each print is custom-made 
            using premium materials and archival inks.
          </p>
          
          <div className="space-y-4">
            <Button className="w-full bg-rose-500 hover:bg-rose-600">
              Add to Cart
            </Button>
            <Button variant="outline" className="w-full">
              View Full Details
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

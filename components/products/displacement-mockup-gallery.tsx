'use client'

import { useState, useCallback } from 'react'
import { DisplacementMockup } from './displacement-mockup'

interface MockupVariant {
  templateId: string
  label: string
  angle?: string
  color?: string
}

interface DisplacementMockupGalleryProps {
  variants: MockupVariant[]
  designFile?: File
  designUrl?: string
  config?: {
    intensity?: number
    brightness?: number
    blendMode?: 'multiply' | 'overlay' | 'normal'
  }
  className?: string
  defaultVariantIndex?: number
  quality?: 'low' | 'medium' | 'high'
  enableLazyLoading?: boolean
}

/**
 * Optimized gallery component for displaying multiple mockup variants
 * Features: Lazy loading, variant switching, batch generation
 */
export function DisplacementMockupGallery({
  variants,
  designFile,
  designUrl,
  config,
  className = '',
  defaultVariantIndex = 0,
  quality = 'medium',
  enableLazyLoading = true
}: DisplacementMockupGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(defaultVariantIndex)
  const [generatedVariants, setGeneratedVariants] = useState<Set<number>>(new Set([defaultVariantIndex]))
  const [stats, setStats] = useState<Record<number, { time: number; cached: boolean }>>({})

  const selectedVariant = variants[selectedIndex]

  const handleVariantChange = useCallback((index: number) => {
    setSelectedIndex(index)
    
    // Mark as generated when selected (for lazy loading)
    if (enableLazyLoading) {
      setGeneratedVariants(prev => new Set([...prev, index]))
    }
  }, [enableLazyLoading])

  const handleGenerationComplete = useCallback((index: number) => (url: string, time: number) => {
    setStats(prev => ({
      ...prev,
      [index]: { time, cached: time < 100 }
    }))
  }, [])

  // Generate all variants (disable lazy loading temporarily)
  const generateAll = useCallback(() => {
    setGeneratedVariants(new Set(variants.map((_, i) => i)))
  }, [variants])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main preview */}
      <div className="relative">
        <DisplacementMockup
          templateId={selectedVariant.templateId}
          designFile={designFile}
          designUrl={designUrl}
          config={config}
          className="w-full aspect-[4/5] md:aspect-[3/4]"
          autoGenerate={!enableLazyLoading || generatedVariants.has(selectedIndex)}
          onGenerationComplete={handleGenerationComplete(selectedIndex)}
          showStats={true}
          quality={quality}
        />
      </div>

      {/* Variant selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {selectedVariant.label}
          </h3>
          {enableLazyLoading && generatedVariants.size < variants.length && (
            <button
              onClick={generateAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Generate All ({variants.length - generatedVariants.size} remaining)
            </button>
          )}
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {variants.map((variant, index) => {
            const isSelected = index === selectedIndex
            const isGenerated = generatedVariants.has(index)
            const variantStats = stats[index]

            return (
              <button
                key={variant.templateId}
                onClick={() => handleVariantChange(index)}
                className={`
                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-200 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {isGenerated ? (
                  <DisplacementMockup
                    templateId={variant.templateId}
                    designFile={designFile}
                    designUrl={designUrl}
                    config={config}
                    className="w-full h-full"
                    autoGenerate={false}
                    quality="low"
                    showStats={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Variant label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <p className="text-white text-[10px] font-medium truncate">
                    {variant.angle || variant.color || `View ${index + 1}`}
                  </p>
                </div>

                {/* Cached indicator */}
                {variantStats?.cached && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" title="Cached"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Performance stats */}
        {Object.keys(stats).length > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <span>
              Generated: {Object.keys(stats).length}/{variants.length}
            </span>
            <span>
              Avg time: {Math.round(
                Object.values(stats).reduce((sum, s) => sum + s.time, 0) / Object.keys(stats).length
              )}ms
            </span>
            <span>
              Cached: {Object.values(stats).filter(s => s.cached).length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

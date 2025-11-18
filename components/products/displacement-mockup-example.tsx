/**
 * Example: Optimized Product Preview with Displacement Mockups
 * 
 * This shows how to integrate the optimized displacement mockup system
 * into your product customizer/preview page.
 */

'use client'

import { useState } from 'react'
import { DisplacementMockup } from '@/components/products/displacement-mockup'
import { DisplacementMockupGallery } from '@/components/products/displacement-mockup-gallery'

export default function ProductPreviewExample() {
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')

  // Example variants for a t-shirt product
  const tshirtVariants = [
    { templateId: 'bella-canvas-3001-white-front', label: 'White - Front', color: 'white', angle: 'front' },
    { templateId: 'bella-canvas-3001-white-back', label: 'White - Back', color: 'white', angle: 'back' },
    { templateId: 'bella-canvas-3001-black-front', label: 'Black - Front', color: 'black', angle: 'front' },
    { templateId: 'bella-canvas-3001-black-back', label: 'Black - Back', color: 'black', angle: 'back' },
    { templateId: 'bella-canvas-3001-navy-front', label: 'Navy - Front', color: 'navy', angle: 'front' },
    { templateId: 'bella-canvas-3001-red-front', label: 'Red - Front', color: 'red', angle: 'front' },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesignFile(file)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Product Preview Example</h1>
        
        {/* File upload */}
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          
          {/* Quality selector */}
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low Quality (Fast)</option>
            <option value="medium">Medium Quality</option>
            <option value="high">High Quality (Slow)</option>
          </select>
        </div>
      </div>

      {designFile ? (
        <>
          {/* Example 1: Single mockup with all features */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Single Mockup Preview</h2>
            <p className="text-gray-600">
              Full-featured mockup with progress bar, stats, and error handling
            </p>
            
            <DisplacementMockup
              templateId="bella-canvas-3001-white-front"
              designFile={designFile}
              config={{
                intensity: 8,
                brightness: 0.92,
                blendMode: 'multiply'
              }}
              className="w-full max-w-2xl aspect-[4/5]"
              quality={quality}
              showStats={true}
              autoGenerate={true}
              onGenerationComplete={(url, time) => {
                console.log('✅ Mockup generated in', time, 'ms')
              }}
              onError={(error) => {
                console.error('❌ Generation failed:', error)
              }}
            />
          </section>

          {/* Example 2: Gallery with lazy loading */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Gallery View (Lazy Loading)</h2>
            <p className="text-gray-600">
              Only generates the selected variant, click thumbnails to switch
            </p>
            
            <DisplacementMockupGallery
              variants={tshirtVariants}
              designFile={designFile}
              config={{
                intensity: 8,
                brightness: 0.92,
                blendMode: 'multiply'
              }}
              quality={quality}
              enableLazyLoading={true}
              defaultVariantIndex={0}
              className="w-full max-w-4xl"
            />
          </section>

          {/* Example 3: Side-by-side comparison */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Side-by-Side Comparison</h2>
            <p className="text-gray-600">
              Compare different colors or angles simultaneously
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">White T-Shirt</h3>
                <DisplacementMockup
                  templateId="bella-canvas-3001-white-front"
                  designFile={designFile}
                  className="w-full aspect-square"
                  quality="medium"
                  showStats={true}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Black T-Shirt</h3>
                <DisplacementMockup
                  templateId="bella-canvas-3001-black-front"
                  designFile={designFile}
                  className="w-full aspect-square"
                  quality="medium"
                  showStats={true}
                />
              </div>
            </div>
          </section>

          {/* Performance Tips */}
          <section className="bg-blue-50 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-blue-900">💡 Performance Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Use <code className="bg-blue-100 px-1 rounded">quality="low"</code> for thumbnails (WebP 70%)</li>
              <li>✓ Use <code className="bg-blue-100 px-1 rounded">quality="medium"</code> for preview (WebP 85%)</li>
              <li>✓ Use <code className="bg-blue-100 px-1 rounded">quality="high"</code> for final/download (PNG 95%)</li>
              <li>✓ Enable lazy loading in galleries to save bandwidth</li>
              <li>✓ Cache is automatic - repeated generations are instant</li>
              <li>✓ Progress bar shows real-time generation status</li>
            </ul>
          </section>
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p>Upload a design file to see mockup previews</p>
        </div>
      )}
    </div>
  )
}

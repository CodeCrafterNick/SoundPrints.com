'use client'

import { useEffect, useRef, useState } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import Image from 'next/image'
import { type ProductMockupRef } from './product-mockup'
import { PerspectiveTransformTest } from './perspective-transform-test'

interface ProductMockupDisplayProps {
  mockupRef?: React.RefObject<ProductMockupRef | null>
}

/**
 * Displays the waveform artwork overlaid on the selected product mockup
 * Handles positioning and sizing for different product types
 */
export function ProductMockupDisplay({ mockupRef }: ProductMockupDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [artworkDataUrl, setArtworkDataUrl] = useState<string | null>(null)
  const [usePerspectiveTest, setUsePerspectiveTest] = useState(false)
  const [serverRenderedMockup, setServerRenderedMockup] = useState<string | null>(null)
  const [printifyMockups, setPrintifyMockups] = useState<Array<{
    src: string
    variantIds: number[]
    position: string
    isDefault: boolean
    isPrintProvider: boolean
  }>>([])
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [useServerSide, setUseServerSide] = useState(false)
  const [usePrintify, setUsePrintify] = useState(false)
  const [printifyProductIds, setPrintifyProductIds] = useState<string[]>([]) // Track products for cleanup
  const [useTemplateMode, setUseTemplateMode] = useState(false) // Enable template-based mask rendering
  
  // Printify product mappings: blueprint_id and variant_id
  // Blueprint 12 = Bella+Canvas 3001 Unisex Jersey Short Sleeve Tee
  // Print Provider 39 = SwiftPOD
  const printifyProducts: Record<string, { blueprintId: number; variantId: number; printProviderId: number }> = {
    't-shirt': { blueprintId: 12, variantId: 18100, printProviderId: 39 }, // Black / S
    't-shirt-white': { blueprintId: 12, variantId: 18540, printProviderId: 39 }, // White / S
    't-shirt-white-model': { blueprintId: 12, variantId: 18540, printProviderId: 39 }, // White / S (model photo)
    't-shirt-black': { blueprintId: 12, variantId: 18100, printProviderId: 39 }, // Black / S
    't-shirt-blue': { blueprintId: 12, variantId: 18396, printProviderId: 39 }, // Navy / S
    'mug': { blueprintId: 535, variantId: 10031, printProviderId: 27 }, // 11oz White Mug
    'travel-mug': { blueprintId: 1513, variantId: 61486, printProviderId: 111 }, // 20oz Travel Mug
    'hoodie': { blueprintId: 536, variantId: 22206, printProviderId: 27 }, // Hanes Pullover Hoodie
    'poster': { blueprintId: 554, variantId: 22206, printProviderId: 27 }, // Paper Poster
    'canvas': { blueprintId: 555, variantId: 22220, printProviderId: 27 }, // Stretched Canvas
  }
  
  const {
    selectedProduct,
    waveformColor,
    waveformSize,
    waveformStyle,
    waveformUseGradient,
    waveformGradientStops,
    waveformGradientDirection,
    backgroundColor,
    backgroundUseGradient,
    backgroundGradientStops,
    backgroundGradientDirection,
    backgroundImage,
    selectedRegion,
    showText,
    customText,
    textX,
    textY,
    fontSize,
    fontFamily,
    _hasHydrated,
  } = useCustomizerStore()

  // Wait for hydration before rendering to avoid flash of wrong product
  if (!_hasHydrated) {
    return (
      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Capture artwork from the ProductMockup canvas
  useEffect(() => {
    const captureArtwork = () => {
      if (mockupRef?.current?.canvas) {
        try {
          const dataUrl = mockupRef.current.canvas.toDataURL('image/png')
          setArtworkDataUrl(dataUrl)
        } catch (error) {
          console.error('Error capturing artwork:', error)
        }
      }
    }

    // Capture with slight delay to ensure canvas is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(captureArtwork)
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [
    mockupRef,
    selectedProduct,
    waveformColor,
    waveformSize,
    waveformStyle,
    waveformUseGradient,
    waveformGradientStops,
    waveformGradientDirection,
    backgroundColor,
    backgroundUseGradient,
    backgroundGradientStops,
    backgroundGradientDirection,
    backgroundImage,
    selectedRegion,
    showText,
    customText,
    textX,
    textY,
    fontSize,
    fontFamily,
  ])

  // Get product-specific mockup configuration with Printify-style transforms
  const getProductConfig = () => {
    const configs: Record<string, {
      mockupImage: string
      artworkPosition: { x: number; y: number; width: number; height: number }
      backgroundColor?: string
      blendMode?: GlobalCompositeOperation
      brightness?: number
      skewY?: number
      skewX?: number
      perspective?: boolean
      perspectiveTransform?: number[]
    }> = {
      't-shirt': {
        mockupImage: '/mockups/mannequin-black.png',
        artworkPosition: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        backgroundColor: '#f5f5f5',
        blendMode: 'multiply', // Fabric realism
        brightness: 0.92, // Fabric absorption
        perspective: true
      },
      't-shirt-black': {
        mockupImage: '/mockups/mannequin-black.png',
        artworkPosition: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        backgroundColor: '#f5f5f5',
        blendMode: 'multiply', // Fabric realism
        brightness: 0.92, // Fabric absorption
        perspective: true
      },
      't-shirt-white': {
        mockupImage: '/mockups/mannequin-white-tilted.png',
        artworkPosition: { x: 0.28, y: 0.30, width: 0.38, height: 0.24 },
        backgroundColor: '#f5f5f5',
        blendMode: 'multiply',
        brightness: 0.94, // Less absorption on white
        skewX: -0.15, // Horizontal perspective
        skewY: 0.02, // Vertical curve
        perspective: true
      },
      't-shirt-white-model': {
        mockupImage: '/mockups/mannequin-white-model.jpg',
        artworkPosition: { x: 0.30, y: 0.35, width: 0.40, height: 0.30 },
        backgroundColor: '#f5f5f5',
        blendMode: 'multiply',
        brightness: 0.94,
        perspective: true
      },
      't-shirt-blue': {
        mockupImage: '/mockups/mannequin-blue.png',
        artworkPosition: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        backgroundColor: '#f5f5f5',
        blendMode: 'multiply',
        brightness: 0.92,
        perspective: true
      },
      'hoodie': {
        mockupImage: '/mockups/mannequin-black.png', // Placeholder
        artworkPosition: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        backgroundColor: '#f5f5f5',
        blendMode: 'multiply',
        brightness: 0.90, // More absorption on hoodie fabric
        perspective: true
      },
      'mug': {
        mockupImage: '/mockups/mannequin-black.png', // Placeholder
        artworkPosition: { x: 0.25, y: 0.3, width: 0.5, height: 0.4 },
        backgroundColor: '#ffffff',
        blendMode: 'source-over', // Normal blend for ceramic
        brightness: 1.0,
        perspective: false
      },
      'travel-mug': {
        mockupImage: '/mockups/mannequin-black.png', // Placeholder
        artworkPosition: { x: 0.25, y: 0.3, width: 0.5, height: 0.4 },
        backgroundColor: '#ffffff',
        blendMode: 'source-over',
        brightness: 1.0,
        perspective: false
      },
      'poster': {
        mockupImage: '', // No mockup for wall art, use direct canvas
        artworkPosition: { x: 0, y: 0, width: 1, height: 1 },
      },
      'canvas': {
        mockupImage: '', // No mockup for wall art, use direct canvas
        artworkPosition: { x: 0, y: 0, width: 1, height: 1 },
      },
    }

    return configs[selectedProduct] || configs['t-shirt-white-model']
  }

  const config = getProductConfig()

  // Generate server-side mockup when artwork changes
  useEffect(() => {
    if (!artworkDataUrl || !config.mockupImage) return
    if (!useServerSide && !usePrintify && !useTemplateMode) return

    const generateServerMockup = async () => {
      setIsGenerating(true)
      try {
        if (useTemplateMode) {
          // Use template-based mask rendering
          const response = await fetch(artworkDataUrl)
          const blob = await response.blob()
          
          const formData = new FormData()
          formData.append('design', blob, 'design.png')
          formData.append('templateId', 'bella-canvas-3001-natural-front')
          formData.append('mode', 'mask')
          formData.append('brightness', '0.92')
          formData.append('contrast', '1.05')
          formData.append('saturation', '1.0')
          formData.append('textureOverlay', 'true')
          formData.append('textureOpacity', '0.15')
          formData.append('format', 'png')
          formData.append('quality', '90')
          
          const mockupResponse = await fetch('/api/generate-mockup', {
            method: 'POST',
            body: formData
          })
          
          if (mockupResponse.ok) {
            const blob = await mockupResponse.blob()
            const url = URL.createObjectURL(blob)
            setServerRenderedMockup(url)
          } else {
            console.error('Template mockup generation failed:', await mockupResponse.text())
          }
        } else if (usePrintify) {
          // Use Printify API
          // First upload artwork to a public URL (Supabase storage)
          const uploadResponse = await fetch('/api/upload-artwork', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artworkDataUrl })
          })
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload artwork')
          }
          
          const { artworkUrl } = await uploadResponse.json()
          
          // Generate Printify mockup
          const productMapping = printifyProducts[selectedProduct]
          if (!productMapping) {
            console.error('No Printify mapping for product:', selectedProduct)
            return
          }
          
          const mockupResponse = await fetch('/api/printify-mockup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              artworkUrl,
              blueprintId: productMapping.blueprintId,
              variantId: productMapping.variantId,
              printProviderId: productMapping.printProviderId
            })
          })
          
          if (mockupResponse.ok) {
            const { mockupUrl, mockupImages, productId } = await mockupResponse.json()
            setServerRenderedMockup(mockupUrl) // Default first image
            setPrintifyMockups(mockupImages || [])
            setSelectedMockupIndex(0)
            
            // Store product ID for later cleanup
            if (productId) {
              setPrintifyProductIds(prev => [...prev, productId])
            }
            
            console.log('Received mockup images:', mockupImages?.length || 0)
            console.log('Printify product ID stored:', productId)
          } else {
            console.error('Printify mockup failed:', await mockupResponse.text())
          }
        } else {
          // Use Sharp server-side generation
          const response = await fetch('/api/generate-mockup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              artworkDataUrl,
              productType: selectedProduct
            })
          })

          if (response.ok) {
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            setServerRenderedMockup(url)
          } else {
            console.error('Server mockup generation failed:', await response.text())
          }
        }
      } catch (error) {
        console.error('Error generating server mockup:', error)
      } finally {
        setIsGenerating(false)
      }
    }

    generateServerMockup()
  }, [useServerSide, usePrintify, useTemplateMode, artworkDataUrl, selectedProduct, config.mockupImage])

  // Cleanup Printify products when component unmounts (end of session)
  useEffect(() => {
    return () => {
      if (printifyProductIds.length > 0) {
        console.log('Cleaning up Printify products:', printifyProductIds)
        
        // Delete all products in the background
        printifyProductIds.forEach(async (productId) => {
          try {
            await fetch('/api/printify-cleanup', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId })
            })
          } catch (error) {
            console.error('Failed to cleanup product:', productId, error)
          }
        })
      }
    }
  }, [printifyProductIds])

  // Composite the artwork onto the product mockup with Printify-style rendering
  useEffect(() => {
    if (!canvasRef.current || !artworkDataUrl) return
    if (!config.mockupImage) return // Skip for wall art

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const mockupImg = new window.Image()
    mockupImg.crossOrigin = 'anonymous'
    
    mockupImg.onload = () => {
      // Set canvas size to match mockup image's natural dimensions
      canvas.width = mockupImg.naturalWidth
      canvas.height = mockupImg.naturalHeight
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw background
      if (config.backgroundColor) {
        ctx.fillStyle = config.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      // Draw product mockup (base layer) at its natural size
      ctx.drawImage(mockupImg, 0, 0)
      
      // Draw artwork overlay with Printify-style transforms
      const artworkImg = new window.Image()
      artworkImg.onload = () => {
        const artX = canvas.width * config.artworkPosition.x
        const artY = canvas.height * config.artworkPosition.y
        const artW = canvas.width * config.artworkPosition.width
        const artH = canvas.height * config.artworkPosition.height
        
        // Save context state
        ctx.save()
        
        // Apply perspective transform for angled mockups
        if ((config.skewX || config.skewY) && (config.skewX !== 0 || config.skewY !== 0)) {
          const centerX = artX + artW / 2
          const centerY = artY + artH / 2
          
          ctx.translate(centerX, centerY)
          
          // Apply combined skew matrix for perspective
          // [1, skewY, skewX, 1, 0, 0]
          ctx.transform(
            1, 
            config.skewY || 0, 
            config.skewX || 0, 
            1, 
            0, 
            0
          )
          
          ctx.translate(-centerX, -centerY)
        }
        
        // Apply blend mode for fabric realism
        if (config.blendMode) {
          ctx.globalCompositeOperation = config.blendMode
        }
        
        // Apply brightness filter for fabric absorption
        if (config.brightness && config.brightness !== 1.0) {
          ctx.filter = `brightness(${config.brightness})`
        }
        
        // Apply subtle shadow for depth (only for fabric products)
        if (config.perspective) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 3
        }
        
        // Draw the artwork with all transforms applied
        ctx.drawImage(artworkImg, artX, artY, artW, artH)
        
        // Restore context state
        ctx.restore()
        
        // Optional: Add highlight overlay layer for fabric shine (advanced)
        if (config.perspective && config.blendMode === 'multiply') {
          ctx.save()
          ctx.globalCompositeOperation = 'overlay'
          ctx.globalAlpha = 0.08
          
          // Create subtle highlight gradient
          const highlightGradient = ctx.createLinearGradient(
            artX, artY, 
            artX + artW, artY + artH
          )
          highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
          highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
          highlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)')
          
          ctx.fillStyle = highlightGradient
          ctx.fillRect(artX, artY, artW, artH)
          
          ctx.restore()
        }
      }
      artworkImg.src = artworkDataUrl
    }
    
    mockupImg.onerror = (error) => {
      console.error('Error loading mockup image:', error)
    }
    
    mockupImg.src = config.mockupImage
  }, [artworkDataUrl, config, selectedProduct])

  // For wall art products, just show the artwork directly
  if (!config.mockupImage && artworkDataUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Image
          src={artworkDataUrl}
          alt="Your design"
          width={800}
          height={800}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>
    )
  }

  // Enable perspective test mode for tilted mockups
  if (usePerspectiveTest && artworkDataUrl && config.mockupImage) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <button
          onClick={() => setUsePerspectiveTest(false)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ← Back to Standard View
        </button>
        <PerspectiveTransformTest
          artworkDataUrl={artworkDataUrl}
          mockupImageUrl={config.mockupImage}
          printArea={config.artworkPosition}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {config.mockupImage && (
        <div className="flex gap-2 flex-wrap">
          {config.skewX || config.skewY ? (
            <button
              onClick={() => setUsePerspectiveTest(true)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
            >
              🔬 Test Techniques
            </button>
          ) : null}
          <button
            onClick={() => {
              setUseServerSide(!useServerSide)
              setUsePrintify(false)
              setUseTemplateMode(false)
            }}
            className={`px-4 py-2 rounded text-sm ${useServerSide ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            {useServerSide ? '✓ Sharp (Server)' : '○ Canvas (Client)'}
          </button>
          <button
            onClick={() => {
              setUseTemplateMode(!useTemplateMode)
              setUseServerSide(false)
              setUsePrintify(false)
            }}
            className={`px-4 py-2 rounded text-sm ${useTemplateMode ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {useTemplateMode ? '✓ Template (Mask)' : '○ Template (Mask)'}
          </button>
          <button
            onClick={() => {
              setUsePrintify(!usePrintify)
              setUseServerSide(false)
              setUseTemplateMode(false)
            }}
            className={`px-4 py-2 rounded text-sm ${usePrintify ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            {usePrintify ? '✓ Printify API' : '○ Printify API'}
          </button>
        </div>
      )}
      
      {isGenerating && (
        <div className="text-center py-4 text-gray-600">
          {useTemplateMode ? 'Generating template mockup...' : usePrintify ? 'Generating Printify mockup...' : 'Generating professional mockup...'}
        </div>
      )}
      
      {/* Mockup view selector for Printify (multiple angles) */}
      {usePrintify && printifyMockups.length > 1 && (
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {printifyMockups.map((mockup, index) => {
            // Determine label based on camera label in URL
            let label = '';
            if (mockup.src.includes('camera_label=front') && !mockup.src.includes('front-2')) {
              label = '📸 Front'
            } else if (mockup.src.includes('camera_label=back') && !mockup.src.includes('back-2')) {
              label = '🔄 Back'
            } else if (mockup.src.includes('camera_label=front-2')) {
              label = '📸 Front Alt'
            } else if (mockup.src.includes('camera_label=back-2')) {
              label = '🔄 Back Alt'
            } else {
              label = `📸 View ${index + 1}`
            }
            
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedMockupIndex(index)
                  setServerRenderedMockup(mockup.src)
                }}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  selectedMockupIndex === index 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
      
      {(useServerSide || usePrintify || useTemplateMode) && serverRenderedMockup ? (
        <Image
          src={serverRenderedMockup}
          alt="Server-rendered mockup"
          width={800}
          height={800}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-lg"
          style={{ maxWidth: '100%' }}
        />
      )}
    </div>
  )
}

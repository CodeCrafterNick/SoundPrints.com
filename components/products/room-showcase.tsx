'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductMockup, type ProductMockupRef } from '@/components/products/product-mockup'
import { useCustomizerStore } from '@/lib/stores/customizer-store'

interface RoomShowcaseProps {
  mockupRef?: React.RefObject<ProductMockupRef | null>
}

interface RoomScene {
  id: string
  name: string
  image: string
  artworkPosition: {
    top: string
    left: string
    width: string
    height: string
    transform?: string
  }
}

const roomScenes: RoomScene[] = [
  {
    id: 'living-room',
    name: 'Modern Living Room',
    image: '/room-scenes/living-room.jpg',
    artworkPosition: {
      top: '30%',
      left: '37%',
      width: '26%',
      height: 'auto',
    },
  },
  {
    id: 'bedroom',
    name: 'Minimalist Bedroom',
    image: '/room-scenes/bedroom.jpg',
    artworkPosition: {
      top: '28%',
      left: '40%',
      width: '20%',
      height: 'auto',
    },
  },
  {
    id: 'office',
    name: 'Home Office',
    image: '/room-scenes/office.jpg',
    artworkPosition: {
      top: '25%',
      left: '42%',
      width: '22%',
      height: 'auto',
    },
  },
  {
    id: 'gallery',
    name: 'Gallery Wall',
    image: '/room-scenes/gallery.jpg',
    artworkPosition: {
      top: '32%',
      left: '35%',
      width: '18%',
      height: 'auto',
    },
  },
]
export function RoomShowcase({ mockupRef }: RoomShowcaseProps) {
  const [currentScene, setCurrentScene] = useState(0)
  const [artworkDataUrl, setArtworkDataUrl] = useState<string | null>(null)
  const [compositeImage, setCompositeImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Subscribe to all relevant customizer state changes
  const {
    selectedSize,
    selectedRegion,
    waveformColor,
    waveformSize,
    waveformUseGradient,
    waveformGradientStops,
    waveformGradientDirection,
    backgroundColor,
    backgroundUseGradient,
    backgroundGradientStops,
    backgroundGradientDirection,
    backgroundImage,
    backgroundImagePosition,
    backgroundFocalPoint,
    waveformStyle,
    customText,
    songTitle,
    artistName,
    customDate,
    textColor,
    showText,
    textPosition,
    textX,
    textY,
    fontSize,
    fontFamily,
    showQRCode,
    qrCodeUrl,
    qrCodePosition,
  } = useCustomizerStore()

  // Capture the mockup canvas as an image whenever customizer state changes
  useEffect(() => {
    // Use requestAnimationFrame to capture after the canvas has been updated
    // Double RAF + small timeout to ensure all async renders complete
    const captureCanvas = () => {
      if (mockupRef?.current?.canvas) {
        try {
          const dataUrl = mockupRef.current.canvas.toDataURL('image/png')
          setArtworkDataUrl(dataUrl)
        } catch (error) {
          console.error('RoomShowcase: Error capturing mockup:', error)
        }
      }
    }

    // Use timeout with double RAF to ensure canvas is fully painted
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(captureCanvas)
      })
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [
    mockupRef,
    selectedSize,
    selectedRegion?.start,
    selectedRegion?.end,
    waveformColor,
    waveformSize,
    waveformUseGradient,
    waveformGradientStops,
    waveformGradientDirection,
    backgroundColor,
    backgroundUseGradient,
    backgroundGradientStops,
    backgroundGradientDirection,
    backgroundImage,
    backgroundImagePosition,
    backgroundFocalPoint,
    waveformStyle,
    customText,
    songTitle,
    artistName,
    customDate,
    textColor,
    showText,
    textPosition,
    textX,
    textY,
    fontSize,
    fontFamily,
    showQRCode,
    qrCodeUrl,
    qrCodePosition,
  ])

  // Composite the artwork onto the background image
  useEffect(() => {
    if (!artworkDataUrl || !canvasRef.current) {
      console.log('Missing artworkDataUrl or canvas:', { artworkDataUrl: !!artworkDataUrl, canvas: !!canvasRef.current })
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('No canvas context available')
      return
    }

    const bgImage = new Image()
    bgImage.crossOrigin = 'anonymous'
    bgImage.src = '/mockups/living-room.png'
    
    bgImage.onerror = (e) => {
      const errorType = typeof e === 'string' ? e : (e as Event).type || 'unknown error'
      console.error('Failed to load background image:', '/mockups/living-room.png', 'Error:', errorType)
      // Draw a gray background as fallback and still try to render artwork
      if (canvas.width && canvas.height) {
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    
    bgImage.onload = () => {
      console.log('Background loaded:', bgImage.width, 'x', bgImage.height)
      
      // Set canvas size to match background image
      canvas.width = bgImage.width
      canvas.height = bgImage.height

      // Draw background to cover canvas while maintaining aspect ratio
      const bgAspect = bgImage.width / bgImage.height
      const canvasAspect = canvas.width / canvas.height
      let drawWidth, drawHeight, offsetX, offsetY
      
      if (bgAspect > canvasAspect) {
        // Image is wider - fit to height
        drawHeight = canvas.height
        drawWidth = drawHeight * bgAspect
        offsetX = (canvas.width - drawWidth) / 2
        offsetY = 0
      } else {
        // Image is taller - fit to width
        drawWidth = canvas.width
        drawHeight = drawWidth / bgAspect
        offsetX = 0
        offsetY = (canvas.height - drawHeight) / 2
      }
      
      ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight)

      // Load and draw artwork
      const artworkImage = new Image()
      artworkImage.src = artworkDataUrl
      
      artworkImage.onerror = (e) => {
        const errorType = typeof e === 'string' ? e : (e as Event).type || e
        console.error('Failed to load artwork image:', 'Error:', errorType)
      }
      
      artworkImage.onload = () => {
        console.log('Artwork loaded:', artworkImage.width, 'x', artworkImage.height)
        
        // Calculate artwork aspect ratio based on selected size
        const sizeAspectRatios: Record<string, number> = {
          '12x16': 12 / 16,
          '18x24': 18 / 24,
          '24x36': 24 / 36,
          '16x20': 16 / 20,
          '20x24': 20 / 24,
          'S': 1,
          'M': 1,
          'L': 1,
          'XL': 1,
          'XXL': 1,
          '11oz': 1,
          '15oz': 1,
        }
        
        const targetAspectRatio = sizeAspectRatios[selectedSize] || (artworkImage.width / artworkImage.height)
        
        // Calculate artwork position and size based on canvas dimensions
        const artworkWidth = canvas.width * 0.25
        const artworkHeight = artworkWidth / targetAspectRatio
        const artworkX = canvas.width * 0.30
        const artworkY = canvas.height * 0.12

        console.log('Drawing at:', { artworkX, artworkY, artworkWidth, artworkHeight, aspectRatio: targetAspectRatio, selectedSize })

        // Save context state
        ctx.save()

        // Apply 3D perspective transform
        // Move to artwork center for rotation
        const centerX = artworkX + artworkWidth / 2
        const centerY = artworkY + artworkHeight / 2
        
        ctx.translate(centerX, centerY)
        
        // No rotation - keep frame straight
        
        // Draw shadow first
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
        ctx.shadowBlur = 35
        ctx.shadowOffsetX = 15
        ctx.shadowOffsetY = 20
        
        // Draw frame background
        const frameThickness = artworkWidth * 0.03
        ctx.fillStyle = '#333'
        ctx.fillRect(
          -artworkWidth / 2 - frameThickness,
          -artworkHeight / 2 - frameThickness,
          artworkWidth + frameThickness * 2,
          artworkHeight + frameThickness * 2
        )
        
        // Reset shadow for artwork
        ctx.shadowColor = 'transparent'
        
        // Draw artwork directly without mat
        ctx.drawImage(
          artworkImage,
          -artworkWidth / 2,
          -artworkHeight / 2,
          artworkWidth,
          artworkHeight
        )
        
        // Restore context
        ctx.restore()

        // Convert to data URL
        const composite = canvas.toDataURL('image/png')
        console.log('Composite created, length:', composite.length)
        setCompositeImage(composite)
      }
    }
  }, [artworkDataUrl, selectedSize])

  const nextScene = () => {
    setCurrentScene((prev) => (prev + 1) % roomScenes.length)
  }

  const prevScene = () => {
    setCurrentScene((prev) => (prev - 1 + roomScenes.length) % roomScenes.length)
  }

  const scene = roomScenes[currentScene]

  return (
    <section className="w-full">
      <div className="w-full">
        <div className="relative w-full rounded-2xl overflow-hidden bg-muted shadow-2xl">
          {/* Hidden canvas for compositing */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Display composite image */}
          {compositeImage ? (
            <img 
              src={compositeImage} 
              alt="Room with your artwork" 
              className="w-full h-auto"
            />
          ) : (
            <img 
              src="/mockups/living-room.png" 
              alt="Living room" 
              className="w-full h-auto"
            />
          )}
        </div>
      </div>
    </section>
  )
}

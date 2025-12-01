'use client'

import { useEffect, useRef } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import type { ProductMockupRef } from '@/components/products/product-mockup'

interface LiveWaveformPreviewProps {
  mockupRef: React.RefObject<ProductMockupRef | null>
  selectedSize?: { width: number; height: number }
}

export function LiveWaveformPreview({ mockupRef, selectedSize }: LiveWaveformPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const waveformUseGradient = useCustomizerStore((state) => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore((state) => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore((state) => state.waveformGradientDirection)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundUseGradient = useCustomizerStore((state) => state.backgroundUseGradient)
  const backgroundGradientStops = useCustomizerStore((state) => state.backgroundGradientStops)
  const backgroundGradientDirection = useCustomizerStore((state) => state.backgroundGradientDirection)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundImagePosition = useCustomizerStore((state) => state.backgroundImagePosition)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const waveformSize = useCustomizerStore((state) => state.waveformSize)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const showText = useCustomizerStore((state) => state.showText)
  const customText = useCustomizerStore((state) => state.customText)
  const textColor = useCustomizerStore((state) => state.textColor)
  const textX = useCustomizerStore((state) => state.textX)
  const textY = useCustomizerStore((state) => state.textY)
  const fontSize = useCustomizerStore((state) => state.fontSize)
  const fontFamily = useCustomizerStore((state) => state.fontFamily)

  useEffect(() => {
    let logCount = 0
    const renderPreview = () => {
      if (!canvasRef.current || !mockupRef.current?.canvas) {
        if (logCount < 5) {
          console.log('[LiveWaveformPreview] Waiting for canvas refs:', {
            hasCanvasRef: !!canvasRef.current,
            hasMockupRef: !!mockupRef.current,
            hasMockupCanvas: !!mockupRef.current?.canvas
          })
          logCount++
        }
        animationFrameRef.current = requestAnimationFrame(renderPreview)
        return
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const sourceCanvas = mockupRef.current.canvas
      
      if (!ctx || sourceCanvas.width === 0 || sourceCanvas.height === 0) {
        if (logCount < 5) {
          console.log('[LiveWaveformPreview] Source canvas not ready:', {
            hasCtx: !!ctx,
            sourceWidth: sourceCanvas.width,
            sourceHeight: sourceCanvas.height
          })
          logCount++
        }
        animationFrameRef.current = requestAnimationFrame(renderPreview)
        return
      }

      // Set canvas to match selected size aspect ratio
      const container = canvas.parentElement
      if (container) {
        const dpr = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()
        
        // Use selected size aspect ratio if available, otherwise use source canvas
        const targetAspectRatio = selectedSize 
          ? selectedSize.width / selectedSize.height 
          : sourceCanvas.width / sourceCanvas.height
        
        // Calculate dimensions that fit container while maintaining aspect ratio
        let displayWidth = rect.width
        let displayHeight = rect.width / targetAspectRatio
        
        if (displayHeight > rect.height) {
          displayHeight = rect.height
          displayWidth = rect.height * targetAspectRatio
        }
        
        canvas.width = displayWidth * dpr
        canvas.height = displayHeight * dpr
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`
        
        ctx.scale(dpr, dpr)
        
        // Draw the mockup canvas content scaled to fit
        const scale = Math.min(displayWidth / sourceCanvas.width, displayHeight / sourceCanvas.height)
        const x = (displayWidth - sourceCanvas.width * scale) / 2
        const y = (displayHeight - sourceCanvas.height * scale) / 2
        
        ctx.clearRect(0, 0, rect.width, rect.height)
        ctx.drawImage(sourceCanvas, x, y, sourceCanvas.width * scale, sourceCanvas.height * scale)
      }
      
      animationFrameRef.current = requestAnimationFrame(renderPreview)
    }

    renderPreview()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mockupRef, audioUrl, selectedRegion, waveformColor, waveformUseGradient, waveformGradientStops, waveformGradientDirection, backgroundColor, backgroundUseGradient, backgroundGradientStops, backgroundGradientDirection, backgroundImage, backgroundImagePosition, waveformStyle, waveformSize, waveformHeightMultiplier, showText, customText, textColor, textX, textY, fontSize, fontFamily, selectedSize])

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

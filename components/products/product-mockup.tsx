'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useCustomizerStore, type GradientStop } from '@/lib/stores/customizer-store'
import { Frame, Shirt, Coffee, Palette, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import QRCode from 'qrcode'

interface ProductMockupProps {
  className?: string
  canvasWidth?: number
  canvasHeight?: number
}

export interface ProductMockupRef {
  canvas: HTMLCanvasElement | null
  getPrintFile: () => Promise<string> // Returns data URL of transparent print-ready artwork (no background)
}

export const ProductMockup = forwardRef<ProductMockupRef, ProductMockupProps>(
  function ProductMockup({ className, canvasWidth = 3600, canvasHeight = 4800 }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [fontLoaded, setFontLoaded] = useState(false)
  const lastWaveformKey = useRef<string>('')
  const lastOverlayKey = useRef<string>('')
  const waveformImageData = useRef<ImageData | null>(null)
  
  // Helper function to add opacity to color (handles hex and rgba)
  const addOpacity = useCallback((color: string, opacity: string): string => {
    // If already rgba, extract rgb and replace alpha
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        const alpha = parseInt(opacity, 16) / 255
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`
      }
    }
    // If hex color, append opacity
    if (color.startsWith('#')) {
      return color + opacity
    }
    // Fallback: just append
    return color + opacity
  }, [])
  
  // Function to generate print-ready file (transparent PNG with just artwork, no background)
  const getPrintFile = async (): Promise<string> => {
    console.log('[getPrintFile] Starting print file generation...')
    
    // Get fresh state values directly from store
    const state = useCustomizerStore.getState()
    const currentWaveformSize = state.waveformSize
    const currentWaveformHeightMultiplier = state.waveformHeightMultiplier || 100
    const currentAudioUrl = state.audioUrl
    const currentSelectedSize = state.selectedSize
    const currentWaveformColor = state.waveformColor
    const currentWaveformStyle = state.waveformStyle
    const currentBackgroundColor = state.backgroundColor
    const currentBackgroundUseGradient = state.backgroundUseGradient
    const currentBackgroundGradientStops = state.backgroundGradientStops
    const currentBackgroundGradientDirection = state.backgroundGradientDirection
    const currentWaveformUseGradient = state.waveformUseGradient
    const currentWaveformGradientStops = state.waveformGradientStops
    const currentWaveformGradientDirection = state.waveformGradientDirection
    const currentSelectedRegion = state.selectedRegion
    const currentShowText = state.showText
    const currentSongTitle = state.songTitle
    const currentArtistName = state.artistName
    const currentCustomDate = state.customDate
    const currentCustomText = state.customText
    const currentTextColor = state.textColor
    const currentTextX = state.textX
    const currentTextY = state.textY
    const currentFontFamily = state.fontFamily
    const currentFontSize = state.fontSize
    const currentBackgroundImage = state.backgroundImage
    const currentBackgroundImagePosition = state.backgroundImagePosition
    const currentShowQRCode = state.showQRCode
    const currentQrCodeUrl = state.qrCodeUrl
    const currentQrCodePosition = state.qrCodePosition
    const currentQrCodeSize = state.qrCodeSize
    const currentQrCodeX = state.qrCodeX
    const currentQrCodeY = state.qrCodeY
    const currentDetectedWords = state.detectedWords
    const currentShowArtisticText = state.showArtisticText
    const currentArtisticTextStyle = state.artisticTextStyle
    const currentArtisticTextColor = state.artisticTextColor
    const currentArtisticTextOpacity = state.artisticTextOpacity
    
    if (!currentAudioUrl) {
      console.error('[getPrintFile] No audio URL available')
      throw new Error('No audio loaded. Please upload an audio file first.')
    }
    
    console.log('[getPrintFile] Audio URL:', currentAudioUrl.substring(0, 50) + '...')
    console.log('[getPrintFile] Selected size:', currentSelectedSize)

    // Create a high-res print canvas (300 DPI)
    const printCanvas = document.createElement('canvas')
    const printCtx = printCanvas.getContext('2d', { alpha: true })
    if (!printCtx) throw new Error('Failed to create print context')

    // Calculate true 300 DPI dimensions based on physical size
    const printSizes: Record<string, { width: number; height: number }> = {
      // Posters at 300 DPI
      '12x16': { width: 3600, height: 4800 },   // 12" x 16" at 300 DPI
      '18x24': { width: 5400, height: 7200 },   // 18" x 24" at 300 DPI
      '24x36': { width: 7200, height: 10800 },  // 24" x 36" at 300 DPI
      // T-shirts at 200 DPI (12" print width)
      'S': { width: 2400, height: 2400 },
      'M': { width: 2400, height: 2400 },
      'L': { width: 2400, height: 2400 },
      'XL': { width: 2400, height: 2400 },
      'XXL': { width: 2400, height: 2400 },
      // Mugs at 300 DPI
      '11oz': { width: 2700, height: 1050 },    // 9" x 3.5" wrap
      '15oz': { width: 2700, height: 1050 },
      // Canvas at 300 DPI
      '16x20': { width: 4800, height: 6000 },
      '20x24': { width: 6000, height: 7200 },
    }
    
    const size = printSizes[currentSelectedSize] || { width: 5400, height: 7200 }
    printCanvas.width = size.width
    printCanvas.height = size.height
    
    // Clear canvas first
    printCtx.clearRect(0, 0, printCanvas.width, printCanvas.height)
    
    // Render background (color, gradient, or image)
    if (currentBackgroundImage) {
      // Load and draw background image
      const bgImage = new Image()
      bgImage.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        bgImage.onload = () => {
          // Calculate aspect ratios
          const canvasAspect = printCanvas.width / printCanvas.height
          const imageAspect = bgImage.width / bgImage.height
          
          let drawWidth, drawHeight, offsetX, offsetY
          
          // Cover the entire canvas (like CSS background-size: cover)
          if (imageAspect > canvasAspect) {
            // Image is wider than canvas
            drawHeight = printCanvas.height
            drawWidth = bgImage.width * (printCanvas.height / bgImage.height)
            
            // Apply horizontal positioning
            if (currentBackgroundImagePosition === 'left') {
              offsetX = 0
            } else if (currentBackgroundImagePosition === 'right') {
              offsetX = printCanvas.width - drawWidth
            } else {
              offsetX = (printCanvas.width - drawWidth) / 2
            }
            offsetY = 0
          } else {
            // Image is taller than canvas
            drawWidth = printCanvas.width
            drawHeight = bgImage.height * (printCanvas.width / bgImage.width)
            offsetX = 0
            
            // Apply vertical positioning
            if (currentBackgroundImagePosition === 'top') {
              offsetY = 0
            } else if (currentBackgroundImagePosition === 'bottom') {
              offsetY = printCanvas.height - drawHeight
            } else {
              offsetY = (printCanvas.height - drawHeight) / 2
            }
          }
          
          printCtx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight)
          resolve()
        }
        bgImage.onerror = () => {
          console.error('Failed to load background image, using fallback')
          // Fallback to gradient or solid color
          renderBackgroundFill()
          resolve()
        }
        bgImage.src = currentBackgroundImage
      })
    } else {
      // Render gradient or solid color background
      renderBackgroundFill()
    }
    
    function renderBackgroundFill() {
      if (!printCtx) return
      if (currentBackgroundUseGradient) {
        let bgGradient
        if (currentBackgroundGradientDirection === 'radial') {
          bgGradient = printCtx.createRadialGradient(
            printCanvas.width / 2, printCanvas.height / 2, 0,
            printCanvas.width / 2, printCanvas.height / 2, Math.max(printCanvas.width, printCanvas.height) / 2
          )
        } else if (currentBackgroundGradientDirection === 'horizontal') {
          bgGradient = printCtx.createLinearGradient(0, 0, printCanvas.width, 0)
        } else if (currentBackgroundGradientDirection === 'vertical') {
          bgGradient = printCtx.createLinearGradient(0, 0, 0, printCanvas.height)
        } else { // diagonal
          bgGradient = printCtx.createLinearGradient(0, 0, printCanvas.width, printCanvas.height)
        }
        const sortedStops = [...currentBackgroundGradientStops].sort((a, b) => a.position - b.position)
        sortedStops.forEach(stop => {
          bgGradient.addColorStop(stop.position, stop.color)
        })
        printCtx.fillStyle = bgGradient
      } else {
        printCtx.fillStyle = currentBackgroundColor
      }
      printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height)
    }
    
    // Disable image smoothing for crisp edges
    if (printCtx) printCtx.imageSmoothingEnabled = false
    
    // Decode audio for waveform data
    console.log('[getPrintFile] Fetching audio data...')
    let response
    try {
      response = await fetch(currentAudioUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('[getPrintFile] Failed to fetch audio:', error)
      throw new Error('Failed to load audio file. Please try re-uploading the audio.')
    }
    
    console.log('[getPrintFile] Decoding audio...')
    const arrayBuffer = await response.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    console.log('[getPrintFile] Audio decoded successfully, duration:', audioBuffer.duration)
    
    const rawData = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    
    // Calculate the start and end samples based on selected region
    let startSample = 0
    let endSample = rawData.length
    
    // Check if we have a valid selection (not null, and end > start)
    // Treat {start: 0, end: 0} as "no selection" since it means 0 samples
    const hasValidSelection = currentSelectedRegion && currentSelectedRegion.end > currentSelectedRegion.start
    
    if (hasValidSelection) {
      startSample = Math.floor(currentSelectedRegion.start * sampleRate)
      endSample = Math.floor(currentSelectedRegion.end * sampleRate)
    }
    
    // Extract only the selected region
    const regionData = rawData.slice(startSample, endSample)
    
    // Calculate max amplitude from ENTIRE audio file, not just the selected region
    // This ensures bars are relative to the full audio's loudness
    let globalMax = 0
    for (let i = 0; i < rawData.length; i++) {
      const abs = Math.abs(rawData[i])
      if (abs > globalMax) globalMax = abs
    }
    
    // Calculate waveform dimensions
    // Scale margin proportionally with canvas size
    const aspectRatio = printCanvas.width / printCanvas.height
    
    // Calculate margin as percentage of smallest dimension
    let marginPercent = 0.08 // 8% default margin
    if (aspectRatio > 1.5) {
      // Wide formats (like 36x24, 24x18) - need more horizontal margin
      marginPercent = 0.10
    } else if (aspectRatio < 0.8) {
      // Narrow formats (like 12x16) - need more vertical margin
      marginPercent = 0.12
    } else if (aspectRatio === 1) {
      // Square format (12x12)
      marginPercent = 0.09
    }
    
    const minMargin = Math.min(printCanvas.width, printCanvas.height) * marginPercent
    const maxAvailableWidth = printCanvas.width - (minMargin * 2)
    const maxAvailableHeight = printCanvas.height - (minMargin * 2)
    
    // Buffer percentage - small buffer to prevent waveform from touching absolute edges
    const bufferPercent = 0.02 // 2% buffer on each side (reduced to allow edge-to-edge)
    const bufferWidth = printCanvas.width * bufferPercent
    const bufferHeight = printCanvas.height * bufferPercent
    const maxAllowedWidth = printCanvas.width - (bufferWidth * 2)
    const maxAllowedHeight = printCanvas.height - (bufferHeight * 2)
    
    // Apply waveformSize percentage to available space
    // Height is doubled to allow more vertical space (50% slider = 100% height)
    const unclampedWaveformWidth = maxAvailableWidth * (currentWaveformSize / 100)
    const unclamppedWaveformHeight = maxAvailableHeight * 0.7 * (currentWaveformSize / 100) * 2
    
    // Amplitude multiplier - makes bars "louder" (taller) without changing container
    const amplitudeMultiplier = (currentWaveformHeightMultiplier || 100) / 100
    // Clamp both width and height to prevent overflow, leaving buffer
    const waveformWidth = Math.min(unclampedWaveformWidth, maxAllowedWidth)
    const waveformHeight = Math.min(unclamppedWaveformHeight, maxAllowedHeight)
    const padding = (printCanvas.width - waveformWidth) / 2
    const waveformX = padding
    const waveformY = (printCanvas.height - waveformHeight) / 2
    
    const barWidth = Math.max(2, Math.floor(printCanvas.width / 600)) // Scale bar width with resolution
    const barGap = Math.max(1, Math.floor(barWidth / 3))
    const barTotalWidth = barWidth + barGap
    // Calculate samples based on waveformWidth for proper proportional sizing
    const samples = Math.floor(waveformWidth / barTotalWidth)
    
    const blockSize = Math.max(1, Math.floor(regionData.length / samples))
    const filteredData = []
    
    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i
      const blockEnd = Math.min(blockStart + blockSize, regionData.length)
      let sum = 0
      let count = 0
      
      for (let j = blockStart; j < blockEnd; j++) {
        sum += Math.abs(regionData[j])
        count++
      }
      
      filteredData.push(count > 0 ? sum / count : 0)
    }
    
    // Use global max from entire audio instead of just the filtered region
    // Apply amplitude multiplier to make bars "louder" - clamp to 1.0 to prevent overflow
    const normalizedData = filteredData.map(n => Math.min(1, (n / globalMax) * amplitudeMultiplier))
    
    // Create waveform color or gradient
    let waveformFillStyle: string | CanvasGradient
    if (currentWaveformUseGradient && currentWaveformGradientStops && currentWaveformGradientStops.length >= 2) {
      let waveGradient
      if (currentWaveformGradientDirection === 'radial') {
        waveGradient = printCtx.createRadialGradient(
          printCanvas.width / 2, printCanvas.height / 2, 0,
          printCanvas.width / 2, printCanvas.height / 2, Math.max(printCanvas.width, printCanvas.height) / 2
        )
      } else if (currentWaveformGradientDirection === 'horizontal') {
        waveGradient = printCtx.createLinearGradient(waveformX, 0, waveformX + waveformWidth, 0)
      } else if (currentWaveformGradientDirection === 'vertical') {
        waveGradient = printCtx.createLinearGradient(0, waveformY, 0, waveformY + waveformHeight)
      } else { // diagonal
        waveGradient = printCtx.createLinearGradient(waveformX, waveformY, waveformX + waveformWidth, waveformY + waveformHeight)
      }
      const sortedStops = [...currentWaveformGradientStops].sort((a, b) => a.position - b.position)
      sortedStops.forEach(stop => {
        waveGradient.addColorStop(stop.position, stop.color)
      })
      waveformFillStyle = waveGradient
    } else {
      waveformFillStyle = currentWaveformColor
    }
    
    printCtx.fillStyle = waveformFillStyle
    
    // Render waveform based on style
    switch (currentWaveformStyle) {
      case 'bars':
        // Default bars - scale positions to fit within waveformWidth
        for (let i = 0; i < normalizedData.length; i++) {
          const x = waveformX + (i / normalizedData.length) * waveformWidth
          const barHeight = normalizedData[i] * waveformHeight
          const y = waveformY + (waveformHeight - barHeight) / 2
          
          printCtx.fillRect(x, y, barWidth, barHeight)
        }
        break
        
      case 'smooth':
        if (normalizedData.length >= 2) {
          // Smooth flowing waveform with curves
          const smoothWaveformY = waveformY + waveformHeight / 2
          const pointSpacing = waveformWidth / (normalizedData.length - 1)
          
          printCtx.beginPath()
          
          // Start from the left
          let startX = waveformX
          let startHeight = normalizedData[0] * (waveformHeight / 2)
          printCtx.moveTo(startX, smoothWaveformY - startHeight)
          
          // Draw top curve using quadratic curves
          for (let i = 0; i < normalizedData.length - 1; i++) {
            const x1 = waveformX + i * pointSpacing
            const x2 = waveformX + (i + 1) * pointSpacing
            const y1 = smoothWaveformY - (normalizedData[i] * (waveformHeight / 2))
            const y2 = smoothWaveformY - (normalizedData[i + 1] * (waveformHeight / 2))
            
            // Control point is halfway between points
            const cpX = (x1 + x2) / 2
            const cpY = (y1 + y2) / 2
            
            printCtx.quadraticCurveTo(x1, y1, cpX, cpY)
          }
          
          // Complete the last segment
          const lastX = waveformX + (normalizedData.length - 1) * pointSpacing
          const lastHeight = normalizedData[normalizedData.length - 1] * (waveformHeight / 2)
          printCtx.lineTo(lastX, smoothWaveformY - lastHeight)
          
          // Draw bottom curve (mirrored)
          for (let i = normalizedData.length - 1; i > 0; i--) {
            const x1 = waveformX + i * pointSpacing
            const x2 = waveformX + (i - 1) * pointSpacing
            const y1 = smoothWaveformY + (normalizedData[i] * (waveformHeight / 2))
            const y2 = smoothWaveformY + (normalizedData[i - 1] * (waveformHeight / 2))
            
            const cpX = (x1 + x2) / 2
            const cpY = (y1 + y2) / 2
            
            printCtx.quadraticCurveTo(x1, y1, cpX, cpY)
          }
          
          // Close the path
          printCtx.lineTo(startX, smoothWaveformY + startHeight)
          printCtx.closePath()
          printCtx.fill()
        }
        break
        
      case 'soundwave-lines':
        // Spotify Canvas style - thin horizontal lines with subtle variations (PRINT)
        if (normalizedData.length >= 2) {
          const numLines = 30
          const lineSpacing = waveformHeight / numLines
          const swCenterY = waveformY + waveformHeight / 2
          
          printCtx.lineWidth = 3
          printCtx.strokeStyle = waveformFillStyle
          
          for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
            const baseY = waveformY + lineIdx * lineSpacing
            const distFromCenter = Math.abs(baseY - swCenterY) / (waveformHeight / 2)
            
            printCtx.beginPath()
            printCtx.moveTo(waveformX, baseY)
            
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const amplitude = normalizedData[i] * 15 * (1 - distFromCenter * 0.5)
              const sineWave = Math.sin((i / normalizedData.length) * Math.PI * 4 + lineIdx * 0.2) * amplitude
              const y = baseY + sineWave
              
              if (i === 0) printCtx.moveTo(x, y)
              else printCtx.lineTo(x, y)
            }
            
            printCtx.globalAlpha = 0.6 - distFromCenter * 0.3
            printCtx.stroke()
            printCtx.globalAlpha = 1
          }
        }
        break
        
      case 'mountain':
        // Layered mountain silhouettes (PRINT)
        if (normalizedData.length >= 2) {
          const numLayers = 4
          
          for (let layer = 0; layer < numLayers; layer++) {
            const layerOpacity = 0.3 + (layer / numLayers) * 0.7
            const layerHeight = waveformHeight * (0.4 + layer * 0.15)
            const layerY = waveformY + (waveformHeight - layerHeight) / 2
            
            printCtx.globalAlpha = layerOpacity
            printCtx.beginPath()
            printCtx.moveTo(waveformX, waveformY + waveformHeight)
            
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const noise = (Math.random() - 0.5) * 20
              const peak = normalizedData[i] * layerHeight * (1 + layer * 0.1) + noise
              const y = layerY + layerHeight - peak
              
              if (i === 0) printCtx.lineTo(x, y)
              else {
                const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
                const prevPeak = normalizedData[i - 1] * layerHeight * (1 + layer * 0.1)
                const prevY = layerY + layerHeight - prevPeak
                const cpX = (prevX + x) / 2
                const cpY = (prevY + y) / 2
                printCtx.quadraticCurveTo(prevX, prevY, cpX, cpY)
              }
            }
            
            printCtx.lineTo(waveformX + waveformWidth, waveformY + waveformHeight)
            printCtx.closePath()
            printCtx.fill()
          }
          printCtx.globalAlpha = 1
        }
        break
        
      case 'heartbeat':
        // ECG/Medical monitor style (PRINT)
        if (normalizedData.length >= 2) {
          const ecgCenterY = waveformY + waveformHeight / 2
          const ecgAmplitude = waveformHeight * 0.4
          
          // Draw grid lines
          printCtx.strokeStyle = addOpacity(currentWaveformColor, '20')
          printCtx.lineWidth = 1
          
          // Horizontal grid
          for (let i = 0; i <= 10; i++) {
            const y = waveformY + (i / 10) * waveformHeight
            printCtx.beginPath()
            printCtx.moveTo(waveformX, y)
            printCtx.lineTo(waveformX + waveformWidth, y)
            printCtx.stroke()
          }
          
          // Vertical grid
          for (let i = 0; i <= 20; i++) {
            const x = waveformX + (i / 20) * waveformWidth
            printCtx.beginPath()
            printCtx.moveTo(x, waveformY)
            printCtx.lineTo(x, waveformY + waveformHeight)
            printCtx.stroke()
          }
          
          // Draw ECG waveform
          printCtx.strokeStyle = waveformFillStyle
          printCtx.lineWidth = 4
          printCtx.beginPath()
          
          for (let i = 0; i < normalizedData.length; i++) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const amplitude = normalizedData[i]
            
            let y
            if (amplitude > 0.7) {
              // QRS complex (sharp spike)
              const phase = (i % 10) / 10
              if (phase < 0.2) y = ecgCenterY - amplitude * ecgAmplitude
              else if (phase < 0.3) y = ecgCenterY + amplitude * ecgAmplitude * 0.3
              else if (phase < 0.5) y = ecgCenterY + amplitude * ecgAmplitude * 0.2
              else y = ecgCenterY
            } else {
              // P and T waves (gentle curves)
              y = ecgCenterY - amplitude * ecgAmplitude * 0.5
            }
            
            if (i === 0) printCtx.moveTo(x, y)
            else printCtx.lineTo(x, y)
          }
          
          printCtx.stroke()
        }
        break
        
      case 'constellation':
        // Connected stars pattern (PRINT)
        if (normalizedData.length >= 2) {
          const stars: Array<{x: number, y: number, brightness: number}> = []
          
          // Create star positions from audio
          for (let i = 0; i < normalizedData.length; i++) {
            if (normalizedData[i] > 0.3) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const y = waveformY + waveformHeight / 2 + (Math.random() - 0.5) * waveformHeight * normalizedData[i]
              stars.push({ x, y, brightness: normalizedData[i] })
            }
          }
          
          // Draw connections between nearby stars
          printCtx.strokeStyle = addOpacity(currentWaveformColor, '40')
          printCtx.lineWidth = 2
          
          for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
              const dx = stars[j].x - stars[i].x
              const dy = stars[j].y - stars[i].y
              const dist = Math.sqrt(dx * dx + dy * dy)
              
              if (dist < 100) {
                printCtx.beginPath()
                printCtx.moveTo(stars[i].x, stars[i].y)
                printCtx.lineTo(stars[j].x, stars[j].y)
                printCtx.stroke()
              }
            }
          }
          
          // Draw stars
          for (const star of stars) {
            const size = 4 + star.brightness * 6
            printCtx.fillStyle = waveformFillStyle
            printCtx.beginPath()
            printCtx.arc(star.x, star.y, size, 0, Math.PI * 2)
            printCtx.fill()
            
            // Glow effect
            printCtx.shadowBlur = 15
            printCtx.shadowColor = currentWaveformColor
            printCtx.fill()
            printCtx.shadowBlur = 0
          }
        }
        break
        
      case 'ribbon':
        // Flowing ribbon with light reflections (PRINT)
        if (normalizedData.length >= 2) {
          const ribbonCenterY = waveformY + waveformHeight / 2
          const ribbonWidth = 40
          
          // Shadow layer (below ribbon)
          printCtx.fillStyle = '#00000030'
          printCtx.beginPath()
          printCtx.moveTo(waveformX, ribbonCenterY + ribbonWidth + 10)
          
          for (let i = 0; i < normalizedData.length; i++) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
            const y = ribbonCenterY + wave + ribbonWidth + 10
            
            if (i === 0) printCtx.moveTo(x, y)
            else {
              const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
              const prevWave = Math.sin(((i - 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i - 1] * waveformHeight * 0.3
              const prevY = ribbonCenterY + prevWave + ribbonWidth + 10
              const cpX = (prevX + x) / 2
              const cpY = (prevY + y) / 2
              printCtx.quadraticCurveTo(prevX, prevY, cpX, cpY)
            }
          }
          
          printCtx.lineTo(waveformX + waveformWidth, ribbonCenterY + ribbonWidth + 10)
          printCtx.fill()
          
          // Main ribbon
          printCtx.fillStyle = waveformFillStyle
          printCtx.beginPath()
          
          // Top edge
          printCtx.moveTo(waveformX, ribbonCenterY - ribbonWidth)
          for (let i = 0; i < normalizedData.length; i++) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
            const y = ribbonCenterY + wave - ribbonWidth
            
            if (i > 0) {
              const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
              const prevWave = Math.sin(((i - 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i - 1] * waveformHeight * 0.3
              const prevY = ribbonCenterY + prevWave - ribbonWidth
              const cpX = (prevX + x) / 2
              const cpY = (prevY + y) / 2
              printCtx.quadraticCurveTo(prevX, prevY, cpX, cpY)
            }
          }
          
          // Bottom edge (reverse)
          for (let i = normalizedData.length - 1; i >= 0; i--) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
            const y = ribbonCenterY + wave + ribbonWidth
            
            if (i < normalizedData.length - 1) {
              const nextX = waveformX + ((i + 1) / normalizedData.length) * waveformWidth
              const nextWave = Math.sin(((i + 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i + 1] * waveformHeight * 0.3
              const nextY = ribbonCenterY + nextWave + ribbonWidth
              const cpX = (nextX + x) / 2
              const cpY = (nextY + y) / 2
              printCtx.quadraticCurveTo(nextX, nextY, cpX, cpY)
            }
          }
          
          printCtx.closePath()
          printCtx.fill()
          
          // Highlight (simulated reflection)
          const highlightGradient = printCtx.createLinearGradient(waveformX, ribbonCenterY - ribbonWidth, waveformX, ribbonCenterY)
          highlightGradient.addColorStop(0, '#ffffff60')
          highlightGradient.addColorStop(1, '#ffffff00')
          
          printCtx.fillStyle = highlightGradient
          printCtx.beginPath()
          printCtx.moveTo(waveformX, ribbonCenterY - ribbonWidth)
          for (let i = 0; i < normalizedData.length; i++) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
            const y = ribbonCenterY + wave - ribbonWidth
            
            if (i > 0) {
              const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
              const prevWave = Math.sin(((i - 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i - 1] * waveformHeight * 0.3
              const prevY = ribbonCenterY + prevWave - ribbonWidth
              const cpX = (prevX + x) / 2
              const cpY = (prevY + y) / 2
              printCtx.quadraticCurveTo(prevX, prevY, cpX, cpY)
            }
          }
          
          for (let i = normalizedData.length - 1; i >= 0; i--) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
            const y = ribbonCenterY + wave
            
            if (i < normalizedData.length - 1) {
              const nextX = waveformX + ((i + 1) / normalizedData.length) * waveformWidth
              const nextWave = Math.sin(((i + 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i + 1] * waveformHeight * 0.3
              const nextY = ribbonCenterY + nextWave
              const cpX = (nextX + x) / 2
              const cpY = (nextY + y) / 2
              printCtx.quadraticCurveTo(nextX, nextY, cpX, cpY)
            }
          }
          
          printCtx.closePath()
          printCtx.fill()
        }
        break
        
      case 'spectrum':
        // Concentric circles with HSL gradient (PRINT - 2024-2025 trending)
        if (normalizedData.length > 0) {
          const spectrumCenterX = printCanvas.width / 2
          const spectrumCenterY = printCanvas.height / 2
          const maxSpectrumRadius = Math.min(waveformWidth, waveformHeight) * 0.45
          
          // Draw concentric circles
          for (let i = 0; i < normalizedData.length; i++) {
            const radius = (i / normalizedData.length) * maxSpectrumRadius * normalizedData[i]
            const hue = (i / normalizedData.length) * 360
            const opacity = 0.4 + normalizedData[i] * 0.6
            
            const gradient = printCtx.createRadialGradient(
              spectrumCenterX, spectrumCenterY, radius * 0.8,
              spectrumCenterX, spectrumCenterY, radius
            )
            gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${opacity})`)
            gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, 0)`)
            
            printCtx.fillStyle = gradient
            printCtx.beginPath()
            printCtx.arc(spectrumCenterX, spectrumCenterY, radius, 0, Math.PI * 2)
            printCtx.fill()
          }
          
          // Center glow
          const centerGlow = printCtx.createRadialGradient(
            spectrumCenterX, spectrumCenterY, 0,
            spectrumCenterX, spectrumCenterY, 60
          )
          centerGlow.addColorStop(0, '#ffffffaa')
          centerGlow.addColorStop(1, '#ffffff00')
          printCtx.fillStyle = centerGlow
          printCtx.beginPath()
          printCtx.arc(spectrumCenterX, spectrumCenterY, 60, 0, Math.PI * 2)
          printCtx.fill()
        }
        break
        
      case 'mirror':
        // Mirrored waveform (top and bottom) - PRINT
        for (let i = 0; i < normalizedData.length; i++) {
          const barHeight = (normalizedData[i] * waveformHeight) / 2
          const x = waveformX + (i / normalizedData.length) * waveformWidth
          const centerY = waveformY + waveformHeight / 2
          
          // Top half
          printCtx.fillRect(x, centerY - barHeight, barWidth, barHeight)
          // Bottom half
          printCtx.fillRect(x, centerY, barWidth, barHeight)
        }
        break
        
      case 'dots':
        // Dotted pattern - PRINT
        for (let i = 0; i < normalizedData.length; i++) {
          const barHeight = normalizedData[i] * waveformHeight
          const x = waveformX + (i / normalizedData.length) * waveformWidth + barWidth / 2
          const centerY = waveformY + waveformHeight / 2
          const numDots = Math.max(3, Math.floor((barHeight / waveformHeight) * 15))
          
          for (let j = 0; j < numDots; j++) {
            const dotY = centerY - (barHeight / 2) + (j * barHeight) / (numDots - 1)
            printCtx.beginPath()
            printCtx.arc(x, dotY, 5, 0, Math.PI * 2)
            printCtx.fill()
          }
        }
        break
        
      case 'circular':
        // Circular visualization - PRINT
        const printCenterX = printCanvas.width / 2
        const printCenterY = printCanvas.height / 2
        const printRadius = Math.min(waveformWidth, waveformHeight) * 0.35
        
        printCtx.lineWidth = 12
        printCtx.strokeStyle = waveformFillStyle // Support gradient
        
        for (let i = 0; i < normalizedData.length; i++) {
          const angle = (i / normalizedData.length) * Math.PI * 2 - Math.PI / 2
          const amplitude = normalizedData[i] * printRadius * 1.2
          const innerRadius = printRadius - amplitude / 2
          const outerRadius = printRadius + amplitude / 2
          
          const x1 = printCenterX + Math.cos(angle) * innerRadius
          const y1 = printCenterY + Math.sin(angle) * innerRadius
          const x2 = printCenterX + Math.cos(angle) * outerRadius
          const y2 = printCenterY + Math.sin(angle) * outerRadius
          
          printCtx.beginPath()
          printCtx.moveTo(x1, y1)
          printCtx.lineTo(x2, y2)
          printCtx.stroke()
        }
        break
        
      case 'radial':
        // Radial burst effect - PRINT
        const radialCenterX = printCanvas.width / 2
        const radialCenterY = printCanvas.height / 2
        const maxRadius = Math.min(waveformWidth, waveformHeight) * 0.65
        
        printCtx.lineWidth = 8
        printCtx.lineCap = 'round'
        
        for (let i = 0; i < normalizedData.length; i++) {
          const angle = (i / normalizedData.length) * Math.PI * 2
          const length = normalizedData[i] * maxRadius
          
          const x1 = radialCenterX
          const y1 = radialCenterY
          const x2 = radialCenterX + Math.cos(angle) * length
          const y2 = radialCenterY + Math.sin(angle) * length
          
          printCtx.strokeStyle = waveformFillStyle
          printCtx.beginPath()
          printCtx.moveTo(x1, y1)
          printCtx.lineTo(x2, y2)
          printCtx.stroke()
        }
        break
        
      case 'frequency':
        // Frequency spectrum bars - PRINT
        if (normalizedData.length > 0) {
          const freqBarWidth = waveformWidth / normalizedData.length
          const freqMaxHeight = waveformHeight * 0.8
          
          for (let i = 0; i < normalizedData.length; i++) {
            const barHeight = normalizedData[i] * freqMaxHeight
            const x = waveformX + i * freqBarWidth
            const y = waveformY + (waveformHeight - barHeight) / 2
            
            if (!isFinite(x) || !isFinite(y) || !isFinite(barHeight)) continue
            
            // Gradient for each bar
            const gradient = printCtx.createLinearGradient(x, y + barHeight, x, y)
            gradient.addColorStop(0, addOpacity(currentWaveformColor, '40'))
            gradient.addColorStop(1, currentWaveformColor)
            
            printCtx.fillStyle = gradient
            printCtx.fillRect(x, y, freqBarWidth * 0.8, barHeight)
          }
        }
        break
        
      case 'galaxy':
        // Cosmic galaxy effect - PRINT
        if (normalizedData.length > 0) {
          const galaxyCenterX = printCanvas.width / 2
          const galaxyCenterY = printCanvas.height / 2
          const galaxyRadius = Math.min(waveformWidth, waveformHeight) * 0.35
          
          for (let i = 0; i < normalizedData.length; i++) {
            const angle = (i / normalizedData.length) * Math.PI * 2
            const distance = galaxyRadius * (0.5 + normalizedData[i] * 0.5)
            
            const swirl = (i / normalizedData.length) * Math.PI * 4
            const x = galaxyCenterX + Math.cos(angle + swirl * 0.3) * distance
            const y = galaxyCenterY + Math.sin(angle + swirl * 0.3) * distance
            
            const size = 4 + normalizedData[i] * 8
            const opacity = 0.3 + normalizedData[i] * 0.7
            
            printCtx.fillStyle = currentWaveformColor + Math.floor(opacity * 255).toString(16).padStart(2, '0')
            printCtx.beginPath()
            printCtx.arc(x, y, size, 0, Math.PI * 2)
            printCtx.fill()
            
            printCtx.shadowBlur = 20
            printCtx.shadowColor = currentWaveformColor
            printCtx.fill()
            printCtx.shadowBlur = 0
          }
        }
        break
        
      case 'particle':
        // Particle cloud - PRINT
        if (normalizedData.length > 0) {
          const particleCenterX = printCanvas.width / 2
          const particleCenterY = printCanvas.height / 2
          const particleSpread = Math.min(waveformWidth, waveformHeight) * 0.4
          
          for (let i = 0; i < normalizedData.length; i++) {
            const angle = (i / normalizedData.length) * Math.PI * 2
            const distance = (Math.random() * 0.5 + 0.5) * particleSpread * normalizedData[i]
            
            const x = particleCenterX + Math.cos(angle) * distance
            const y = particleCenterY + Math.sin(angle) * distance
            
            const size = 2 + normalizedData[i] * 10
            const opacity = 0.4 + normalizedData[i] * 0.6
            
            printCtx.fillStyle = currentWaveformColor + Math.floor(opacity * 255).toString(16).padStart(2, '0')
            printCtx.beginPath()
            printCtx.arc(x, y, size, 0, Math.PI * 2)
            printCtx.fill()
          }
        }
        break
        
      case 'ripple':
        // Water ripple effect - PRINT
        if (normalizedData.length > 0) {
          const rippleCenterX = printCanvas.width / 2
          const rippleCenterY = printCanvas.height / 2
          const maxRippleRadius = Math.min(waveformWidth, waveformHeight) * 0.45
          const numRipples = 8
          
          printCtx.strokeStyle = waveformFillStyle
          printCtx.lineWidth = 4
          
          for (let r = 0; r < numRipples; r++) {
            printCtx.globalAlpha = 0.6 - (r / numRipples) * 0.4
            printCtx.beginPath()
            
            for (let i = 0; i < normalizedData.length; i++) {
              const angle = (i / normalizedData.length) * Math.PI * 2
              const baseRadius = (r / numRipples) * maxRippleRadius
              const rippleEffect = normalizedData[i] * 30
              const radius = baseRadius + rippleEffect
              
              const x = rippleCenterX + Math.cos(angle) * radius
              const y = rippleCenterY + Math.sin(angle) * radius
              
              if (i === 0) printCtx.moveTo(x, y)
              else printCtx.lineTo(x, y)
            }
            
            printCtx.closePath()
            printCtx.stroke()
          }
          printCtx.globalAlpha = 1
        }
        break
        
      case 'wave':
        // Sine wave style - PRINT
        if (normalizedData.length > 1) {
          const waveCenterY = waveformY + waveformHeight / 2
          
          printCtx.strokeStyle = waveformFillStyle
          printCtx.lineWidth = 6
          printCtx.lineCap = 'round'
          printCtx.lineJoin = 'round'
          
          printCtx.beginPath()
          
          for (let i = 0; i < normalizedData.length; i++) {
            const x = waveformX + (i / normalizedData.length) * waveformWidth
            const y = waveCenterY + (normalizedData[i] - 0.5) * waveformHeight
            
            if (i === 0) printCtx.moveTo(x, y)
            else printCtx.lineTo(x, y)
          }
          
          printCtx.stroke()
        }
        break
        
      case 'glow':
        // Glowing bars with blur - PRINT
        for (let i = 0; i < normalizedData.length; i++) {
          const x = waveformX + (i / normalizedData.length) * waveformWidth
          const barHeight = normalizedData[i] * waveformHeight
          const y = waveformY + (waveformHeight - barHeight) / 2
          
          printCtx.shadowBlur = 30
          printCtx.shadowColor = currentWaveformColor
          printCtx.fillStyle = waveformFillStyle
          printCtx.fillRect(x, y, barWidth, barHeight)
        }
        printCtx.shadowBlur = 0
        break
        
      default:
        // Fallback to bars
        for (let i = 0; i < normalizedData.length; i++) {
          const x = waveformX + (i / normalizedData.length) * waveformWidth
          const barHeight = normalizedData[i] * waveformHeight
          const y = waveformY + (waveformHeight - barHeight) / 2
          
          printCtx.fillRect(x, y, barWidth, barHeight)
        }
    }
    
    // Add text overlays if enabled
    if (currentShowText && currentCustomText) {
      const scaledFontSize = currentFontSize * (printCanvas.width / 900) // Scale font size with resolution
      printCtx.fillStyle = currentTextColor
      printCtx.textAlign = 'center'
      printCtx.font = `${scaledFontSize}px ${currentFontFamily}, sans-serif`
      
      // Convert percentage position to pixels
      const textX = (currentTextX / 100) * printCanvas.width
      const textY = (currentTextY / 100) * printCanvas.height
      
      printCtx.fillText(currentCustomText, textX, textY)
    }
    
    // Add QR code if enabled
    if (currentShowQRCode && currentQrCodeUrl) {
      try {
        // Use customizable size (percentage of canvas width)
        const qrSize = Math.floor(printCanvas.width * (currentQrCodeSize / 100))
        const qrDataUrl = await QRCode.toDataURL(currentQrCodeUrl, {
          width: qrSize,
          margin: 1,
          color: {
            dark: currentWaveformColor, // Use waveform color instead of text color
            light: '#00000000' // Transparent background
          }
        })
        
        const qrImage = new Image()
        await new Promise<void>((resolve, reject) => {
          qrImage.onload = () => resolve()
          qrImage.onerror = reject
          qrImage.src = qrDataUrl
        })
        
        // Use custom X/Y position (percentages)
        // Position is center-based, so we offset by half the QR size
        const qrX = (currentQrCodeX / 100) * printCanvas.width - qrSize / 2
        const qrY = (currentQrCodeY / 100) * printCanvas.height - qrSize / 2
        
        printCtx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }
    
    console.log('[getPrintFile] Generating PNG data URL...')
    const dataUrl = printCanvas.toDataURL('image/png')
    console.log('[getPrintFile] PNG generated, length:', dataUrl.length)
    return dataUrl
  }
  
  // Expose canvas ref and print function to parent
  // Use a getter pattern so the canvas is always current
  useImperativeHandle(ref, () => ({
    get canvas() {
      return canvasRef.current
    },
    getPrintFile
  }), [getPrintFile])
  
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const waveformUseGradient = useCustomizerStore((state) => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore((state) => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore((state) => state.waveformGradientDirection)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundUseGradient = useCustomizerStore((state) => state.backgroundUseGradient)
  const backgroundGradientStops = useCustomizerStore((state) => state.backgroundGradientStops)
  const backgroundGradientDirection = useCustomizerStore((state) => state.backgroundGradientDirection)
  const selectedProduct = useCustomizerStore((state) => state.selectedProduct)
  const selectedSize = useCustomizerStore((state) => state.selectedSize)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const waveformSize = useCustomizerStore((state) => state.waveformSize) || 50
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier) || 100
  const showText = useCustomizerStore((state) => state.showText)
  const songTitle = useCustomizerStore((state) => state.songTitle)
  const artistName = useCustomizerStore((state) => state.artistName)
  const customDate = useCustomizerStore((state) => state.customDate)
  const customText = useCustomizerStore((state) => state.customText)
  const textColor = useCustomizerStore((state) => state.textColor)
  const textUseGradient = useCustomizerStore((state) => state.textUseGradient)
  const textGradientStops = useCustomizerStore((state) => state.textGradientStops)
  const textGradientDirection = useCustomizerStore((state) => state.textGradientDirection)
  const textX = useCustomizerStore((state) => state.textX)
  const textY = useCustomizerStore((state) => state.textY)
  const fontFamily = useCustomizerStore((state) => state.fontFamily)
  const fontSize = useCustomizerStore((state) => state.fontSize)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundImagePosition = useCustomizerStore((state) => state.backgroundImagePosition)
  const backgroundFocalPoint = useCustomizerStore((state) => state.backgroundFocalPoint)
  const showQRCode = useCustomizerStore((state) => state.showQRCode)
  const qrCodeUrl = useCustomizerStore((state) => state.qrCodeUrl)
  const qrCodePosition = useCustomizerStore((state) => state.qrCodePosition)
  const qrCodeSize = useCustomizerStore((state) => state.qrCodeSize) || 8
  const qrCodeX = useCustomizerStore((state) => state.qrCodeX) || 85
  const qrCodeY = useCustomizerStore((state) => state.qrCodeY) || 85
  const detectedWords = useCustomizerStore((state) => state.detectedWords)
  const showArtisticText = useCustomizerStore((state) => state.showArtisticText)
  const artisticTextStyle = useCustomizerStore((state) => state.artisticTextStyle)
  const artisticTextColor = useCustomizerStore((state) => state.artisticTextColor)
  const artisticTextOpacity = useCustomizerStore((state) => state.artisticTextOpacity)

  // Load Google Font for canvas rendering
  useEffect(() => {
    // Reset fontLoaded to false when font changes to trigger re-render after loading
    setFontLoaded(false)
    
    if (fontFamily && fontFamily !== 'Arial' && fontFamily !== 'sans-serif') {
      const fontLinkId = `font-${fontFamily.replace(/\s+/g, '-')}`
      
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement('link')
        link.id = fontLinkId
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
        link.rel = 'stylesheet'
        document.head.appendChild(link)
      }
      
      // Wait for the SPECIFIC font to load with a timeout fallback
      if (document.fonts) {
        const fontSpec = `400 16px "${fontFamily}"`
        console.log('🔤 Loading font:', fontSpec)
        
        // Use Promise.race to add a timeout
        const loadPromise = document.fonts.load(fontSpec)
        const timeoutPromise = new Promise<void>((resolve) => setTimeout(() => resolve(), 2000))
        
        Promise.race([loadPromise, timeoutPromise])
          .then(() => {
            // Double-check font is actually ready by checking document.fonts.check
            const checkFont = () => {
              if (document.fonts.check(fontSpec)) {
                console.log('✅ Font verified ready:', fontFamily)
                setFontLoaded(true)
              } else {
                // Font not ready yet, try again in 50ms
                setTimeout(checkFont, 50)
              }
            }
            checkFont()
          })
          .catch((error) => {
            console.error('❌ Font load failed:', fontFamily, error)
            setFontLoaded(true) // Still mark as loaded to prevent blocking
          })
      } else {
        setFontLoaded(true)
      }
    } else {
      setFontLoaded(true) // Standard fonts are always available
    }
  }, [fontFamily])

  // Set canvasReady when canvas ref is available
  // This needs to run after render to check if canvas exists
  useEffect(() => {
    if (canvasRef.current && !canvasReady) {
      setCanvasReady(true)
    }
  }) // No dependency array - runs after every render, but only sets state once

  useEffect(() => {
    console.log('🎨🎨🎨 MAIN USEEFFECT TRIGGERED')
    console.log('🎨 GRADIENT STATE at useEffect entry:', { 
      waveformUseGradient,
      waveformGradientStopsLength: waveformGradientStops?.length,
      waveformGradientDirection,
      backgroundUseGradient
    })
    console.log('ProductMockup render:', { 
      audioUrl: !!audioUrl, 
      canvasReady, 
      hasCanvas: !!canvasRef.current,
      showText,
      customText,
      textX,
      textY,
      fontSize,
      fontFamily,
      fontLoaded,
      textColor
    })
    
    // Don't render until font is loaded - this ensures we wait for first font load
    if (!fontLoaded && fontFamily !== 'Arial' && fontFamily !== 'sans-serif') {
      console.log('⏳ Waiting for font to load:', fontFamily)
      return
    }
    
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Track if this render is still valid
    let isCancelled = false
    
    // Make the effect async to handle QR code rendering
    const renderCanvas = async () => {
    
    console.log('🖼️ renderCanvas called, waveformUseGradient=', waveformUseGradient)
    
    // Disable image smoothing for sharper rendering
    ctx.imageSmoothingEnabled = false
    
    // Determine if this is effectively a "full audio" selection
    // Round to 2 decimal places to avoid floating point issues
    const regionStart = selectedRegion?.start ? Math.round(selectedRegion.start * 100) / 100 : 0
    const audioDur = useCustomizerStore.getState().audioDuration
    const isFullAudio = !selectedRegion || (regionStart === 0 && selectedRegion.end >= audioDur - 0.1)
    
    // Create a key for ONLY waveform properties (audio data and waveform styling)
    const waveformKey = JSON.stringify({
      audioUrl,
      waveformColor,
      waveformUseGradient,
      waveformGradientStops,
      waveformGradientDirection,
      waveformStyle,
      waveformSize,
      waveformHeightMultiplier,
      backgroundColor,
      backgroundUseGradient,
      backgroundGradientStops,
      backgroundGradientDirection,
      backgroundImage,
      backgroundImagePosition,
      backgroundFocalPoint,
      selectedProduct,
      selectedSize,
      // Use stable region representation - treat full audio the same whether null or explicit
      regionKey: isFullAudio ? 'full' : `${regionStart}-${Math.round((selectedRegion?.end || 0) * 100) / 100}`,
      canvasWidth,
      canvasHeight,
    })
    
    // Create a key for text/overlay properties (everything that goes on top of waveform)
    const overlayKey = JSON.stringify({
      showText,
      customText,
      fontFamily,
      fontSize,
      textColor,
      textUseGradient,
      textGradientStops,
      textGradientDirection,
      textX,
      textY,
      showQRCode,
      qrCodeUrl,
      qrCodePosition,
      qrCodeSize,
      qrCodeX,
      qrCodeY
    })
    
    // Detect what changed
    const waveformChanged = waveformKey !== lastWaveformKey.current
    const overlayChanged = overlayKey !== lastOverlayKey.current
    const canUseCache = !!waveformImageData.current
    
    console.log('🔄 MAIN RENDER CHECK:', {
      waveformUseGradient,
      waveformGradientDirection,
      waveformGradientStopsCount: waveformGradientStops?.length,
      waveformChanged,
      overlayChanged,
      canUseCache,
    })
    
    if (overlayChanged) {
      console.log('📝 Overlay properties changed:', {
        fontFamily,
        fontSize,
        customText,
        showText
      })
    }
    
    console.log('🔍 Render decision:', {
      waveformChanged,
      overlayChanged,
      canUseCache,
      willUseOverlayFastPath: !waveformChanged && overlayChanged && canUseCache,
      willDoFullRegen: waveformChanged,
      waveformSize
    })
    
    // If waveform unchanged but overlay changed, use overlay fast path
    if (!waveformChanged && overlayChanged && canUseCache) {
      console.log('✨ OVERLAY FAST PATH: Restoring waveform and redrawing overlays')
      
      lastOverlayKey.current = overlayKey
      
      // Restore the cached waveform canvas
      if (waveformImageData.current) {
        ctx.putImageData(waveformImageData.current, 0, 0)
        console.log('✅ Restored waveform from cache')
      }
      
      // Render text overlay
      const state = useCustomizerStore.getState()
      if (state.showText && state.customText) {
        // Wait for font to be ready before rendering
        const fontSpec = `${state.fontSize}px "${state.fontFamily}"`
        if (document.fonts && state.fontFamily !== 'Arial' && state.fontFamily !== 'sans-serif') {
          await document.fonts.load(fontSpec).catch(() => {
            console.warn('Font load failed in overlay path, using fallback')
          })
        }
        
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `${state.fontSize}px "${state.fontFamily}", sans-serif`
        const textXPos = (state.textX / 100) * canvas.width
        const textYPos = (state.textY / 100) * canvas.height
        
        // Apply gradient or solid color
        if (state.textUseGradient) {
          let textGradient
          if (state.textGradientDirection === 'radial') {
            textGradient = ctx.createRadialGradient(textXPos, textYPos, 0, textXPos, textYPos, state.fontSize * 2)
          } else if (state.textGradientDirection === 'horizontal') {
            textGradient = ctx.createLinearGradient(textXPos - state.fontSize * 2, textYPos, textXPos + state.fontSize * 2, textYPos)
          } else if (state.textGradientDirection === 'vertical') {
            textGradient = ctx.createLinearGradient(textXPos, textYPos - state.fontSize, textXPos, textYPos + state.fontSize)
          } else { // diagonal
            textGradient = ctx.createLinearGradient(textXPos - state.fontSize, textYPos - state.fontSize, textXPos + state.fontSize, textYPos + state.fontSize)
          }
          const sortedStops = [...state.textGradientStops].sort((a, b) => a.position - b.position)
          sortedStops.forEach(stop => {
            textGradient.addColorStop(stop.position, stop.color)
          })
          ctx.fillStyle = textGradient
        } else {
          ctx.fillStyle = state.textColor
        }
        
        console.log('📍 FAST PATH text render:', { 
          textX: state.textX, 
          textY: state.textY, 
          textXPos, 
          textYPos,
          fontSize: state.fontSize,
          fontFamily: state.fontFamily,
          useGradient: state.textUseGradient,
          text: state.customText
        })
        ctx.fillText(state.customText, textXPos, textYPos)
      }
      
      // Render QR overlay - await to prevent duplicates when position changes quickly
      if (state.showQRCode && state.qrCodeUrl) {
        try {
          const qrSizePercent = state.qrCodeSize || 8
          const qrSize = Math.floor(canvas.width * (qrSizePercent / 100))
          const qrDataUrl = await QRCode.toDataURL(state.qrCodeUrl, { 
            width: qrSize, 
            margin: 1,
            color: {
              dark: state.waveformColor,
              light: '#00000000'
            }
          })
          
          // Check if render was cancelled before drawing
          if (isCancelled) {
            console.log('🚫 QR render cancelled')
            return
          }
          
          const qrImg = new Image()
          await new Promise<void>((resolve, reject) => {
            qrImg.onload = () => {
              // Check again before drawing in case cancelled during load
              if (isCancelled) {
                resolve()
                return
              }
              // Use custom X/Y position
              const qrX = ((state.qrCodeX || 92) / 100) * canvas.width - qrSize / 2
              const qrY = ((state.qrCodeY || 92) / 100) * canvas.height - qrSize / 2
              ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
              resolve()
            }
            qrImg.onerror = reject
            qrImg.src = qrDataUrl
          })
        } catch (error) {
          console.error('QR code rendering error:', error)
        }
      }
      console.log('✨ OVERLAY FAST PATH complete')
      return
    }
    
    // If nothing changed, skip render
    if (!waveformChanged && !overlayChanged) {
      console.log('⏭️ No changes detected, skipping render')
      return
    }
    
    // Full regeneration needed - set canvas dimensions (this clears the canvas)
    console.log('🔄 Full regeneration: waveform properties changed')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    
    lastWaveformKey.current = waveformKey
    lastOverlayKey.current = overlayKey
    
    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (backgroundUseGradient) {
      let bgGradient
      if (backgroundGradientDirection === 'radial') {
        bgGradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        )
      } else if (backgroundGradientDirection === 'horizontal') {
        bgGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      } else if (backgroundGradientDirection === 'vertical') {
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      } else { // diagonal
        bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      }
      const sortedStops = [...backgroundGradientStops].sort((a, b) => a.position - b.position)
      sortedStops.forEach(stop => {
        bgGradient.addColorStop(stop.position, stop.color)
      })
      ctx.fillStyle = bgGradient
    } else {
      ctx.fillStyle = backgroundColor
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.08)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (!audioUrl || !canvasReady) {
      console.log('Skipping waveform generation:', { audioUrl: !!audioUrl, canvasReady })
      setIsGenerating(false)
      return
    }

    console.log('Starting waveform generation...')
    setIsGenerating(true)

    fetch(audioUrl)
      .then(response => {
        console.log('Fetch response:', response.status)
        return response.arrayBuffer()
      })
      .then(arrayBuffer => {
        console.log('Got arrayBuffer, size:', arrayBuffer.byteLength)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        return audioContext.decodeAudioData(arrayBuffer)
      })
      .then(audioBuffer => {
        console.log('Decoded audio, duration:', audioBuffer.duration)
        
        // Draw background image if provided (wait for it to load)
        const backgroundPromise = backgroundImage
          ? new Promise<void>((resolve) => {
              const img = new Image()
              img.onload = () => {
                // Calculate dimensions to cover canvas while maintaining aspect ratio
                const imgAspect = img.width / img.height
                const canvasAspect = canvas.width / canvas.height
                let drawWidth, drawHeight, offsetX, offsetY
                
                if (imgAspect > canvasAspect) {
                  // Image is wider - fit to height
                  drawHeight = canvas.height
                  drawWidth = drawHeight * imgAspect
                  
                  // Use focal point if set, otherwise fall back to position
                  if (backgroundFocalPoint) {
                    console.log('🎯 Using focal point (horizontal):', backgroundFocalPoint)
                    // Calculate offset to center the focal point
                    const focalPointPixelX = (backgroundFocalPoint.x / 100) * img.width
                    const scaledFocalPointX = (focalPointPixelX / img.width) * drawWidth
                    offsetX = (canvas.width / 2) - scaledFocalPointX
                    // Clamp to prevent going past edges
                    const minOffsetX = canvas.width - drawWidth
                    const maxOffsetX = 0
                    offsetX = Math.max(minOffsetX, Math.min(maxOffsetX, offsetX))
                    console.log('📐 Calculated offsetX:', offsetX, { focalPointPixelX, scaledFocalPointX, canvasWidth: canvas.width, drawWidth, clamped: [minOffsetX, maxOffsetX] })
                  } else if (backgroundImagePosition === 'left') {
                    offsetX = 0
                  } else if (backgroundImagePosition === 'right') {
                    offsetX = canvas.width - drawWidth
                  } else {
                    offsetX = (canvas.width - drawWidth) / 2
                  }
                  offsetY = 0
                } else {
                  // Image is taller - fit to width
                  drawWidth = canvas.width
                  drawHeight = drawWidth / imgAspect
                  offsetX = 0
                  
                  // Use focal point if set, otherwise fall back to position
                  if (backgroundFocalPoint) {
                    console.log('🎯 Using focal point (vertical):', backgroundFocalPoint)
                    // Calculate offset to center the focal point
                    const focalPointPixelY = (backgroundFocalPoint.y / 100) * img.height
                    const scaledFocalPointY = (focalPointPixelY / img.height) * drawHeight
                    offsetY = (canvas.height / 2) - scaledFocalPointY
                    // Clamp to prevent going past edges
                    const minOffsetY = canvas.height - drawHeight
                    const maxOffsetY = 0
                    offsetY = Math.max(minOffsetY, Math.min(maxOffsetY, offsetY))
                    console.log('📐 Calculated offsetY:', offsetY, { focalPointPixelY, scaledFocalPointY, canvasHeight: canvas.height, drawHeight, clamped: [minOffsetY, maxOffsetY] })
                  } else if (backgroundImagePosition === 'top') {
                    offsetY = 0
                  } else if (backgroundImagePosition === 'bottom') {
                    offsetY = canvas.height - drawHeight
                  } else {
                    offsetY = (canvas.height - drawHeight) / 2
                  }
                }
                
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
                resolve()
              }
              img.onerror = () => resolve() // Continue even if image fails to load
              img.src = backgroundImage
            })
          : Promise.resolve()
        
        return backgroundPromise.then(() => audioBuffer)
      })
      .then(async (audioBuffer) => {
        // Check if render was cancelled
        if (isCancelled) {
          console.log('Render cancelled before waveform generation')
          return
        }
        
        const rawData = audioBuffer.getChannelData(0)
        const sampleRate = audioBuffer.sampleRate
        
        // Calculate the start and end samples based on selected region
        let startSample = 0
        let endSample = rawData.length
        
        // Check if we have a valid selection (not null, and end > start)
        // Treat {start: 0, end: 0} as "no selection" since it means 0 samples
        const hasValidSelection = selectedRegion && selectedRegion.end > selectedRegion.start
        
        if (hasValidSelection) {
          startSample = Math.floor(selectedRegion.start * sampleRate)
          endSample = Math.floor(selectedRegion.end * sampleRate)
          console.log('📍 Using selected region:', { start: selectedRegion.start, end: selectedRegion.end, startSample, endSample })
        } else {
          console.log('📍 No valid selection - using entire audio:', { startSample: 0, endSample: rawData.length, totalSamples: rawData.length, selectedRegion })
        }
        
        // Extract only the selected region
        const regionData = rawData.slice(startSample, endSample)
        console.log('📊 Region data length:', regionData.length, 'samples')
        
        // Calculate max amplitude from ENTIRE audio file, not just the selected region
        // This ensures bars are relative to the full audio's loudness
        let globalMax = 0
        for (let i = 0; i < rawData.length; i++) {
          const abs = Math.abs(rawData[i])
          if (abs > globalMax) globalMax = abs
        }
        
        // Calculate waveform dimensions based on canvas size
        // Scale margin proportionally with canvas size (canvas is at 300 DPI: width in inches = pixels / 300)
        // Use 5-10% margin depending on canvas dimensions
        const aspectRatio = canvas.width / canvas.height
        
        // Calculate margin as percentage of smallest dimension
        let marginPercent = 0.08 // 8% default margin
        if (aspectRatio > 1.5) {
          // Wide formats (like 36x24, 24x18) - need more horizontal margin
          marginPercent = 0.10
        } else if (aspectRatio < 0.8) {
          // Narrow formats (like 12x16) - need more vertical margin
          marginPercent = 0.12
        } else if (aspectRatio === 1) {
          // Square format (12x12)
          marginPercent = 0.09
        }
        
        const minMargin = Math.min(canvas.width, canvas.height) * marginPercent
        const maxAvailableWidth = canvas.width - (minMargin * 2)
        const maxAvailableHeight = canvas.height - (minMargin * 2)
        
        // Buffer percentage - small buffer to prevent waveform from touching absolute edges
        const bufferPercent = 0.02 // 2% buffer on each side (reduced to allow edge-to-edge)
        const bufferWidth = canvas.width * bufferPercent
        const bufferHeight = canvas.height * bufferPercent
        const maxAllowedWidth = canvas.width - (bufferWidth * 2)
        const maxAllowedHeight = canvas.height - (bufferHeight * 2)
        
        // Apply waveformSize percentage to available space
        // Height is doubled to allow more vertical space (50% slider = 100% height)
        const unclampedWaveformWidth = maxAvailableWidth * (waveformSize / 100)
        const unclamppedWaveformHeight = maxAvailableHeight * 0.7 * (waveformSize / 100) * 2
        
        // Amplitude multiplier - makes bars "louder" (taller) without changing container
        const amplitudeMultiplier = (waveformHeightMultiplier || 100) / 100
        // Clamp both width and height to prevent overflow, leaving buffer
        const waveformWidth = Math.min(unclampedWaveformWidth, maxAllowedWidth)
        const waveformHeight = Math.min(unclamppedWaveformHeight, maxAllowedHeight)
        const padding = (canvas.width - waveformWidth) / 2
        const waveformX = padding
        const waveformY = (canvas.height - waveformHeight) / 2
        
        console.log('📐 Waveform dimensions:', { waveformSize, waveformWidth, waveformHeight, unclamped: unclamppedWaveformHeight, maxAllowed: maxAllowedHeight, canvasWidth: canvas.width, canvasHeight: canvas.height })
        
        const barWidth = 6
        const barGap = 1
        const barTotalWidth = barWidth + barGap
        // Calculate samples based on waveformWidth for proper proportional sizing
        const samples = Math.floor(waveformWidth / barTotalWidth)
        
        console.log('📊 Waveform bars:', { samples, barWidth, barGap, totalBars: samples })
        
        // Ensure we have enough data to create meaningful samples
        const blockSize = Math.max(1, Math.floor(regionData.length / samples))
        const filteredData = []
        
        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i
          const blockEnd = Math.min(blockStart + blockSize, regionData.length)
          let sum = 0
          let count = 0
          
          for (let j = blockStart; j < blockEnd; j++) {
            sum += Math.abs(regionData[j])
            count++
          }
          
          filteredData.push(count > 0 ? sum / count : 0)
        }
        
        // Use global max from entire audio instead of just the filtered region
        // Apply amplitude multiplier to make bars "louder" - clamp to 1.0 to prevent overflow
        const normalizedData = filteredData.map(n => Math.min(1, (n / globalMax) * amplitudeMultiplier))
        
        // Create waveform color or gradient
        let waveformFillStyle: string | CanvasGradient
        console.log('🎨 Waveform gradient settings:', { 
          waveformUseGradient, 
          waveformGradientDirection,
          waveformGradientStops,
          waveformColor,
          waveformX,
          waveformY,
          waveformWidth,
          waveformHeight
        })
        if (waveformUseGradient && waveformGradientStops && waveformGradientStops.length >= 2) {
          console.log('🌈 Creating waveform gradient...')
          let waveGradient
          if (waveformGradientDirection === 'radial') {
            console.log('🌈 Creating RADIAL gradient')
            waveGradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 0,
              canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            )
          } else if (waveformGradientDirection === 'horizontal') {
            console.log('🌈 Creating HORIZONTAL gradient from', waveformX, 'to', waveformX + waveformWidth)
            waveGradient = ctx.createLinearGradient(waveformX, 0, waveformX + waveformWidth, 0)
          } else if (waveformGradientDirection === 'vertical') {
            console.log('🌈 Creating VERTICAL gradient from', waveformY, 'to', waveformY + waveformHeight)
            waveGradient = ctx.createLinearGradient(0, waveformY, 0, waveformY + waveformHeight)
          } else { // diagonal
            console.log('🌈 Creating DIAGONAL gradient')
            waveGradient = ctx.createLinearGradient(waveformX, waveformY, waveformX + waveformWidth, waveformY + waveformHeight)
          }
          // Add all gradient stops
          const sortedStops = [...waveformGradientStops].sort((a, b) => a.position - b.position)
          console.log('🌈 Adding gradient stops:', sortedStops)
          sortedStops.forEach(stop => {
            console.log('  Adding stop:', stop.position, stop.color)
            waveGradient.addColorStop(stop.position, stop.color)
          })
          waveformFillStyle = waveGradient
          console.log('✅ Waveform gradient created successfully')
        } else {
          console.log('⚪ Using solid waveform color:', waveformColor)
          waveformFillStyle = waveformColor
        }
        
        console.log('🎯 Setting ctx.fillStyle to:', typeof waveformFillStyle === 'string' ? waveformFillStyle : 'CanvasGradient')
        
        ctx.fillStyle = waveformFillStyle
        ctx.strokeStyle = waveformFillStyle // Also set strokeStyle for stroke-based styles
        
        // Render based on selected style
        switch (waveformStyle) {
          case 'bars':
            // Classic vertical bars - scale positions to fit within waveformWidth
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * waveformHeight
              const x = Math.round(waveformX + (i / normalizedData.length) * waveformWidth)
              const y = Math.round(waveformY + (waveformHeight - barHeight) / 2)
              
              ctx.beginPath()
              ctx.roundRect(x, y, barWidth, Math.round(barHeight), 2)
              ctx.fill()
            }
            break
            
          case 'mirror':
            // Mirrored waveform (top and bottom)
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = (normalizedData[i] * waveformHeight) / 2
              const x = Math.round(waveformX + (i / normalizedData.length) * waveformWidth)
              const centerY = Math.round(waveformY + waveformHeight / 2)
              
              // Top half
              ctx.beginPath()
              ctx.roundRect(x, Math.round(centerY - barHeight), barWidth, Math.round(barHeight), 2)
              ctx.fill()
              
              // Bottom half
              ctx.beginPath()
              ctx.roundRect(x, centerY, barWidth, Math.round(barHeight), 2)
              ctx.fill()
            }
            break
            
          case 'dots':
            // Dotted pattern
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * waveformHeight
              const x = Math.round(waveformX + (i / normalizedData.length) * waveformWidth + barWidth / 2)
              const centerY = Math.round(waveformY + waveformHeight / 2)
              const numDots = Math.max(3, Math.floor((barHeight / waveformHeight) * 15))
              
              for (let j = 0; j < numDots; j++) {
                const dotY = Math.round(centerY - (barHeight / 2) + (j * barHeight) / (numDots - 1))
                ctx.beginPath()
                ctx.arc(x, dotY, 2.5, 0, Math.PI * 2)
                ctx.fill()
              }
            }
            break
            
          case 'circular':
            // Circular visualization with independent width/height control
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            // Use width for base radius, height for amplitude scaling
            const baseRadius = waveformWidth * 0.35
            const heightScale = (waveformHeight / waveformWidth) * ((waveformHeightMultiplier || 100) / 100)
            
            ctx.lineWidth = 12
            ctx.strokeStyle = waveformFillStyle // Support gradient
            
            for (let i = 0; i < normalizedData.length; i++) {
              const angle = (i / normalizedData.length) * Math.PI * 2 - Math.PI / 2
              const amplitude = normalizedData[i] * baseRadius * 1.2 * heightScale
              const innerRadius = baseRadius - amplitude / 2
              const outerRadius = baseRadius + amplitude / 2
              
              const x1 = centerX + Math.cos(angle) * innerRadius
              const y1 = centerY + Math.sin(angle) * innerRadius
              const x2 = centerX + Math.cos(angle) * outerRadius
              const y2 = centerY + Math.sin(angle) * outerRadius
              
              ctx.beginPath()
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
              ctx.stroke()
            }
            break
            
          case 'radial':
            // Radial burst effect
            const radialCenterX = canvas.width / 2
            const radialCenterY = canvas.height / 2
            const maxRadius = Math.min(waveformWidth, waveformHeight) * 0.65
            
            for (let i = 0; i < normalizedData.length; i++) {
              const angle = (i / normalizedData.length) * Math.PI * 2
              const length = normalizedData[i] * maxRadius
              
              const x1 = radialCenterX
              const y1 = radialCenterY
              const x2 = radialCenterX + Math.cos(angle) * length
              const y2 = radialCenterY + Math.sin(angle) * length
              
              ctx.strokeStyle = waveformFillStyle
              ctx.lineWidth = 8
              ctx.lineCap = 'round'
              
              ctx.beginPath()
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
              ctx.stroke()
            }
            break
            
          case 'galaxy':
            // Cosmic galaxy effect
            const galaxyCenterX = canvas.width / 2
            const galaxyCenterY = canvas.height / 2
            const galaxyRadius = Math.min(waveformWidth, waveformHeight) * 0.35
            
            if (normalizedData.length === 0) break
            
            for (let i = 0; i < normalizedData.length; i++) {
              const angle = (i / normalizedData.length) * Math.PI * 2
              const distance = galaxyRadius * (0.5 + normalizedData[i] * 0.5)
              
              // Create swirling effect
              const swirl = (i / normalizedData.length) * Math.PI * 4
              const x = galaxyCenterX + Math.cos(angle + swirl * 0.3) * distance
              const y = galaxyCenterY + Math.sin(angle + swirl * 0.3) * distance
              
              const size = 2 + normalizedData[i] * 4
              const opacity = 0.3 + normalizedData[i] * 0.7
              
              ctx.fillStyle = waveformColor + Math.floor(opacity * 255).toString(16).padStart(2, '0')
              ctx.beginPath()
              ctx.arc(x, y, size, 0, Math.PI * 2)
              ctx.fill()
              
              // Add glow effect
              ctx.shadowBlur = 10
              ctx.shadowColor = waveformColor
              ctx.fill()
              ctx.shadowBlur = 0
            }
            break
            
          case 'frequency':
            // Frequency spectrum bars
            if (normalizedData.length === 0) break
            
            const freqBarWidth = waveformWidth / normalizedData.length
            const freqMaxHeight = waveformHeight * 0.8
            
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * freqMaxHeight
              const x = waveformX + i * freqBarWidth
              const y = waveformY + (waveformHeight - barHeight) / 2
              
              // Skip if values are not finite
              if (!isFinite(x) || !isFinite(y) || !isFinite(barHeight)) continue
              
              // Gradient for each bar
              const gradient = ctx.createLinearGradient(x, y + barHeight, x, y)
              gradient.addColorStop(0, addOpacity(waveformColor, '40'))
              gradient.addColorStop(1, waveformColor)
              
              ctx.fillStyle = gradient
              ctx.fillRect(x, y, freqBarWidth * 0.8, barHeight)
            }
            break
            
          case 'particle':
            // Particle cloud
            if (normalizedData.length === 0) break
            
            const particleCenterX = canvas.width / 2
            const particleCenterY = canvas.height / 2
            const particleSpread = Math.min(waveformWidth, waveformHeight) * 0.4
            
            for (let i = 0; i < normalizedData.length; i++) {
              const angle = (i / normalizedData.length) * Math.PI * 2
              const distance = (Math.random() * 0.5 + 0.5) * particleSpread * normalizedData[i]
              
              const x = particleCenterX + Math.cos(angle) * distance
              const y = particleCenterY + Math.sin(angle) * distance
              
              const size = 1 + normalizedData[i] * 5
              const opacity = 0.4 + normalizedData[i] * 0.6
              
              ctx.fillStyle = waveformColor + Math.floor(opacity * 255).toString(16).padStart(2, '0')
              ctx.beginPath()
              ctx.arc(x, y, size, 0, Math.PI * 2)
              ctx.fill()
            }
            break
            
          case 'ripple':
            // Water ripple effect
            const rippleCenterX = canvas.width / 2
            const rippleCenterY = canvas.height / 2
            const maxRippleRadius = Math.min(waveformWidth, waveformHeight) * 0.45
            const numRipples = 8
            
            ctx.strokeStyle = waveformFillStyle
            ctx.lineWidth = 2
            
            for (let r = 0; r < numRipples; r++) {
              const rippleProgress = r / numRipples
              const baseRadius = rippleProgress * maxRippleRadius
              
              ctx.beginPath()
              for (let i = 0; i <= normalizedData.length; i++) {
                const angle = (i / normalizedData.length) * Math.PI * 2
                const dataIndex = i % normalizedData.length
                const amplitude = normalizedData[dataIndex] * 30 * (1 - rippleProgress)
                const radius = baseRadius + amplitude
                
                const x = rippleCenterX + Math.cos(angle) * radius
                const y = rippleCenterY + Math.sin(angle) * radius
                
                if (i === 0) {
                  ctx.moveTo(x, y)
                } else {
                  ctx.lineTo(x, y)
                }
              }
              ctx.closePath()
              ctx.globalAlpha = 1 - rippleProgress * 0.7
              ctx.stroke()
            }
            ctx.globalAlpha = 1
            break
            
          case 'soundwave':
            // Concentric rings
            const ringCenterX = canvas.width / 2
            const ringCenterY = canvas.height / 2
            const maxRingRadius = Math.min(waveformWidth, waveformHeight) * 0.4
            const segmentsPerRing = normalizedData.length
            
            for (let ring = 0; ring < 5; ring++) {
              const ringRadius = (ring + 1) * (maxRingRadius / 5)
              
              ctx.beginPath()
              for (let i = 0; i <= segmentsPerRing; i++) {
                const angle = (i / segmentsPerRing) * Math.PI * 2
                const dataIndex = i % normalizedData.length
                const thickness = normalizedData[dataIndex] * 20
                const radius = ringRadius + thickness
                
                const x = ringCenterX + Math.cos(angle) * radius
                const y = ringCenterY + Math.sin(angle) * radius
                
                if (i === 0) {
                  ctx.moveTo(x, y)
                } else {
                  ctx.lineTo(x, y)
                }
              }
              ctx.closePath()
              ctx.fillStyle = waveformColor + Math.floor((1 - ring * 0.15) * 255).toString(16).padStart(2, '0')
              ctx.fill()
            }
            break
            
          case 'wave3d':
            // 3D perspective wave
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * waveformHeight
              const x = waveformX + i * (barWidth + barGap)
              const depth = i / normalizedData.length
              const scale = 0.5 + (depth * 0.5)
              const scaledHeight = barHeight * scale
              const y = waveformY + (waveformHeight - scaledHeight) / 2
              
              // Shadow for depth
              ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
              ctx.fillRect(x + 2, y + 2, barWidth * scale, scaledHeight)
              
              // Main bar
              ctx.fillStyle = waveformFillStyle
              const alpha = Math.floor(255 * (0.5 + depth * 0.5)).toString(16).padStart(2, '0')
              ctx.fillStyle = waveformColor + alpha
              ctx.fillRect(x, y, barWidth * scale, scaledHeight)
            }
            break
            
          case 'neon':
            // Neon glow effect
            ctx.shadowBlur = 20
            ctx.shadowColor = waveformColor
            
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * waveformHeight
              const x = waveformX + i * (barWidth + barGap)
              const y = waveformY + (waveformHeight - barHeight) / 2
              
              // Outer glow
              ctx.shadowBlur = 30
              ctx.fillStyle = waveformFillStyle
              ctx.fillRect(x, y, barWidth, barHeight)
              
              // Inner bright core
              ctx.shadowBlur = 10
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(x + barWidth * 0.25, y, barWidth * 0.5, barHeight)
            }
            ctx.shadowBlur = 0
            break
            
          case 'gradient-bars':
            // Gradient colored bars
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * waveformHeight
              const x = waveformX + i * (barWidth + barGap)
              const y = waveformY + (waveformHeight - barHeight) / 2
              
              const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
              const hue = (i / normalizedData.length) * 360
              gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`)
              gradient.addColorStop(0.5, `hsl(${hue}, 100%, 50%)`)
              gradient.addColorStop(1, `hsl(${hue}, 100%, 40%)`)
              
              ctx.fillStyle = gradient
              ctx.fillRect(x, y, barWidth, barHeight)
            }
            break
            
          case 'vinyl':
            // Vinyl record grooves
            const vinylCenterX = canvas.width / 2
            const vinylCenterY = canvas.height / 2
            const vinylMaxRadius = Math.min(waveformWidth, waveformHeight) * 0.45
            
            for (let i = 0; i < normalizedData.length; i++) {
              const angle = (i / normalizedData.length) * Math.PI * 2
              const grooveDepth = normalizedData[i] * 30
              const baseRadius = vinylMaxRadius - (i / normalizedData.length) * vinylMaxRadius * 0.5
              
              for (let r = -grooveDepth; r <= grooveDepth; r += 2) {
                const radius = baseRadius + r
                const x1 = vinylCenterX + Math.cos(angle) * radius
                const y1 = vinylCenterY + Math.sin(angle) * radius
                const x2 = vinylCenterX + Math.cos(angle + 0.1) * radius
                const y2 = vinylCenterY + Math.sin(angle + 0.1) * radius
                
                ctx.strokeStyle = waveformFillStyle
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(x1, y1)
                ctx.lineTo(x2, y2)
                ctx.stroke()
              }
            }
            break
            
          case 'equalizer':
            // Stacked equalizer bars
            const eqRows = 4
            const rowHeight = waveformHeight / eqRows
            
            for (let row = 0; row < eqRows; row++) {
              for (let i = 0; i < normalizedData.length; i++) {
                const barHeight = (normalizedData[i] * rowHeight * 0.8)
                const x = waveformX + i * (barWidth + barGap)
                const y = waveformY + row * rowHeight + (rowHeight - barHeight) / 2
                
                const alpha = Math.floor(255 * (1 - row * 0.2)).toString(16).padStart(2, '0')
                ctx.fillStyle = waveformColor + alpha
                ctx.fillRect(x, y, barWidth, barHeight)
              }
            }
            break
            
          case 'pulse':
            // Pulsing heart/pulse shape
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const amplitude = normalizedData[i] * waveformHeight * 0.4
              const centerY = waveformY + waveformHeight / 2
              
              ctx.beginPath()
              ctx.moveTo(x, centerY)
              ctx.lineTo(x + barWidth * 0.5, centerY - amplitude)
              ctx.lineTo(x + barWidth, centerY)
              ctx.lineTo(x + barWidth * 0.5, centerY + amplitude)
              ctx.closePath()
              
              ctx.fillStyle = waveformFillStyle
              ctx.fill()
            }
            break
            
          case 'geometric':
            // Geometric shapes (triangles and hexagons)
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const size = normalizedData[i] * waveformHeight * 0.3
              const centerY = waveformY + waveformHeight / 2
              
              if (i % 2 === 0) {
                // Triangle
                ctx.beginPath()
                ctx.moveTo(x + barWidth / 2, centerY - size / 2)
                ctx.lineTo(x, centerY + size / 2)
                ctx.lineTo(x + barWidth, centerY + size / 2)
                ctx.closePath()
              } else {
                // Hexagon
                const sides = 6
                ctx.beginPath()
                for (let s = 0; s < sides; s++) {
                  const angle = (s / sides) * Math.PI * 2
                  const hx = x + barWidth / 2 + Math.cos(angle) * size / 2
                  const hy = centerY + Math.sin(angle) * size / 2
                  if (s === 0) ctx.moveTo(hx, hy)
                  else ctx.lineTo(hx, hy)
                }
                ctx.closePath()
              }
              
              ctx.fillStyle = waveformFillStyle
              ctx.fill()
            }
            break
            
          case 'dna':
            // DNA double helix
            const dnaAmplitude = waveformHeight * 0.3
            const dnaCenterY = waveformY + waveformHeight / 2
            
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const progress = i / normalizedData.length
              const wave = Math.sin(progress * Math.PI * 4) * dnaAmplitude * normalizedData[i]
              
              // Top strand
              ctx.beginPath()
              ctx.arc(x + barWidth / 2, dnaCenterY + wave, barWidth / 2, 0, Math.PI * 2)
              ctx.fillStyle = waveformFillStyle
              ctx.fill()
              
              // Bottom strand
              ctx.beginPath()
              ctx.arc(x + barWidth / 2, dnaCenterY - wave, barWidth / 2, 0, Math.PI * 2)
              ctx.fillStyle = addOpacity(waveformColor, '99')
              ctx.fill()
              
              // Connecting bars at peaks
              if (Math.abs(wave) > dnaAmplitude * 0.7) {
                ctx.strokeStyle = addOpacity(waveformColor, '66')
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.moveTo(x + barWidth / 2, dnaCenterY + wave)
                ctx.lineTo(x + barWidth / 2, dnaCenterY - wave)
                ctx.stroke()
              }
            }
            break
            
          case 'moire':
            // Moire interference patterns
            const moireLines = 50
            for (let line = 0; line < moireLines; line++) {
              ctx.beginPath()
              const offset = (line / moireLines) * waveformHeight
              for (let i = 0; i < normalizedData.length; i++) {
                const x = waveformX + i * (barWidth + barGap)
                const wave = Math.sin(i * 0.1 + line * 0.2) * normalizedData[i] * 30
                const y = waveformY + offset + wave
                
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              const alpha = Math.floor(255 * (1 - line / moireLines)).toString(16).padStart(2, '0')
              ctx.strokeStyle = waveformColor + alpha
              ctx.lineWidth = 1
              ctx.stroke()
            }
            break
            
          case 'fluid':
            // Organic fluid blob shapes
            const blobCount = Math.min(15, normalizedData.length / 4)
            for (let i = 0; i < blobCount; i++) {
              const dataIndex = Math.floor((i / blobCount) * normalizedData.length)
              const x = waveformX + (i / blobCount) * waveformWidth
              const y = waveformY + waveformHeight / 2
              const radius = normalizedData[dataIndex] * 40
              
              ctx.beginPath()
              for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
                const noise = Math.sin(angle * 3 + i) * 5
                const r = radius + noise
                const px = x + Math.cos(angle) * r
                const py = y + Math.sin(angle) * r
                if (angle === 0) ctx.moveTo(px, py)
                else ctx.lineTo(px, py)
              }
              ctx.closePath()
              ctx.fillStyle = addOpacity(waveformColor, '99')
              ctx.fill()
            }
            break
            
          case 'kaleidoscope':
            // Mirrored radial symmetry
            const kCenterX = canvas.width / 2
            const kCenterY = canvas.height / 2
            const segments = 8
            
            for (let seg = 0; seg < segments; seg++) {
              ctx.save()
              ctx.translate(kCenterX, kCenterY)
              ctx.rotate((seg / segments) * Math.PI * 2)
              
              ctx.beginPath()
              for (let i = 0; i < normalizedData.length; i++) {
                const distance = (i / normalizedData.length) * waveformHeight * 0.4
                const amplitude = normalizedData[i] * 30
                const x = distance
                const y = amplitude
                
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              
              ctx.strokeStyle = waveformFillStyle
              ctx.lineWidth = 2
              ctx.stroke()
              ctx.restore()
            }
            break
            
          case 'glitch':
            // Digital glitch effect
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const barHeight = normalizedData[i] * waveformHeight
              const y = waveformY + (waveformHeight - barHeight) / 2
              
              // Random horizontal displacement
              const glitchOffset = normalizedData[i] > 0.7 ? Math.random() * 20 - 10 : 0
              
              // RGB channel separation
              ctx.fillStyle = '#FF0000'
              ctx.fillRect(x + glitchOffset - 2, y, barWidth, barHeight)
              ctx.fillStyle = '#00FF00'
              ctx.fillRect(x + glitchOffset, y, barWidth, barHeight)
              ctx.fillStyle = waveformFillStyle
              ctx.fillRect(x + glitchOffset + 2, y, barWidth, barHeight)
            }
            break
            
          case 'perlin':
            // Smooth organic noise flow
            ctx.beginPath()
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const noise1 = Math.sin(i * 0.05) * Math.cos(i * 0.03)
              const noise2 = Math.cos(i * 0.07) * Math.sin(i * 0.04)
              const organicFlow = (noise1 + noise2) * normalizedData[i] * waveformHeight * 0.3
              const y = waveformY + waveformHeight / 2 + organicFlow
              
              if (i === 0) ctx.moveTo(x, y)
              else {
                const prevX = waveformX + (i - 1) * (barWidth + barGap)
                const prevNoise1 = Math.sin((i - 1) * 0.05) * Math.cos((i - 1) * 0.03)
                const prevNoise2 = Math.cos((i - 1) * 0.07) * Math.sin((i - 1) * 0.04)
                const prevFlow = (prevNoise1 + prevNoise2) * normalizedData[i - 1] * waveformHeight * 0.3
                const prevY = waveformY + waveformHeight / 2 + prevFlow
                const cpX = (prevX + x) / 2
                const cpY = (prevY + y) / 2
                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
              }
            }
            ctx.strokeStyle = waveformFillStyle
            ctx.lineWidth = 3
            ctx.stroke()
            break
            
          case 'crystals':
            // Faceted crystalline structures
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const centerY = waveformY + waveformHeight / 2
              const size = normalizedData[i] * 30
              
              // Draw diamond/crystal shape
              ctx.beginPath()
              ctx.moveTo(x + barWidth / 2, centerY - size)
              ctx.lineTo(x + barWidth, centerY)
              ctx.lineTo(x + barWidth / 2, centerY + size)
              ctx.lineTo(x, centerY)
              ctx.closePath()
              
              const gradient = ctx.createLinearGradient(x, centerY - size, x, centerY + size)
              gradient.addColorStop(0, addOpacity(waveformColor, 'FF'))
              gradient.addColorStop(0.5, addOpacity(waveformColor, '99'))
              gradient.addColorStop(1, addOpacity(waveformColor, '33'))
              ctx.fillStyle = gradient
              ctx.fill()
              ctx.strokeStyle = waveformFillStyle
              ctx.lineWidth = 1
              ctx.stroke()
            }
            break
            
          case 'tunnel':
            // Infinite depth tunnel perspective
            const tunnelLayers = 20
            const tunnelCenterX = canvas.width / 2
            const tunnelCenterY = canvas.height / 2
            
            for (let layer = tunnelLayers; layer > 0; layer--) {
              const scale = layer / tunnelLayers
              const layerRadius = waveformHeight * 0.4 * scale
              
              ctx.beginPath()
              for (let i = 0; i <= normalizedData.length; i++) {
                const angle = (i / normalizedData.length) * Math.PI * 2
                const dataIndex = i % normalizedData.length
                const depth = normalizedData[dataIndex] * 10 * scale
                const radius = layerRadius + depth
                
                const x = tunnelCenterX + Math.cos(angle) * radius
                const y = tunnelCenterY + Math.sin(angle) * radius
                
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              ctx.closePath()
              const alpha = Math.floor(255 * scale).toString(16).padStart(2, '0')
              ctx.strokeStyle = waveformColor + alpha
              ctx.lineWidth = 2
              ctx.stroke()
            }
            break
            
          case 'bloom':
            // Light bloom glow effect
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const barHeight = normalizedData[i] * waveformHeight
              const y = waveformY + (waveformHeight - barHeight) / 2
              
              // Multiple glow layers
              for (let glow = 3; glow > 0; glow--) {
                ctx.fillStyle = waveformColor + Math.floor(50 / glow).toString(16).padStart(2, '0')
                ctx.fillRect(x - glow * 2, y - glow * 2, barWidth + glow * 4, barHeight + glow * 4)
              }
              
              // Bright core
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(x + barWidth * 0.3, y, barWidth * 0.4, barHeight)
            }
            break
            
          case 'aurora':
            // Northern lights effect
            const auroraWaves = 5
            for (let wave = 0; wave < auroraWaves; wave++) {
              const gradient = ctx.createLinearGradient(0, waveformY, 0, waveformY + waveformHeight)
              const hue1 = (wave * 60) % 360
              const hue2 = ((wave + 1) * 60) % 360
              gradient.addColorStop(0, `hsla(${hue1}, 100%, 60%, 0.3)`)
              gradient.addColorStop(0.5, `hsla(${hue2}, 100%, 50%, 0.5)`)
              gradient.addColorStop(1, `hsla(${hue1}, 100%, 40%, 0.2)`)
              
              ctx.beginPath()
              for (let i = 0; i < normalizedData.length; i++) {
                const x = waveformX + i * (barWidth + barGap)
                const waveOffset = Math.sin(i * 0.05 + wave * 2) * 50
                const amplitude = normalizedData[i] * waveformHeight * 0.3
                const y = waveformY + waveformHeight / 2 + waveOffset + amplitude * Math.cos(wave)
                
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              
              ctx.strokeStyle = gradient
              ctx.lineWidth = 8
              ctx.stroke()
            }
            break
            
          case 'fire':
            // Flame particle effect
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + i * (barWidth + barGap)
              const intensity = normalizedData[i]
              const flameHeight = intensity * waveformHeight * 0.8
              const particles = Math.floor(intensity * 10)
              
              for (let p = 0; p < particles; p++) {
                const px = x + (Math.random() - 0.5) * barWidth * 2
                const py = waveformY + waveformHeight - (p / particles) * flameHeight
                const size = (1 - p / particles) * 6
                
                const heat = p / particles
                const r = 255
                const g = Math.floor(255 * (1 - heat * 0.5))
                const b = 0
                const a = Math.floor(255 * (1 - heat)).toString(16).padStart(2, '0')
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})` + a
                ctx.beginPath()
                ctx.arc(px, py, size, 0, Math.PI * 2)
                ctx.fill()
              }
            }
            break
            
          case 'smooth':
            // Smooth flowing waveform with curves
            if (normalizedData.length < 2) break
            
            const smoothWaveformY = waveformY + waveformHeight / 2
            const pointSpacing = waveformWidth / (normalizedData.length - 1)
            
            // Create smooth curves for top and bottom
            ctx.beginPath()
            
            // Start from the left
            let startX = waveformX
            let startHeight = normalizedData[0] * (waveformHeight / 2)
            ctx.moveTo(startX, smoothWaveformY - startHeight)
            
            // Draw top curve using quadratic curves
            for (let i = 0; i < normalizedData.length - 1; i++) {
              const x1 = waveformX + i * pointSpacing
              const x2 = waveformX + (i + 1) * pointSpacing
              const y1 = smoothWaveformY - (normalizedData[i] * (waveformHeight / 2))
              const y2 = smoothWaveformY - (normalizedData[i + 1] * (waveformHeight / 2))
              
              // Control point is halfway between points
              const cpX = (x1 + x2) / 2
              const cpY = (y1 + y2) / 2
              
              ctx.quadraticCurveTo(x1, y1, cpX, cpY)
            }
            
            // Complete the last segment
            const lastX = waveformX + (normalizedData.length - 1) * pointSpacing
            const lastHeight = normalizedData[normalizedData.length - 1] * (waveformHeight / 2)
            ctx.lineTo(lastX, smoothWaveformY - lastHeight)
            
            // Draw bottom curve (mirrored)
            for (let i = normalizedData.length - 1; i > 0; i--) {
              const x1 = waveformX + i * pointSpacing
              const x2 = waveformX + (i - 1) * pointSpacing
              const y1 = smoothWaveformY + (normalizedData[i] * (waveformHeight / 2))
              const y2 = smoothWaveformY + (normalizedData[i - 1] * (waveformHeight / 2))
              
              const cpX = (x1 + x2) / 2
              const cpY = (y1 + y2) / 2
              
              ctx.quadraticCurveTo(x1, y1, cpX, cpY)
            }
            
            // Close the path
            ctx.lineTo(startX, smoothWaveformY + startHeight)
            ctx.closePath()
            ctx.fill()
            break
            
          case 'soundwave-lines':
            // Spotify Canvas style - thin horizontal lines with subtle variations
            if (normalizedData.length < 2) break
            
            const numLines = 30
            const lineSpacing = waveformHeight / numLines
            const swCenterY = waveformY + waveformHeight / 2
            
            ctx.lineWidth = 1.5
            ctx.strokeStyle = waveformFillStyle
            
            for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
              const baseY = waveformY + lineIdx * lineSpacing
              const distFromCenter = Math.abs(baseY - swCenterY) / (waveformHeight / 2)
              
              ctx.beginPath()
              ctx.moveTo(waveformX, baseY)
              
              for (let i = 0; i < normalizedData.length; i++) {
                const x = waveformX + (i / normalizedData.length) * waveformWidth
                const amplitude = normalizedData[i] * 8 * (1 - distFromCenter * 0.5)
                const sineWave = Math.sin((i / normalizedData.length) * Math.PI * 4 + lineIdx * 0.2) * amplitude
                const y = baseY + sineWave
                
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              
              ctx.globalAlpha = 0.6 - distFromCenter * 0.3
              ctx.stroke()
              ctx.globalAlpha = 1
            }
            break
            
          case 'mountain':
            // Layered mountain silhouettes
            if (normalizedData.length < 2) break
            
            const numLayers = 4
            
            for (let layer = 0; layer < numLayers; layer++) {
              const layerOpacity = 0.3 + (layer / numLayers) * 0.7
              const layerHeight = waveformHeight * (0.4 + layer * 0.15)
              const layerY = waveformY + (waveformHeight - layerHeight) / 2
              
              ctx.globalAlpha = layerOpacity
              ctx.beginPath()
              ctx.moveTo(waveformX, waveformY + waveformHeight)
              
              for (let i = 0; i < normalizedData.length; i++) {
                const x = waveformX + (i / normalizedData.length) * waveformWidth
                const noise = (Math.random() - 0.5) * 10
                const peak = normalizedData[i] * layerHeight * (1 + layer * 0.1) + noise
                const y = layerY + layerHeight - peak
                
                if (i === 0) ctx.lineTo(x, y)
                else {
                  const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
                  const prevPeak = normalizedData[i - 1] * layerHeight * (1 + layer * 0.1)
                  const prevY = layerY + layerHeight - prevPeak
                  const cpX = (prevX + x) / 2
                  const cpY = (prevY + y) / 2
                  ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
                }
              }
              
              ctx.lineTo(waveformX + waveformWidth, waveformY + waveformHeight)
              ctx.closePath()
              ctx.fill()
            }
            ctx.globalAlpha = 1
            break
            
          case 'heartbeat':
            // ECG/Medical monitor style
            if (normalizedData.length < 2) break
            
            const ecgCenterY = waveformY + waveformHeight / 2
            const ecgAmplitude = waveformHeight * 0.4
            
            // Draw grid lines
            ctx.strokeStyle = addOpacity(waveformColor, '20')
            ctx.lineWidth = 0.5
            
            // Horizontal grid
            for (let i = 0; i <= 10; i++) {
              const y = waveformY + (i / 10) * waveformHeight
              ctx.beginPath()
              ctx.moveTo(waveformX, y)
              ctx.lineTo(waveformX + waveformWidth, y)
              ctx.stroke()
            }
            
            // Vertical grid
            for (let i = 0; i <= 20; i++) {
              const x = waveformX + (i / 20) * waveformWidth
              ctx.beginPath()
              ctx.moveTo(x, waveformY)
              ctx.lineTo(x, waveformY + waveformHeight)
              ctx.stroke()
            }
            
            // Draw ECG waveform
            ctx.strokeStyle = waveformFillStyle
            ctx.lineWidth = 2
            ctx.beginPath()
            
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const amplitude = normalizedData[i]
              
              let y
              if (amplitude > 0.7) {
                // QRS complex (sharp spike)
                const phase = (i % 10) / 10
                if (phase < 0.2) y = ecgCenterY - amplitude * ecgAmplitude
                else if (phase < 0.3) y = ecgCenterY + amplitude * ecgAmplitude * 0.3
                else if (phase < 0.5) y = ecgCenterY + amplitude * ecgAmplitude * 0.2
                else y = ecgCenterY
              } else {
                // P and T waves (gentle curves)
                y = ecgCenterY - amplitude * ecgAmplitude * 0.5
              }
              
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            
            ctx.stroke()
            break
            
          case 'constellation':
            // Connected stars pattern
            if (normalizedData.length < 2) break
            
            const stars: Array<{x: number, y: number, brightness: number}> = []
            
            // Create star positions from audio
            for (let i = 0; i < normalizedData.length; i++) {
              if (normalizedData[i] > 0.3) {
                const x = waveformX + (i / normalizedData.length) * waveformWidth
                const y = waveformY + waveformHeight / 2 + (Math.random() - 0.5) * waveformHeight * normalizedData[i]
                stars.push({ x, y, brightness: normalizedData[i] })
              }
            }
            
            // Draw connections between nearby stars
            ctx.strokeStyle = addOpacity(waveformColor, '40')
            ctx.lineWidth = 1
            
            for (let i = 0; i < stars.length; i++) {
              for (let j = i + 1; j < stars.length; j++) {
                const dx = stars[j].x - stars[i].x
                const dy = stars[j].y - stars[i].y
                const dist = Math.sqrt(dx * dx + dy * dy)
                
                if (dist < 50) {
                  ctx.beginPath()
                  ctx.moveTo(stars[i].x, stars[i].y)
                  ctx.lineTo(stars[j].x, stars[j].y)
                  ctx.stroke()
                }
              }
            }
            
            // Draw stars
            for (const star of stars) {
              const size = 2 + star.brightness * 3
              ctx.fillStyle = waveformFillStyle
              ctx.beginPath()
              ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
              ctx.fill()
              
              // Glow effect
              ctx.shadowBlur = 8
              ctx.shadowColor = waveformColor
              ctx.fill()
              ctx.shadowBlur = 0
            }
            break
            
          case 'ribbon':
            // Flowing ribbon with light reflections
            if (normalizedData.length < 2) break
            
            const ribbonCenterY = waveformY + waveformHeight / 2
            const ribbonWidth = 20
            
            // Shadow layer (below ribbon)
            ctx.fillStyle = '#00000030'
            ctx.beginPath()
            ctx.moveTo(waveformX, ribbonCenterY + ribbonWidth + 5)
            
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
              const y = ribbonCenterY + wave + ribbonWidth + 5
              
              if (i === 0) ctx.moveTo(x, y)
              else {
                const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
                const prevWave = Math.sin(((i - 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i - 1] * waveformHeight * 0.3
                const prevY = ribbonCenterY + prevWave + ribbonWidth + 5
                const cpX = (prevX + x) / 2
                const cpY = (prevY + y) / 2
                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
              }
            }
            
            ctx.lineTo(waveformX + waveformWidth, ribbonCenterY + ribbonWidth + 5)
            ctx.fill()
            
            // Main ribbon
            ctx.fillStyle = waveformFillStyle
            ctx.beginPath()
            
            // Top edge
            ctx.moveTo(waveformX, ribbonCenterY - ribbonWidth)
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
              const y = ribbonCenterY + wave - ribbonWidth
              
              if (i > 0) {
                const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
                const prevWave = Math.sin(((i - 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i - 1] * waveformHeight * 0.3
                const prevY = ribbonCenterY + prevWave - ribbonWidth
                const cpX = (prevX + x) / 2
                const cpY = (prevY + y) / 2
                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
              }
            }
            
            // Bottom edge (reverse)
            for (let i = normalizedData.length - 1; i >= 0; i--) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
              const y = ribbonCenterY + wave + ribbonWidth
              
              if (i < normalizedData.length - 1) {
                const nextX = waveformX + ((i + 1) / normalizedData.length) * waveformWidth
                const nextWave = Math.sin(((i + 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i + 1] * waveformHeight * 0.3
                const nextY = ribbonCenterY + nextWave + ribbonWidth
                const cpX = (nextX + x) / 2
                const cpY = (nextY + y) / 2
                ctx.quadraticCurveTo(nextX, nextY, cpX, cpY)
              }
            }
            
            ctx.closePath()
            ctx.fill()
            
            // Highlight (simulated reflection)
            const highlightGradient = ctx.createLinearGradient(waveformX, ribbonCenterY - ribbonWidth, waveformX, ribbonCenterY)
            highlightGradient.addColorStop(0, '#ffffff60')
            highlightGradient.addColorStop(1, '#ffffff00')
            
            ctx.fillStyle = highlightGradient
            ctx.beginPath()
            ctx.moveTo(waveformX, ribbonCenterY - ribbonWidth)
            for (let i = 0; i < normalizedData.length; i++) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
              const y = ribbonCenterY + wave - ribbonWidth
              
              if (i > 0) {
                const prevX = waveformX + ((i - 1) / normalizedData.length) * waveformWidth
                const prevWave = Math.sin(((i - 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i - 1] * waveformHeight * 0.3
                const prevY = ribbonCenterY + prevWave - ribbonWidth
                const cpX = (prevX + x) / 2
                const cpY = (prevY + y) / 2
                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
              }
            }
            
            for (let i = normalizedData.length - 1; i >= 0; i--) {
              const x = waveformX + (i / normalizedData.length) * waveformWidth
              const wave = Math.sin((i / normalizedData.length) * Math.PI * 3) * normalizedData[i] * waveformHeight * 0.3
              const y = ribbonCenterY + wave
              
              if (i < normalizedData.length - 1) {
                const nextX = waveformX + ((i + 1) / normalizedData.length) * waveformWidth
                const nextWave = Math.sin(((i + 1) / normalizedData.length) * Math.PI * 3) * normalizedData[i + 1] * waveformHeight * 0.3
                const nextY = ribbonCenterY + nextWave
                const cpX = (nextX + x) / 2
                const cpY = (nextY + y) / 2
                ctx.quadraticCurveTo(nextX, nextY, cpX, cpY)
              }
            }
            
            ctx.closePath()
            ctx.fill()
            break
            
          case 'spectrum':
            // Concentric circles with HSL gradient (2024-2025 trending style)
            const spectrumCenterX = canvas.width / 2
            const spectrumCenterY = canvas.height / 2
            const maxSpectrumRadius = Math.min(waveformWidth, waveformHeight) * 0.45
            
            if (normalizedData.length === 0) break
            
            // Draw concentric circles
            for (let i = 0; i < normalizedData.length; i++) {
              const radius = (i / normalizedData.length) * maxSpectrumRadius * normalizedData[i]
              const hue = (i / normalizedData.length) * 360
              const opacity = 0.4 + normalizedData[i] * 0.6
              
              const gradient = ctx.createRadialGradient(
                spectrumCenterX, spectrumCenterY, radius * 0.8,
                spectrumCenterX, spectrumCenterY, radius
              )
              gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${opacity})`)
              gradient.addColorStop(1, `hsla(${hue}, 70%, 60%, 0)`)
              
              ctx.fillStyle = gradient
              ctx.beginPath()
              ctx.arc(spectrumCenterX, spectrumCenterY, radius, 0, Math.PI * 2)
              ctx.fill()
            }
            
            // Center glow
            const centerGlow = ctx.createRadialGradient(
              spectrumCenterX, spectrumCenterY, 0,
              spectrumCenterX, spectrumCenterY, 30
            )
            centerGlow.addColorStop(0, '#ffffffaa')
            centerGlow.addColorStop(1, '#ffffff00')
            ctx.fillStyle = centerGlow
            ctx.beginPath()
            ctx.arc(spectrumCenterX, spectrumCenterY, 30, 0, Math.PI * 2)
            ctx.fill()
            break
            
          default:
            // Fallback to bars
            for (let i = 0; i < normalizedData.length; i++) {
              const barHeight = normalizedData[i] * waveformHeight
              const x = waveformX + i * (barWidth + barGap)
              const y = waveformY + (waveformHeight - barHeight) / 2
              
              ctx.beginPath()
              ctx.roundRect(x, y, barWidth, barHeight, 2)
              ctx.fill()
            }
        }
        
        // Cache the waveform canvas (without text/QR) for fast repositioning
        waveformImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
        console.log('💾 Cached waveform canvas (without overlays)')
        
        // Check if render was cancelled after waveform generation
        if (isCancelled) {
          console.log('Render cancelled after waveform caching')
          setIsGenerating(false)
          return
        }
        
        // Render text overlay after caching waveform
        if (showText && customText) {
          // Wait for font to be ready before rendering
          const fontSpec = `${fontSize}px "${fontFamily}"`
          if (document.fonts && fontFamily !== 'Arial' && fontFamily !== 'sans-serif') {
            await document.fonts.load(fontSpec).catch(() => {
              console.warn('Font load failed in full render path, using fallback')
            })
          }
          
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `${fontSize}px "${fontFamily}", sans-serif`
          
          const textXPos = (textX / 100) * canvas.width
          const textYPos = (textY / 100) * canvas.height
          
          // Apply gradient or solid color
          if (textUseGradient) {
            let textGradient
            if (textGradientDirection === 'radial') {
              textGradient = ctx.createRadialGradient(textXPos, textYPos, 0, textXPos, textYPos, fontSize * 2)
            } else if (textGradientDirection === 'horizontal') {
              textGradient = ctx.createLinearGradient(textXPos - fontSize * 2, textYPos, textXPos + fontSize * 2, textYPos)
            } else if (textGradientDirection === 'vertical') {
              textGradient = ctx.createLinearGradient(textXPos, textYPos - fontSize, textXPos, textYPos + fontSize)
            } else { // diagonal
              textGradient = ctx.createLinearGradient(textXPos - fontSize, textYPos - fontSize, textXPos + fontSize, textYPos + fontSize)
            }
            const sortedStops = [...textGradientStops].sort((a, b) => a.position - b.position)
            sortedStops.forEach(stop => {
              textGradient.addColorStop(stop.position, stop.color)
            })
            ctx.fillStyle = textGradient
          } else {
            ctx.fillStyle = textColor
          }
          
          console.log('📝 Rendering text after waveform:', { textX, textY, textXPos, textYPos, useGradient: textUseGradient })
          
          ctx.fillText(customText, textXPos, textYPos)
        }
        
        // Add QR code overlay if enabled
        if (showQRCode && qrCodeUrl) {
          // Use new percentage-based size and position
          const qrSize = Math.floor(canvas.width * (qrCodeSize / 100))
          try {
            const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { 
              width: qrSize, 
              margin: 1,
              color: {
                dark: waveformColor,
                light: '#00000000'
              }
            })
            
            // Check if render was cancelled before drawing
            if (isCancelled) {
              console.log('🚫 Full path QR render cancelled')
              setIsGenerating(false)
              return
            }
            
            const qrImg = new Image()
            await new Promise<void>((resolve) => {
              qrImg.onload = () => {
                // Check again before drawing
                if (!isCancelled) {
                  // Position QR code using percentage-based coordinates
                  const qrX = (qrCodeX / 100) * canvas.width - qrSize / 2
                  const qrY = (qrCodeY / 100) * canvas.height - qrSize / 2
                  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
                }
                resolve()
              }
              qrImg.onerror = () => resolve()
              qrImg.src = qrDataUrl
            })
          } catch (err) {
            console.error('Error generating QR code:', err)
          }
        }
        
        setIsGenerating(false)
      })
      .catch(error => {
        console.error('Error generating waveform:', error)
        setIsGenerating(false)
      })
    }
    
    // Call the async render function
    renderCanvas()
    
    // Cleanup function to cancel render if component unmounts or dependencies change
    return () => {
      isCancelled = true
    }
  }, [
    audioUrl, 
    waveformColor, 
    waveformUseGradient,
    waveformGradientStops,
    waveformGradientDirection,
    backgroundColor, 
    backgroundUseGradient,
    backgroundGradientStops,
    backgroundGradientDirection,
    selectedProduct, 
    selectedSize, 
    selectedRegion?.start,
    selectedRegion?.end,
    canvasReady, 
    waveformStyle, 
    waveformSize,
    waveformHeightMultiplier,
    showText, 
    songTitle, 
    artistName, 
    customDate, 
    customText, 
    textColor, 
    textX,
    textY,
    fontFamily,
    fontSize, 
    backgroundImage, 
    backgroundImagePosition,
    backgroundFocalPoint,
    showQRCode, 
    qrCodeUrl, 
    qrCodePosition,
    qrCodeSize,
    qrCodeX,
    qrCodeY,
    detectedWords,
    showArtisticText,
    artisticTextStyle,
    artisticTextColor,
    artisticTextOpacity,
    fontLoaded, // Re-render when font finishes loading
    canvasWidth, // Re-render when canvas dimensions change
    canvasHeight
  ])

  const getProductIcon = () => {
    switch (selectedProduct) {
      case 'poster':
        return <Frame className="h-4 w-4" />
      case 't-shirt':
        return <Shirt className="h-4 w-4" />
      case 'mug':
        return <Coffee className="h-4 w-4" />
      case 'canvas':
        return <Palette className="h-4 w-4" />
      case 'hoodie':
        return <Layers className="h-4 w-4" />
      default:
        return <Frame className="h-4 w-4" />
    }
  }

  const getFrameClass = () => {
    if (selectedProduct === 'poster' || selectedProduct === 'canvas') {
      return 'p-6 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-sm'
    }
    return 'p-4 bg-white shadow-sm'
  }

  if (!audioUrl) {
    return (
      <div className={cn(
        'w-full aspect-[3/4] flex items-center justify-center',
        'border-2 border-dashed rounded-lg bg-muted/20',
        className
      )}>
        <p className="text-muted-foreground text-center px-4">
          Upload an audio file to see preview
        </p>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center p-8 ${className}`} ref={containerRef}>
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
          <p className="text-sm text-muted-foreground">Generating preview...</p>
        </div>
      )}
      
      <div className="relative">
        <div className={`rounded-lg ${getFrameClass()}`}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background border shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 z-10">
            {getProductIcon()}
            <span className="text-xs font-semibold capitalize">
              {selectedProduct.replace('-', ' ')} - {selectedSize}
            </span>
          </div>

          <div className="relative">
            {(selectedProduct === 'poster' || selectedProduct === 'canvas') && (
              <div 
                className="absolute inset-0 rounded pointer-events-none" 
                style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)' }} 
              />
            )}
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="max-w-full h-auto rounded"
              style={{
                maxHeight: '550px',
                boxShadow: selectedProduct === 'poster' || selectedProduct === 'canvas'
                  ? '0 8px 30px rgba(0,0,0,0.5)'
                  : '0 4px 15px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>

        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-8 bg-black/30 blur-2xl rounded-full -z-10" />
      </div>
    </div>
  )
})

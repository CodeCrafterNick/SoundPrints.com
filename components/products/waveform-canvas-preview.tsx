'use client'

import { useEffect, useRef } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'

/**
 * Clean waveform preview - just the artwork without any product mockup
 * This shows the pure waveform design that will be applied to products
 */
export function WaveformCanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const {
    audioUrl,
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
    backgroundImagePosition,
    backgroundFocalPoint,
    selectedRegion,
    showText,
    customText,
    textColor,
    textUseGradient,
    textGradientStops,
    textGradientDirection,
    textX,
    textY,
    fontSize,
    fontFamily,
  } = useCustomizerStore()

  useEffect(() => {
    if (!canvasRef.current || !audioUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (square aspect ratio for clean preview)
    canvas.width = 800
    canvas.height = 800

    const renderCanvas = async () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      if (backgroundImage) {
        // TODO: Handle background image
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (backgroundUseGradient && backgroundGradientStops.length > 0) {
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
        } else {
          bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        }
        backgroundGradientStops.forEach(stop => {
          bgGradient.addColorStop(stop.position / 100, stop.color)
        })
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Fetch and draw waveform
      if (!audioUrl) return

      try {
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const channelData = audioBuffer.getChannelData(0)
        
        // Use selected region or full audio
        let regionData = channelData
        if (selectedRegion) {
          const startSample = Math.floor(selectedRegion.start * audioBuffer.sampleRate)
          const endSample = Math.floor(selectedRegion.end * audioBuffer.sampleRate)
          regionData = channelData.slice(startSample, endSample)
        }

        // Calculate waveform dimensions with margins
        const margin = canvas.width * 0.1 // 10% margin
        const maxWidth = canvas.width - (margin * 2)
        const maxHeight = canvas.height - (margin * 2)
        
        const waveformWidth = maxWidth * (waveformSize / 100)
        const waveformHeight = maxHeight * (waveformSize / 100)
        const waveformX = (canvas.width - waveformWidth) / 2
        const waveformY = (canvas.height - waveformHeight) / 2

        // Draw waveform bars
        const barWidth = 6
        const barGap = 1
        const barTotalWidth = barWidth + barGap
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
        
        const max = Math.max(...filteredData)
        const normalizedData = filteredData.map(n => n / max)

        // Create waveform fill style
        let waveformFillStyle: string | CanvasGradient
        if (waveformUseGradient && waveformGradientStops.length > 0) {
          let waveGradient
          if (waveformGradientDirection === 'radial') {
            waveGradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 0,
              canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            )
          } else if (waveformGradientDirection === 'horizontal') {
            waveGradient = ctx.createLinearGradient(waveformX, 0, waveformX + waveformWidth, 0)
          } else if (waveformGradientDirection === 'vertical') {
            waveGradient = ctx.createLinearGradient(0, waveformY, 0, waveformY + waveformHeight)
          } else {
            waveGradient = ctx.createLinearGradient(waveformX, waveformY, waveformX + waveformWidth, waveformY + waveformHeight)
          }
          waveformGradientStops.forEach(stop => {
            waveGradient.addColorStop(stop.position / 100, stop.color)
          })
          waveformFillStyle = waveGradient
        } else {
          waveformFillStyle = waveformColor
        }
        
        ctx.fillStyle = waveformFillStyle

        // Draw based on style
        if (waveformStyle === 'bars') {
          for (let i = 0; i < normalizedData.length; i++) {
            const barHeight = normalizedData[i] * waveformHeight
            const x = Math.round(waveformX + i * barTotalWidth)
            const y = Math.round(waveformY + (waveformHeight - barHeight) / 2)
            
            ctx.beginPath()
            ctx.roundRect(x, y, barWidth, Math.round(barHeight), 2)
            ctx.fill()
          }
        } else if (waveformStyle === 'mirror') {
          for (let i = 0; i < normalizedData.length; i++) {
            const barHeight = (normalizedData[i] * waveformHeight) / 2
            const x = Math.round(waveformX + i * barTotalWidth)
            const centerY = Math.round(waveformY + waveformHeight / 2)
            
            ctx.beginPath()
            ctx.roundRect(x, Math.round(centerY - barHeight), barWidth, Math.round(barHeight), 2)
            ctx.fill()
            
            ctx.beginPath()
            ctx.roundRect(x, centerY, barWidth, Math.round(barHeight), 2)
            ctx.fill()
          }
        }

        // Draw text if enabled
        if (showText && customText) {
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `${fontSize}px "${fontFamily}", sans-serif`
          
          const textXPos = (textX / 100) * canvas.width
          const textYPos = (textY / 100) * canvas.height
          
          if (textUseGradient && textGradientStops.length > 0) {
            let textGradient
            if (textGradientDirection === 'radial') {
              textGradient = ctx.createRadialGradient(textXPos, textYPos, 0, textXPos, textYPos, fontSize * 2)
            } else if (textGradientDirection === 'horizontal') {
              textGradient = ctx.createLinearGradient(textXPos - fontSize * 2, textYPos, textXPos + fontSize * 2, textYPos)
            } else if (textGradientDirection === 'vertical') {
              textGradient = ctx.createLinearGradient(textXPos, textYPos - fontSize, textXPos, textYPos + fontSize)
            } else {
              textGradient = ctx.createLinearGradient(textXPos - fontSize, textYPos - fontSize, textXPos + fontSize, textYPos + fontSize)
            }
            textGradientStops.forEach(stop => {
              textGradient.addColorStop(stop.position / 100, stop.color)
            })
            ctx.fillStyle = textGradient
          } else {
            ctx.fillStyle = textColor
          }
          
          ctx.fillText(customText, textXPos, textYPos)
        }
      } catch (error) {
        console.error('Error rendering waveform preview:', error)
      }
    }

    renderCanvas()
  }, [
    audioUrl,
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
    textColor,
    textUseGradient,
    textGradientStops,
    textGradientDirection,
    textX,
    textY,
    fontSize,
    fontFamily,
  ])

  if (!audioUrl) {
    return (
      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Upload audio to see preview</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg shadow-lg"
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}

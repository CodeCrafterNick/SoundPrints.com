'use client'

import { useEffect, useRef } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WaveformPreviewProps {
  onEditClick: () => void
}

export function WaveformPreview({ onEditClick }: WaveformPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)

  useEffect(() => {
    if (!audioUrl || !canvasRef.current || !selectedRegion) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2 // 2x for retina
    canvas.height = 60 * 2 // 2x for retina
    ctx.scale(2, 2)

    fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        return audioContext.decodeAudioData(arrayBuffer)
      })
      .then(audioBuffer => {
        const rawData = audioBuffer.getChannelData(0)
        const sampleRate = audioBuffer.sampleRate
        
        // Extract selected region
        const startSample = Math.floor(selectedRegion.start * sampleRate)
        const endSample = Math.floor(selectedRegion.end * sampleRate)
        const regionData = rawData.slice(startSample, endSample)

        // Draw waveform
        const width = canvas.offsetWidth
        const height = 60
        const halfHeight = height / 2

        ctx.clearRect(0, 0, width, height)

        // Draw center line
        ctx.fillStyle = 'rgba(128, 128, 128, 0.2)'
        ctx.fillRect(0, halfHeight - 0.5, width, 1)

        // Calculate bars
        const barWidth = 2
        const barGap = 1
        const barStep = barWidth + barGap
        const barsCount = Math.floor(width / barStep)
        const blockSize = Math.max(1, Math.floor(regionData.length / barsCount))

        ctx.fillStyle = waveformColor

        for (let i = 0; i < barsCount; i++) {
          const blockStart = blockSize * i
          const blockEnd = Math.min(blockStart + blockSize, regionData.length)
          let sum = 0
          let count = 0

          for (let j = blockStart; j < blockEnd; j++) {
            sum += Math.abs(regionData[j])
            count++
          }

          const amplitude = count > 0 ? sum / count : 0
          const barHeight = Math.min(amplitude * halfHeight * 1.5, halfHeight)
          const x = i * barStep

          // Draw mirrored bars
          ctx.fillRect(x, halfHeight - barHeight, barWidth, barHeight)
          ctx.fillRect(x, halfHeight, barWidth, barHeight)
        }
      })
      .catch(error => {
        console.error('Error rendering preview waveform:', error)
      })
  }, [audioUrl, selectedRegion, waveformColor])

  if (!audioUrl) return null

  return (
    <div className="relative mb-4 p-3 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">Current Waveform</p>
        <Button
          onClick={onEditClick}
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
        >
          <Edit3 className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: '60px' }}
      />
    </div>
  )
}

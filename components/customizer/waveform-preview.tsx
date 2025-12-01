'use client'

import { useEffect, useRef } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WaveformPreviewProps {
  onEditClick: () => void
}

// Cache decoded audio buffers to avoid re-downloading
const audioBufferCache = new Map<string, AudioBuffer>()

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
    canvas.height = 50 * 2 // 2x for retina (reduced from 60 to 50)
    ctx.scale(2, 2)

    // Check cache first
    const cachedBuffer = audioBufferCache.get(audioUrl)
    
    const processAudio = (audioBuffer: AudioBuffer) => {
      const rawData = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate
      
      // Extract selected region
      const startSample = Math.floor(selectedRegion.start * sampleRate)
      const endSample = Math.floor(selectedRegion.end * sampleRate)
      const regionData = rawData.slice(startSample, endSample)

      // Draw waveform
      const width = canvas.offsetWidth
      const height = 50
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

        ctx.fillStyle = '#000000'

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
    }

    if (cachedBuffer) {
      // Use cached buffer
      processAudio(cachedBuffer)
    } else {
      // Fetch and cache
      fetch(audioUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          return audioContext.decodeAudioData(arrayBuffer)
        })
        .then(audioBuffer => {
          audioBufferCache.set(audioUrl, audioBuffer)
          processAudio(audioBuffer)
        })
        .catch(error => {
          console.error('Error rendering preview waveform:', error)
        })
    }
  }, [audioUrl, selectedRegion, waveformColor])

  if (!audioUrl) return null

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full rounded-md bg-white/50 h-[50px]"
      />
    </div>
  )
}

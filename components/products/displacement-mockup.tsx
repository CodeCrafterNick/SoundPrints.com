'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface DisplacementMockupProps {
  templateId: string
  designFile?: File
  designUrl?: string
  config?: {
    intensity?: number
    brightness?: number
    blendMode?: 'multiply' | 'overlay' | 'normal'
  }
  className?: string
  autoGenerate?: boolean
  onGenerationComplete?: (url: string, time: number) => void
  onError?: (error: string) => void
  showStats?: boolean
  quality?: 'low' | 'medium' | 'high'
}

/**
 * Optimized React component for displaying displacement-mapped mockups
 * Features: Progressive loading, caching, error recovery, performance metrics
 */
export function DisplacementMockup({
  templateId,
  designFile,
  designUrl,
  config = {},
  className = '',
  autoGenerate = true,
  onGenerationComplete,
  onError,
  showStats = false,
  quality = 'high'
}: DisplacementMockupProps) {
  const [mockupUrl, setMockupUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const previousUrlRef = useRef<string | null>(null)

  // Quality presets
  const qualityPresets = {
    low: { format: 'webp', quality: 70, intensity: 6 },
    medium: { format: 'webp', quality: 85, intensity: 8 },
    high: { format: 'png', quality: 95, intensity: 10 }
  }

  const preset = qualityPresets[quality]

  // Generate mockup with optimization
  const generateMockup = useCallback(async () => {
    if (!designFile && !designUrl) {
      const errorMsg = 'No design provided'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Cancel previous generation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)
    setProgress(10)

    setIsLoading(true)
    setError(null)
    setProgress(10)

    const startTime = performance.now()

    try {
      const formData = new FormData()
      formData.append('templateId', templateId)

      setProgress(20)

      // Add design file or fetch from URL
      if (designFile) {
        formData.append('design', designFile)
      } else if (designUrl) {
        const response = await fetch(designUrl, { signal: abortControllerRef.current.signal })
        const blob = await response.blob()
        formData.append('design', blob, 'design.png')
      }

      setProgress(40)

      // Add config with quality preset
      const finalConfig = {
        intensity: config.intensity ?? preset.intensity,
        brightness: config.brightness ?? 0.92,
        blendMode: config.blendMode ?? 'multiply'
      }

      formData.append('intensity', finalConfig.intensity.toString())
      formData.append('brightness', finalConfig.brightness.toString())
      formData.append('blendMode', finalConfig.blendMode)
      formData.append('format', preset.format)
      formData.append('quality', preset.quality.toString())

      setProgress(60)

      // Generate mockup
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      })

      setProgress(80)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate mockup')
      }

      // Get generation time from headers
      const genTime = response.headers.get('X-Generation-Time')
      const generationTimeMs = genTime ? parseInt(genTime) : Math.round(performance.now() - startTime)
      setGenerationTime(generationTimeMs)

      // Convert response to blob URL
      const blob = await response.blob()
      
      // Cleanup previous blob URL
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current)
      }
      
      const url = URL.createObjectURL(blob)
      previousUrlRef.current = url
      setMockupUrl(url)

      setProgress(100)
      onGenerationComplete?.(url, generationTimeMs)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was cancelled, don't show error
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Mockup generation error:', err)
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
      setProgress(0)
      abortControllerRef.current = null
    }
  }, [templateId, designFile, designUrl, config, preset, onGenerationComplete, onError])

  // Auto-generate on mount or when deps change
  useEffect(() => {
    if (autoGenerate && (designFile || designUrl)) {
      generateMockup()
    }
  }, [autoGenerate, designFile, designUrl, generateMockup])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Loading state with progress
  if (isLoading) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="text-center p-8 z-10">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
              style={{ animationDuration: '0.8s' }}
            ></div>
          </div>
          <p className="text-gray-700 font-medium mb-2">Generating mockup...</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-sm mt-2">{progress}%</p>
        </div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
      </div>
    )
  }

  // Error state with retry
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg ${className}`}>
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium mb-2">Generation Failed</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={generateMockup}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!mockupUrl) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No mockup generated yet</p>
          <button
            onClick={generateMockup}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Generate Mockup
          </button>
        </div>
      </div>
    )
  }

  // Success state with optimized image display
  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      <div className="relative w-full h-full">
        <Image
          src={mockupUrl}
          alt="Product mockup"
          fill
          className="object-contain"
          unoptimized
          priority
          quality={100}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      {/* Stats overlay */}
      {showStats && generationTime && (
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-2 shadow-lg">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{generationTime}ms</span>
          <span className="opacity-50">|</span>
          <span className="uppercase text-[10px] opacity-75">{quality}</span>
        </div>
      )}
      
      {/* Regenerate button (appears on hover) */}
      <button
        onClick={generateMockup}
        className="absolute top-3 right-3 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-lg hover:bg-white hover:shadow-xl"
        title="Regenerate mockup"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )
}

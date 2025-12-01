'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Info, Frame } from 'lucide-react'
import Image from 'next/image'

export default function TestImageMagickPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [wallMockups, setWallMockups] = useState<any[]>([])
  const [generatingWallMockups, setGeneratingWallMockups] = useState(false)
  const [psdMockups, setPsdMockups] = useState<any[]>([])
  const [generatingPsdMockups, setGeneratingPsdMockups] = useState(false)
  const [fitMode, setFitMode] = useState<'inside' | 'cover'>('cover')
  const [artworkPosition, setArtworkPosition] = useState({ x: 0.5, y: 0.5 })
  const [showPositionPicker, setShowPositionPicker] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 24, height: 24 }) // Canvas dimensions in inches
  const [artworkScale, setArtworkScale] = useState(0.5) // Scale relative to canvas (0.1 to 1.0)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, scale: 0.5 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target?.result as string)
      reader.readAsDataURL(file)
      setShowPositionPicker(true)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      e.preventDefault()
      setIsDragging(true)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setDragOffset({ 
          x: x - artworkPosition.x, 
          y: y - artworkPosition.y 
        })
      }
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      scale: artworkScale
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - dragOffset.x
      const y = (e.clientY - rect.top) / rect.height - dragOffset.y
      setArtworkPosition({ 
        x: Math.max(0, Math.min(1, x)), 
        y: Math.max(0, Math.min(1, y)) 
      })
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      const avgDelta = (deltaX + deltaY) / 2
      
      // Scale factor: 1px movement = 0.001 scale change
      const scaleDelta = avgDelta * 0.001
      let newScale = resizeStart.scale + scaleDelta
      
      // Clamp between 0.1 and 1.0
      newScale = Math.max(0.1, Math.min(1.0, newScale))
      
      setArtworkScale(newScale)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  const handleSizeChange = (width: number, height: number) => {
    setCanvasSize({ width, height })
  }

  // Common canvas sizes in inches
  const canvasSizes = [
    { name: '18x24', width: 18, height: 24 },
    { name: '24x24', width: 24, height: 24 },
    { name: '24x36', width: 24, height: 36 },
    { name: '30x40', width: 30, height: 40 },
  ]

  // Calculate canvas display size (scale to fit in 500px container)
  const getCanvasDisplaySize = () => {
    const maxSize = 480
    const aspectRatio = canvasSize.width / canvasSize.height
    if (aspectRatio > 1) {
      return { width: maxSize, height: maxSize / aspectRatio }
    } else {
      return { width: maxSize * aspectRatio, height: maxSize }
    }
  }

  const testImageMagick = async () => {
    if (!selectedFile) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/test-imagemagick', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error testing ImageMagick:', error)
      setResult({ 
        success: false, 
        error: 'Failed to test ImageMagick',
        installed: false 
      })
    } finally {
      setLoading(false)
    }
  }

  const generateWallMockups = async () => {
    if (!selectedFile) {
      alert('Please select an image first')
      return
    }

    console.log('Starting wall mockup generation...')
    setGeneratingWallMockups(true)
    setWallMockups([])

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      
      console.log('Sending request to /api/test-wall-mockup...')

      const response = await fetch('/api/test-wall-mockup', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const text = await response.text()
        console.error('Response error:', text)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        console.log('Setting mockups:', data.mockups?.length)
        setWallMockups(data.mockups || [])
      } else {
        console.error('API returned error:', data.error)
        alert('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error generating wall mockups:', error)
      alert('Failed to generate wall mockups: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setGeneratingWallMockups(false)
    }
  }

  const generatePsdMockups = async () => {
    if (!selectedFile) {
      alert('Please select an image first')
      return
    }

    console.log('Starting PSD mockup generation...')
    setGeneratingPsdMockups(true)
    setPsdMockups([])

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('orientation', 'both')
      formData.append('fitMode', fitMode)
      formData.append('focalX', artworkPosition.x.toString())
      formData.append('focalY', artworkPosition.y.toString())
      
      console.log('Sending request to /api/test-psd-mockup...')
      console.log('Fit mode:', fitMode, 'Artwork position:', artworkPosition)

      const response = await fetch('/api/test-psd-mockup', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const text = await response.text()
        console.error('Response error:', text)
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        console.log('Setting PSD mockups:', data.mockups?.length)
        setPsdMockups(data.mockups || [])
        if (data.errors?.length > 0) {
          console.warn('Some mockups had errors:', data.errors)
        }
      } else {
        console.error('API returned error:', data.error)
        alert('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error generating PSD mockups:', error)
      alert('Failed to generate PSD mockups: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setGeneratingPsdMockups(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">ImageMagick Test</h1>
        <p className="text-muted-foreground mb-8">
          Test ImageMagick capabilities for advanced mockup generation
        </p>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                ImageMagick Features
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Displacement Maps:</strong> Realistic fabric wrinkles and folds</li>
                <li>• <strong>Lighting Maps:</strong> Proper highlights and shadows</li>
                <li>• <strong>Adjustment Maps:</strong> Color correction based on fabric</li>
                <li>• <strong>Perspective Transform:</strong> Accurate design placement</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Test Image</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90">
              <Upload className="w-4 h-4" />
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <span className="text-sm text-muted-foreground">
                {selectedFile.name}
              </span>
            )}
          </div>

          {previewUrl && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Fit Mode:</p>
                <div className="flex gap-2">
                  <Button
                    variant={fitMode === 'cover' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFitMode('cover')}
                  >
                    Fill Width (Cover)
                  </Button>
                  <Button
                    variant={fitMode === 'inside' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFitMode('inside')}
                  >
                    Fit Inside
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {fitMode === 'cover' 
                    ? 'Image fills entire width, may crop top/bottom'
                    : 'Image fits completely inside, may show borders'}
                </p>
              </div>

              {fitMode === 'cover' && showPositionPicker && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Canvas Size:
                  </p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {canvasSizes.map((size) => (
                      <Button
                        key={size.name}
                        variant={canvasSize.width === size.width && canvasSize.height === size.height ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSizeChange(size.width, size.height)}
                      >
                        {size.name}"
                      </Button>
                    ))}
                  </div>

                  <p className="text-sm font-medium mb-2">
                    Position Artwork (drag to move):
                  </p>
                  <div 
                    ref={containerRef}
                    className="relative inline-block border-2 border-gray-400 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
                    style={{
                      width: `${getCanvasDisplaySize().width}px`,
                      height: `${getCanvasDisplaySize().height}px`,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* Draggable artwork - sized relative to canvas with adjustable scale */}
                    <div
                      className="absolute cursor-move"
                      style={{
                        left: `${artworkPosition.x * 100}%`,
                        top: `${artworkPosition.y * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${getCanvasDisplaySize().width * artworkScale}px`,
                        height: `${getCanvasDisplaySize().height * artworkScale}px`,
                      }}
                      onMouseDown={handleMouseDown}
                    >
                      <div className="relative shadow-lg w-full h-full">
                        <img
                          src={previewUrl}
                          alt="Artwork"
                          className="w-full h-full object-contain pointer-events-none select-none border-2 border-gray-300 rounded"
                          draggable={false}
                        />
                        {/* Corner resize handles */}
                        <div 
                          className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow cursor-nwse-resize hover:bg-blue-600" 
                          onMouseDown={handleResizeStart}
                        />
                        <div 
                          className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow cursor-nesw-resize hover:bg-blue-600" 
                          onMouseDown={handleResizeStart}
                        />
                        <div 
                          className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow cursor-nesw-resize hover:bg-blue-600" 
                          onMouseDown={handleResizeStart}
                        />
                        <div 
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow cursor-nwse-resize hover:bg-blue-600" 
                          onMouseDown={handleResizeStart}
                        />
                      </div>
                    </div>

                    {/* Canvas with dotted border buffer (20px inset) - rendered LAST so it appears on top */}
                    <div className="absolute inset-5 border-2 border-dashed border-blue-400 pointer-events-none z-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Canvas: {canvasSize.width}x{canvasSize.height}" • 
                    Position: {(artworkPosition.x * 100).toFixed(0)}%, {(artworkPosition.y * 100).toFixed(0)}% • 
                    Scale: {(artworkScale * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dotted border shows safe area with edge buffer
                  </p>
                </div>
              )}

              {fitMode === 'inside' && (
                <div>
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={testImageMagick}
            disabled={!selectedFile || loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test ImageMagick'
            )}
          </Button>
          
          <Button
            onClick={generateWallMockups}
            disabled={!selectedFile || generatingWallMockups}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            {generatingWallMockups ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Frame className="w-4 h-4 mr-2" />
                Wall Mockups
              </>
            )}
          </Button>

          <Button
            onClick={generatePsdMockups}
            disabled={!selectedFile || generatingPsdMockups}
            size="lg"
            variant="outline"
            className="w-full"
          >
            {generatingPsdMockups ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Frame className="w-4 h-4 mr-2" />
                PSD Templates
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className={`border rounded-lg p-6 ${result.success ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ ImageMagick Available' : '❌ ImageMagick Not Available'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">Installation Status:</p>
                <p className="text-sm text-muted-foreground">
                  {result.installed ? 'Installed and working' : 'Not installed or not in PATH'}
                </p>
              </div>

              {result.version && (
                <div>
                  <p className="font-medium">Version:</p>
                  <p className="text-sm font-mono">{result.version}</p>
                </div>
              )}

              {result.capabilities && (
                <div>
                  <p className="font-medium mb-2">Available Operations:</p>
                  <ul className="text-sm space-y-1">
                    {result.capabilities.map((cap: string, i: number) => (
                      <li key={i}>• {cap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.testImage && (
                <div>
                  <p className="font-medium mb-2">Test Output:</p>
                  <div className="relative w-full max-w-md h-64 border rounded-lg overflow-hidden">
                    <Image
                      src={result.testImage}
                      alt="ImageMagick Test Output"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {result.error && (
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">Error:</p>
                  <p className="text-sm font-mono bg-red-100 dark:bg-red-900 p-2 rounded mt-1">
                    {result.error}
                  </p>
                </div>
              )}

              {!result.installed && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-4 mt-4">
                  <p className="font-medium mb-2">To install ImageMagick:</p>
                  <code className="text-sm bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded block">
                    brew install imagemagick
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wall Mockups */}
        {wallMockups.length > 0 && (
          <div className="bg-card border rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Wall Mockups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wallMockups.map((mockup, index) => (
                <div key={index} className="group relative">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <Image
                      src={mockup.url}
                      alt={mockup.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium">{mockup.name}</h3>
                    {mockup.size && (
                      <p className="text-sm text-muted-foreground">{mockup.size}</p>
                    )}
                    {mockup.renderTime && (
                      <p className="text-xs text-muted-foreground">
                        Generated in {mockup.renderTime}ms
                      </p>
                    )}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = mockup.url
                        link.download = `${mockup.name.replace(/\s+/g, '-')}.png`
                        link.click()
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PSD Mockups */}
        {psdMockups.length > 0 && (
          <div className="bg-card border rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">PSD Template Mockups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {psdMockups.map((mockup, index) => (
                <div key={index} className="group relative">
                  <div className="relative aspect-[5/3] rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <Image
                      src={mockup.url}
                      alt={mockup.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium">{mockup.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{mockup.orientation} orientation</p>
                    {mockup.renderTime && (
                      <p className="text-xs text-muted-foreground">
                        Generated in {mockup.renderTime}ms using {mockup.method}
                      </p>
                    )}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = mockup.url
                        link.download = `${mockup.name.replace(/\s+/g, '-')}.jpg`
                        link.click()
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

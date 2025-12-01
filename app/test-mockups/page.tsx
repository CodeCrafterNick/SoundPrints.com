'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function TestMockupsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [mockups, setMockups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'displacement' | 'printify' | 'basic'>('displacement')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generateMockups = async () => {
    if (!selectedFile) return

    setLoading(true)
    setMockups([])

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      let endpoint = ''
      switch (method) {
        case 'displacement':
          endpoint = '/api/test-displacement-mockup'
          break
        case 'printify':
          endpoint = '/api/printify-mockup'
          break
        case 'basic':
          endpoint = '/api/test-basic-mockup'
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (data.success) {
        setMockups(data.mockups || [data.mockup])
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error generating mockups:', error)
      alert('Failed to generate mockups')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Mockup Generation Test</h1>
        <p className="text-muted-foreground mb-8">
          Test different mockup generation techniques
        </p>

        {/* Method Selection */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generation Method</h2>
          <div className="flex gap-4">
            <Button
              variant={method === 'displacement' ? 'default' : 'outline'}
              onClick={() => setMethod('displacement')}
            >
              Displacement Maps
            </Button>
            <Button
              variant={method === 'printify' ? 'default' : 'outline'}
              onClick={() => setMethod('printify')}
            >
              Printify API
            </Button>
            <Button
              variant={method === 'basic' ? 'default' : 'outline'}
              onClick={() => setMethod('basic')}
            >
              Basic Overlay
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {method === 'displacement' && 'Uses displacement maps and fabric texture overlays for realistic results'}
            {method === 'printify' && 'Uses Printify API to generate real mockups'}
            {method === 'basic' && 'Simple canvas-based overlay without advanced effects'}
          </p>
        </div>

        {/* File Upload */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Design</h2>
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
            <div className="mt-4">
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

        {/* Generate Button */}
        <Button
          onClick={generateMockups}
          disabled={!selectedFile || loading}
          size="lg"
          className="w-full mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Mockups...
            </>
          ) : (
            'Generate Mockups'
          )}
        </Button>

        {/* Results */}
        {mockups.length > 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Mockups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockups.map((mockup, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={mockup.url || mockup}
                      alt={mockup.name || `Mockup ${index + 1}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{mockup.name || `Mockup ${index + 1}`}</p>
                    {mockup.renderTime && (
                      <p className="text-sm text-muted-foreground">
                        Generated in {mockup.renderTime}ms
                      </p>
                    )}
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

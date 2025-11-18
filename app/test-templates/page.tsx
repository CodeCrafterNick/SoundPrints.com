'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Upload, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Template {
  id: string
  name: string
  productType: string
  color: string
  angle: string
  basePath: string
  maskPath?: string
  shadowPath?: string
  highlightPath?: string
  displacementPath?: string
  printArea: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface TemplateLibrary {
  templates: Template[]
  version: string
  lastUpdated: string
}

export default function TestTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [mockupUrl, setMockupUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [renderTime, setRenderTime] = useState<string>('')

  // Load templates on mount
  useEffect(() => {
    fetch('/api/generate-mockup?action=templates')
      .then(res => res.json())
      .then((data: TemplateLibrary) => {
        setTemplates(data.templates)
        if (data.templates.length > 0) {
          setSelectedTemplate(data.templates[0].id)
        }
      })
      .catch(err => console.error('Failed to load templates:', err))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesignFile(file)
    }
  }

  const handleGenerate = async () => {
    if (!designFile || !selectedTemplate) {
      alert('Please select a template and upload a design file')
      return
    }

    setLoading(true)
    setMockupUrl('')
    setRenderTime('')

    try {
      const formData = new FormData()
      formData.append('design', designFile)
      formData.append('templateId', selectedTemplate)
      formData.append('mode', 'mask')
      formData.append('brightness', '0.92')
      formData.append('blendMode', 'multiply')
      formData.append('textureOverlay', 'true')
      formData.append('textureOpacity', '0.15')

      console.log('Generating mockup:', {
        templateId: selectedTemplate,
        fileName: designFile.name,
        fileSize: designFile.size
      })

      const startTime = Date.now()
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error:', errorText)
        throw new Error(`Mockup generation failed: ${response.status} - ${errorText}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const time = response.headers.get('X-Generation-Time') || `${Date.now() - startTime}ms`
      
      setMockupUrl(url)
      setRenderTime(time)
      console.log('Mockup generated successfully in', time)
    } catch (error) {
      console.error('Generation error:', error)
      alert(`Failed to generate mockup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async (templateId: string) => {
    try {
      const response = await fetch(`/api/generate-mockup?action=preview&templateId=${templateId}`)
      if (!response.ok) throw new Error('Preview failed')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Preview error:', error)
      alert('Failed to preview template')
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/create"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Create</span>
          </Link>
          <h1 className="text-2xl font-bold">Template Tester</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Controls */}
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Select Template</h2>
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedTemplate === template.id
                        ? 'bg-indigo-500 border-2 border-indigo-300'
                        : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-white/60 mt-1">
                          {template.productType} · {template.color} · {template.angle}
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Info */}
            {selectedTemplateData && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4">Template Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">ID:</span>
                    <span className="font-mono">{selectedTemplateData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Print Area:</span>
                    <span className="font-mono">
                      x:{selectedTemplateData.printArea.x} y:{selectedTemplateData.printArea.y} 
                      w:{selectedTemplateData.printArea.width} h:{selectedTemplateData.printArea.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Mask:</span>
                    <span>{selectedTemplateData.maskPath ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Shadow:</span>
                    <span>{selectedTemplateData.shadowPath ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Highlight:</span>
                    <span>{selectedTemplateData.highlightPath ? '✓' : '✗'}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handlePreview(selectedTemplateData.id)}
                  variant="outline"
                  className="w-full mt-4 bg-white/10 border-white/20 hover:bg-white/20"
                >
                  Preview Print Area
                </Button>
              </div>
            )}

            {/* Upload Design */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Upload Design</h2>
              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-white/50 transition-colors bg-white/5">
                    {designFile ? (
                      <div className="text-center">
                        <Check className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <div className="text-sm">{designFile.name}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-white/60" />
                        <div className="text-sm text-white/60">Click to upload PNG/JPG</div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <Button
                  onClick={handleGenerate}
                  disabled={!designFile || !selectedTemplate || loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  {loading ? 'Generating...' : 'Generate Mockup'}
                </Button>

                {renderTime && (
                  <div className="text-sm text-center text-white/60">
                    Rendered in {renderTime}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Mockup Preview</h2>
            <div className="aspect-square bg-black/20 rounded-xl overflow-hidden flex items-center justify-center">
              {mockupUrl ? (
                <img
                  src={mockupUrl}
                  alt="Generated mockup"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white/40 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <div>Your mockup will appear here</div>
                </div>
              )}
            </div>
            {mockupUrl && (
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = mockupUrl
                  link.download = `mockup-${selectedTemplate}.png`
                  link.click()
                }}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
              >
                Download Mockup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

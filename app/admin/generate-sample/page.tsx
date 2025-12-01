'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Download, Copy, CheckCircle } from 'lucide-react'

export default function GenerateSamplePage() {
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const generateSample = () => {
    setGenerating(true)

    // Create a simple soundwave on canvas
    const canvas = document.createElement('canvas')
    canvas.width = 3000
    canvas.height = 2000
    const ctx = canvas.getContext('2d')!

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw sample waveform
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const centerY = canvas.height / 2
    const waveWidth = canvas.width * 0.8
    const startX = canvas.width * 0.1
    const points = 200

    ctx.beginPath()
    for (let i = 0; i < points; i++) {
      const x = startX + (i / points) * waveWidth
      const amplitude = Math.sin(i / 10) * 300 + Math.random() * 200
      const y = centerY + amplitude * Math.sin(i / 3)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Add text
    ctx.font = 'bold 80px Arial'
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'center'
    ctx.fillText('Sample SoundPrint', canvas.width / 2, 150)

    // Convert to blob and upload
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error('Failed to generate image')
        setGenerating(false)
        return
      }

      try {
        // Create a form data
        const formData = new FormData()
        formData.append('file', blob, 'sample-soundprint.png')

        // Upload to your existing upload endpoint or directly to Supabase
        const response = await fetch('/api/upload-sample', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        setImageUrl(data.url)
        toast.success('Sample image generated and uploaded!')
      } catch (error: any) {
        console.error('Upload error:', error)
        
        // Fallback: provide data URL
        const dataUrl = canvas.toDataURL('image/png')
        setImageUrl(dataUrl)
        toast.warning('Generated locally. For Printify, you need to upload this to a public URL.')
      } finally {
        setGenerating(false)
      }
    }, 'image/png')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(imageUrl)
    setCopied(true)
    toast.success('URL copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadImage = () => {
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'sample-soundprint.png'
    a.click()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Sample SoundPrint Image</h1>
          <p className="text-muted-foreground">
            Create a sample soundprint image to use as a placeholder for Printify products.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div>
            <Button
              onClick={generateSample}
              disabled={generating}
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Sample Image'
              )}
            </Button>
          </div>

          {imageUrl && (
            <>
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">Generated Image Preview</h3>
                <img
                  src={imageUrl}
                  alt="Sample SoundPrint"
                  className="w-full border rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded-lg bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={downloadImage}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                {imageUrl.startsWith('data:') && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ This is a data URL. For Printify, you need to upload this image to a publicly accessible URL 
                    (like Supabase storage, Imgur, or your own server) and use that URL instead.
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Download the image using the download button above</li>
                  <li>Upload it to a public hosting service (Supabase, Imgur, etc.)</li>
                  <li>Copy the public URL</li>
                  <li>Go to the Printify Products page and paste the URL</li>
                  <li>Create your products!</li>
                </ol>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-card rounded-lg border">
          <h3 className="font-semibold mb-2">Upload Options</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Option 1: Supabase Storage</strong> - Upload to your Supabase storage bucket</p>
            <p><strong>Option 2: Imgur</strong> - Free image hosting at imgur.com</p>
            <p><strong>Option 3: GitHub</strong> - Upload to a GitHub repo and use the raw URL</p>
            <p><strong>Option 4: Any CDN</strong> - Use any image CDN or hosting service</p>
          </div>
        </div>
      </div>
    </div>
  )
}

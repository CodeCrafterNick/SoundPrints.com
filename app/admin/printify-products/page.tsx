'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Package, Image, CheckCircle, AlertCircle } from 'lucide-react'

interface ProductTemplate {
  title: string
  description: string
  blueprintId: number
  category: string
  tags: string[]
}

const WALL_ART_TEMPLATES: ProductTemplate[] = [
  {
    title: 'Custom SoundPrint Poster - Vertical',
    description: 'Turn your favorite sound into a beautiful vertical poster. Premium quality matte finish print.',
    blueprintId: 282, // Matte Vertical Posters
    category: 'Posters',
    tags: ['soundprint', 'poster', 'wall art', 'custom', 'vertical']
  },
  {
    title: 'Custom SoundPrint Poster - Horizontal',
    description: 'Horizontal poster perfect for any room. Premium matte finish with vivid colors.',
    blueprintId: 284, // Matte Horizontal Posters
    category: 'Posters',
    tags: ['soundprint', 'poster', 'wall art', 'custom', 'horizontal']
  },
  {
    title: 'Custom SoundPrint Satin Poster',
    description: 'High-quality satin poster (210gsm) with your sound wave design. Elegant finish.',
    blueprintId: 97, // Satin Posters (210gsm)
    category: 'Posters',
    tags: ['soundprint', 'poster', 'wall art', 'custom', 'satin']
  },
  {
    title: 'Custom SoundPrint Canvas',
    description: 'Your personal sound wave on stretched canvas. Gallery-quality print ready to hang.',
    blueprintId: 555, // Stretched Canvas
    category: 'Canvas',
    tags: ['soundprint', 'canvas', 'wall art', 'custom', 'stretched']
  },
  {
    title: 'Custom SoundPrint Framed Poster - Vertical',
    description: 'Ready-to-hang vertical framed poster with black or white frame. Professional presentation.',
    blueprintId: 492, // Vertical Framed Poster
    category: 'Framed',
    tags: ['soundprint', 'framed', 'poster', 'vertical', 'custom']
  },
  {
    title: 'Custom SoundPrint Framed Poster - Horizontal',
    description: 'Ready-to-hang horizontal framed poster with black or white frame. Clean and modern.',
    blueprintId: 493, // Horizontal Framed Poster
    category: 'Framed',
    tags: ['soundprint', 'framed', 'poster', 'horizontal', 'custom']
  },
  {
    title: 'Custom SoundPrint Giclée Art Print',
    description: 'Museum-quality giclée art print with your sound wave. Premium archival paper.',
    blueprintId: 494, // Giclée Art Print
    category: 'Fine Art',
    tags: ['soundprint', 'giclee', 'art print', 'custom', 'museum quality']
  },
  {
    title: 'Custom SoundPrint Paper Poster',
    description: 'Classic paper poster with your sound wave design. Affordable and versatile.',
    blueprintId: 554, // Paper Poster
    category: 'Posters',
    tags: ['soundprint', 'paper', 'poster', 'custom', 'affordable']
  }
]

interface ProductStatus {
  template: ProductTemplate
  status: 'pending' | 'uploading' | 'creating' | 'success' | 'error'
  productId?: string
  error?: string
}

export default function PrintifyProductsPage() {
  const [creating, setCreating] = useState(false)
  const [products, setProducts] = useState<ProductStatus[]>([])
  const [sampleImageUrl, setSampleImageUrl] = useState('')

  const createAllProducts = async () => {
    if (!sampleImageUrl) {
      toast.error('Please provide a sample image URL first')
      return
    }

    // Validate image URL
    try {
      new URL(sampleImageUrl)
    } catch {
      toast.error('Please provide a valid image URL')
      return
    }

    setCreating(true)
    setProducts(WALL_ART_TEMPLATES.map(template => ({
      template,
      status: 'pending'
    })))

    for (let i = 0; i < WALL_ART_TEMPLATES.length; i++) {
      const template = WALL_ART_TEMPLATES[i]
      
      try {
        // Update status to uploading
        setProducts(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'uploading' } : p
        ))

        // Create product via API
        const response = await fetch('/api/printify/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: template.title,
            description: template.description,
            blueprintId: template.blueprintId,
            tags: template.tags,
            imageUrl: sampleImageUrl,
            visible: false // Don't publish yet
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }))
          throw new Error(`Failed to create product: ${errorData.error || response.statusText}`)
        }

        const data = await response.json()

        // Update status to success
        setProducts(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'success', productId: data.product.id } : p
        ))

        toast.success(`Created: ${template.title}`)

      } catch (error: any) {
        console.error(`Error creating ${template.title}:`, error)
        
        setProducts(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error', error: error.message } : p
        ))

        toast.error(`Failed: ${template.title}`)
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setCreating(false)
    toast.success('Product creation complete!')
  }

  const getStatusIcon = (status: ProductStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="h-5 w-5 text-gray-400" />
      case 'uploading':
      case 'creating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: ProductStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'uploading':
      case 'creating':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Printify Wall Art Products</h1>
          <p className="text-muted-foreground">
            Set up all wall art products in your Printify shop. This will create posters, canvas prints, 
            framed prints, and more with sample designs.
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sample Image URL (3000x2000px or higher recommended)
              </label>
              <input
                type="text"
                value={sampleImageUrl}
                onChange={(e) => setSampleImageUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://example.com/sample-soundprint.png"
                disabled={creating}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use a high-resolution SoundPrint design as a placeholder. The image must be publicly accessible.
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                💡 Tip: Upload a sample image to your Supabase storage or use a service like Imgur, and paste the public URL here.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={createAllProducts}
                disabled={creating || !sampleImageUrl}
                size="lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Products...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-5 w-5" />
                    Create All Wall Art Products ({WALL_ART_TEMPLATES.length})
                  </>
                )}
              </Button>

              {products.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {products.filter(p => p.status === 'success').length} / {products.length} complete
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product List */}
        {products.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-4">Product Creation Status</h2>
            
            {products.map((product, idx) => (
              <div
                key={idx}
                className="bg-card rounded-lg border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(product.status)}
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{product.template.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {product.template.description}
                    </p>
                    {product.error && (
                      <p className="text-sm text-red-500 mt-1">{product.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                    
                    {product.productId && (
                      <span className="text-xs text-muted-foreground">
                        ID: {product.productId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {products.length === 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Product Templates</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(
                WALL_ART_TEMPLATES.reduce((acc, template) => {
                  if (!acc[template.category]) acc[template.category] = []
                  acc[template.category].push(template)
                  return acc
                }, {} as Record<string, ProductTemplate[]>)
              ).map(([category, templates]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-lg">{category}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {templates.map((template, idx) => (
                      <li key={idx}>• {template.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2">📝 Next Steps After Creation:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Visit your Printify dashboard to review all products</li>
                <li>Update product images with actual SoundPrint designs</li>
                <li>Adjust pricing and profit margins as needed</li>
                <li>Enable products (set visible: true) when ready</li>
                <li>Test with a sample order using is_printify_express: false</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

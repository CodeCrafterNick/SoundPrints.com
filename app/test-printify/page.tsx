'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Package, FileImage, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

export default function PrintifyTestPage() {
  const [loading, setLoading] = useState(false)
  const [catalog, setCatalog] = useState<any>(null)
  const [products, setProducts] = useState<any>(null)
  const [testOrderResult, setTestOrderResult] = useState<any>(null)

  const fetchCatalog = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/printify/catalog')
      const data = await response.json()
      setCatalog(data)
      toast.success('Catalog loaded!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch catalog')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/printify/products')
      const data = await response.json()
      setProducts(data)
      toast.success(`Found ${data.products?.data?.length || 0} products!`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const createTestOrder = async () => {
    if (!products?.products?.data?.[0]) {
      toast.error('Please fetch products first!')
      return
    }

    setLoading(true)
    try {
      const firstProduct = products.products.data[0]
      const firstVariant = firstProduct.variants[0]

      const response = await fetch('/api/printify/orders/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: firstProduct.id,
          variantId: firstVariant.id,
          printFileUrl: 'https://via.placeholder.com/3000x3000/000000/FFFFFF?text=Test+SoundPrint',
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@soundprints.com',
            address: '123 Test Street',
            city: 'Test City',
            state: 'CA',
            zipCode: '90210',
            country: 'US',
          },
        }),
      })

      const data = await response.json()
      setTestOrderResult(data)
      
      if (data.success) {
        toast.success('Test order created! (No actual printing will occur)')
      } else {
        toast.error(data.error || 'Failed to create test order')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create test order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Printify API Test</h1>

        <div className="space-y-6">
          {/* Catalog Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              1. Fetch Catalog
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Get all available blueprints (product types) and print providers
            </p>
            <Button onClick={fetchCatalog} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch Catalog
            </Button>
            {catalog && (
              <div className="mt-4 p-4 bg-muted rounded">
                <p className="text-sm font-mono">
                  Blueprints: {catalog.blueprints?.length || 0}
                </p>
                <p className="text-sm font-mono">
                  Providers: {catalog.providers?.length || 0}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-primary">View JSON</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {JSON.stringify(catalog, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileImage className="mr-2 h-5 w-5" />
              2. Fetch Your Products
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Get all products currently in your Printify shop
            </p>
            <Button onClick={fetchProducts} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Fetch Products
            </Button>
            {products && (
              <div className="mt-4 p-4 bg-muted rounded">
                <p className="text-sm font-mono">
                  Total Products: {products.products?.data?.length || 0}
                </p>
                {products.products?.data?.[0] && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">First Product:</p>
                    <p className="text-xs font-mono">ID: {products.products.data[0].id}</p>
                    <p className="text-xs font-mono">Title: {products.products.data[0].title}</p>
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-primary">View JSON</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {JSON.stringify(products, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Test Order Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              3. Create Test Order
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create a test order that won't actually print or charge
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Test Mode:</strong> This order will be created with{' '}
                <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                  is_printify_express: false
                </code>
                , so it won't be printed or shipped.
              </p>
            </div>
            <Button 
              onClick={createTestOrder} 
              disabled={loading || !products}
              variant={products ? 'default' : 'secondary'}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Test Order
            </Button>
            {testOrderResult && (
              <div className="mt-4 p-4 bg-muted rounded">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                  ✓ {testOrderResult.note}
                </p>
                {testOrderResult.order && (
                  <div>
                    <p className="text-xs font-mono">Order ID: {testOrderResult.order.id}</p>
                    <p className="text-xs font-mono">Status: {testOrderResult.order.status}</p>
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-primary">View JSON</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {JSON.stringify(testOrderResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-2">📚 Documentation</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Printify API Docs: <a href="https://developers.printify.com/" target="_blank" className="text-primary hover:underline">https://developers.printify.com/</a></li>
            <li>• Your Shop ID: <code className="bg-muted px-1 rounded">{process.env.NEXT_PUBLIC_PRINTIFY_SHOP_ID || 'Not set'}</code></li>
            <li>• Test orders use <code className="bg-muted px-1 rounded">is_printify_express: false</code></li>
            <li>• Production orders use <code className="bg-muted px-1 rounded">is_printify_express: true</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AudioUploader } from '@/components/customizer/audio-uploader'
import { WaveformEditor } from '@/components/customizer/waveform-editor'
import { WaveformPreview } from '@/components/customizer/waveform-preview'
import { WaveformCanvasPreview } from '@/components/products/waveform-canvas-preview'
import { ProductCategorySelector } from '@/components/products/product-category-selector'
import { ProductMockupDisplay } from '@/components/products/product-mockup-display'
import { StyleCustomizer } from '@/components/customizer/style-customizer'
import { ColorCustomizer } from '@/components/customizer/color-customizer'
import { TextCustomizer } from '@/components/customizer/text-customizer'
import { BackgroundCustomizer } from '@/components/customizer/background-customizer'
import { QRCodeCustomizer } from '@/components/customizer/qrcode-customizer'
import { ProductSelector } from '@/components/products/product-selector'
import { ProductMockup, type ProductMockupRef } from '@/components/products/product-mockup'
import { RoomShowcase } from '@/components/products/room-showcase'
import { CartDialog } from '@/components/cart/cart-dialog'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronLeft, ShoppingCart, Check, Upload, Activity, Sparkles, Palette, Type, Image, QrCode, Package, Edit3 } from 'lucide-react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { toast } from 'sonner'

export default function CreatePage() {
  const [openAccordion, setOpenAccordion] = useState<string>('upload')
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState({ upload: false, waveform: false })
  const mockupRef = useRef<ProductMockupRef>(null)
  const audioFile = useCustomizerStore((state) => state.audioFile)
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  
  // Auto-expand next section when step is completed (but only once)
  useEffect(() => {
    if (audioUrl && openAccordion === 'upload' && !hasAutoAdvanced.upload) {
      const timer = setTimeout(() => {
        setOpenAccordion('waveform')
        setHasAutoAdvanced(prev => ({ ...prev, upload: true }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [audioUrl, openAccordion, hasAutoAdvanced.upload])

  useEffect(() => {
    if (selectedRegion && openAccordion === 'waveform' && !hasAutoAdvanced.waveform) {
      const timer = setTimeout(() => {
        setOpenAccordion('colors')
        setHasAutoAdvanced(prev => ({ ...prev, waveform: true }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [selectedRegion, openAccordion, hasAutoAdvanced.waveform])
  const audioFileName = useCustomizerStore((state) => state.audioFile?.name || '')
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const selectedProduct = useCustomizerStore((state) => state.selectedProduct)
  const selectedSize = useCustomizerStore((state) => state.selectedSize)
  const customText = useCustomizerStore((state) => state.customText)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    if (!audioUrl) return

    // Get product price based on type
    const prices: Record<string, number> = {
      'poster': 29.99,
      't-shirt': 34.99,
      'mug': 19.99,
      'canvas': 49.99,
      'hoodie': 49.99,
    }

    addItem({
      audioFileName,
      audioFileUrl: audioUrl,
      waveformColor,
      backgroundColor,
      productType: selectedProduct,
      size: selectedSize,
      customText,
      price: prices[selectedProduct] || 29.99,
    })

    toast.success('Added to cart!', {
      description: `${selectedProduct.replace('-', ' ')} (${selectedSize}) has been added to your cart.`,
    })
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Create Your SoundPrint</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                disabled={!audioUrl}
                onClick={async () => {
                  if (mockupRef.current?.getPrintFile) {
                    try {
                      const printFile = await mockupRef.current.getPrintFile()
                      // Create download link
                      const link = document.createElement('a')
                      link.href = printFile
                      link.download = `soundprint-${Date.now()}.png`
                      link.click()
                    } catch (error) {
                      console.error('Failed to generate print file:', error)
                      alert('Failed to generate print file')
                    }
                  }
                }}
                variant="outline"
              >
                Download Print File (Test)
              </Button>
              <Button 
                size="sm" 
                disabled={!audioUrl}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <CartDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Sidebar + Preview */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6 h-full">
          {/* Left Sidebar - Controls */}
          <div className="bg-background rounded-lg shadow-xl p-6 h-fit max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Customize</h2>
            
            {/* Waveform Preview - Always visible when audio is uploaded */}
            <WaveformPreview onEditClick={() => setOpenAccordion('waveform')} />
            
            <Accordion
              type="single"
              collapsible
              value={openAccordion}
              onValueChange={setOpenAccordion}
              className="w-full"
            >
              <AccordionItem value="upload">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span>Upload Audio</span>
                    {audioUrl && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Choose a song, voice message, or any audio moment
                    </p>
                    <AudioUploader />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="waveform" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <span>Edit Waveform</span>
                    {selectedRegion && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select the portion of audio to print
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Waveform Editor - Keep mounted but hidden */}
              {audioUrl && (
                <div className={openAccordion === 'waveform' ? 'block' : 'hidden'}>
                  <WaveformEditor />
                </div>
              )}

              <AccordionItem value="style" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                    <span>Waveform Style</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose your waveform visualization style
                    </p>
                    <StyleCustomizer />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="colors" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <span>Customize Colors</span>
                    {(waveformColor !== '#000000' || backgroundColor !== '#FFFFFF') && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose your waveform and background colors
                    </p>
                    <ColorCustomizer />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="text" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-muted-foreground" />
                    <span>Add Text</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Personalize with song title, date, or custom message
                    </p>
                    <TextCustomizer />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="background" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-muted-foreground" />
                    <span>Background Image</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Add a personal photo as background
                    </p>
                    <BackgroundCustomizer />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="qrcode" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <span>QR Code</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Add a scannable QR code to your design
                    </p>
                    <QRCodeCustomizer />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="product" disabled={!audioUrl}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span>Choose Product</span>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a product and size
                    </p>
                    <ProductSelector />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right Side - Preview Stack */}
          <div className="space-y-6">
            {/* Top: Clean Waveform Preview - Hidden for now */}
            {false && (
              <div className="bg-background/95 backdrop-blur rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Your Design</h3>
                <WaveformCanvasPreview />
              </div>
            )}

            {/* Middle: Large Product Mockup */}
            <div className="bg-background/95 backdrop-blur rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Product Preview</h3>
              {/* Hidden ProductMockup to generate the canvas */}
              <div className="hidden">
                <ProductMockup ref={mockupRef} />
              </div>
              
              {/* Display product with waveform overlay */}
              {audioUrl ? (
                <ProductMockupDisplay mockupRef={mockupRef} />
              ) : (
                <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Upload audio to see product preview</p>
                </div>
              )}
            </div>

            {/* Bottom: Product Category Selector */}
            <div className="bg-background/95 backdrop-blur rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Choose Product</h3>
              <ProductCategorySelector />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

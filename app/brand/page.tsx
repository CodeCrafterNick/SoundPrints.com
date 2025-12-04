'use client'

import { useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { 
  Logo, 
  WaveformIcon, 
  CircularWaveformIcon, 
  SLetterIcon,
  colorSchemes,
  type ColorScheme 
} from '@/components/brand'
import { Check, Copy, Palette, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BrandPage() {
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>(colorSchemes[0])
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color)
    setCopiedColor(color)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Palette className="h-4 w-4" />
                Brand Assets
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                SoundPrints Brand Kit
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Logo variations and color schemes for your SoundPrints brand
              </p>
            </div>

            {/* Logo Variations */}
            <section className="mb-20">
              <h2 className="text-2xl font-bold mb-8">Logo Variations</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Light backgrounds */}
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    On Light Backgrounds
                  </h3>
                  
                  <div className="bg-white border rounded-2xl p-8 space-y-8">
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">Full Logo (Horizontal)</p>
                      <Logo variant="horizontal" size="lg" />
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">With Tagline</p>
                      <Logo variant="horizontal" size="lg" showTagline />
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">Stacked</p>
                      <Logo variant="stacked" size="lg" showTagline />
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs text-muted-foreground mb-3">Icon Only</p>
                        <Logo variant="icon" size="lg" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-3">Small</p>
                        <Logo variant="horizontal" size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark backgrounds */}
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    On Dark Backgrounds
                  </h3>
                  
                  <div className="bg-gray-900 rounded-2xl p-8 space-y-8">
                    <div>
                      <p className="text-xs text-gray-400 mb-3">Full Logo (Light)</p>
                      <Logo variant="horizontal" size="lg" theme="light" />
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-3">With Tagline</p>
                      <Logo variant="horizontal" size="lg" theme="light" showTagline />
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-3">Stacked</p>
                      <Logo variant="stacked" size="lg" theme="light" showTagline />
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs text-gray-400 mb-3">Icon Only</p>
                        <Logo variant="icon" size="lg" theme="light" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-3">Small</p>
                        <Logo variant="horizontal" size="sm" theme="light" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Icons */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Alternative Icon Styles
                </h3>
                <div className="flex items-center gap-8 p-6 bg-muted/30 rounded-xl">
                  <div className="text-center">
                    <WaveformIcon size={48} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Waveform</p>
                  </div>
                  <div className="text-center">
                    <CircularWaveformIcon size={48} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Circular</p>
                  </div>
                  <div className="text-center">
                    <SLetterIcon size={48} className="text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Letter S</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Color Schemes */}
            <section>
              <h2 className="text-2xl font-bold mb-8">Color Schemes</h2>
              <p className="text-muted-foreground mb-8">
                Choose a color scheme that fits your brand vision. Click on any color to copy its hex value.
              </p>
              
              {/* Scheme Selector */}
              <div className="flex flex-wrap gap-3 mb-8">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setSelectedScheme(scheme)}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2',
                      selectedScheme.id === scheme.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    )}
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: scheme.colors.primary }}
                    />
                    <span className="font-medium text-sm">{scheme.name}</span>
                  </button>
                ))}
              </div>

              {/* Selected Scheme Details */}
              <div className="bg-card border rounded-2xl overflow-hidden">
                {/* Header with gradient */}
                <div 
                  className={cn('p-8 text-white bg-gradient-to-r', selectedScheme.gradient)}
                >
                  <h3 className="text-2xl font-bold mb-2">{selectedScheme.name}</h3>
                  <p className="opacity-90">{selectedScheme.description}</p>
                </div>
                
                {/* Color Swatches */}
                <div className="p-8">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Color Palette
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {selectedScheme.preview.light.map((color, i) => (
                      <button
                        key={color}
                        onClick={() => copyToClipboard(color)}
                        className="group relative"
                      >
                        <div 
                          className="h-20 rounded-xl shadow-sm border transition-transform group-hover:scale-105"
                          style={{ backgroundColor: color }}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-mono">{color}</span>
                          {copiedColor === color ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* All Colors */}
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    All Theme Colors
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(selectedScheme.colors).map(([name, color]) => (
                      <button
                        key={name}
                        onClick={() => copyToClipboard(color)}
                        className="group flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{color}</p>
                        </div>
                        {copiedColor === color ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview with selected colors */}
                <div className="p-8 border-t bg-muted/30">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Preview
                  </h4>
                  
                  <div className="flex items-center gap-4 p-6 rounded-xl" style={{ backgroundColor: selectedScheme.colors.background }}>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: selectedScheme.colors.primary + '20' }}
                    >
                      <Sparkles className="h-6 w-6" style={{ color: selectedScheme.colors.primary }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: selectedScheme.colors.foreground }}>
                        Sound<span style={{ color: selectedScheme.colors.primary }}>Prints</span>
                      </p>
                      <p className="text-sm" style={{ color: selectedScheme.colors.mutedForeground }}>
                        Turn Sound Into Art
                      </p>
                    </div>
                    <div className="ml-auto">
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ 
                          backgroundColor: selectedScheme.colors.primary,
                          color: selectedScheme.colors.primaryForeground
                        }}
                      >
                        Create Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}

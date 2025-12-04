"use client"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { 
  ArrowRight, 
  Heart, 
  ShoppingCart, 
  Download, 
  Play, 
  Star,
  Sparkles,
  Gift,
  Zap
} from "lucide-react"

export default function DesignSystemPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
          <div className="container-wide">
            <div className="text-center mb-16">
              <h1 className="mb-4">
                <span className="text-gradient">Design System</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Modern, professional button components and color schemes for SoundPrints
              </p>
            </div>
          </div>
        </section>

        {/* Button Variants Section */}
        <section className="section-padding">
          <div className="container-wide">
            <h2 className="text-3xl font-bold mb-12 text-center">Button Variants</h2>
            
            {/* Primary Buttons */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Primary Actions</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="default">
                  Default <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="pill">
                  Pill Button <Heart className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="gradient">
                  <Sparkles className="mr-2 h-4 w-4" /> Gradient
                </Button>
                <Button variant="premium">
                  <Star className="mr-2 h-4 w-4" /> Premium
                </Button>
                <Button variant="success">
                  Success <Zap className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Animated Buttons */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Animated Effects</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="glow">
                  Glow Effect
                </Button>
                <Button variant="shimmer">
                  Shimmer Effect
                </Button>
                <Button variant="3d">
                  3D Button
                </Button>
                <Button variant="neon">
                  Neon Style
                </Button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Secondary Actions</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="secondary">
                  Secondary
                </Button>
                <Button variant="outline">
                  Outline
                </Button>
                <Button variant="outline-primary">
                  Outline Primary
                </Button>
                <Button variant="soft">
                  Soft
                </Button>
                <Button variant="ghost">
                  Ghost
                </Button>
              </div>
            </div>

            {/* Dark & Glass */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Dark & Glass Styles</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="dark">
                  Dark Button
                </Button>
                <div className="p-8 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600">
                  <Button variant="glass">
                    Glass Effect
                  </Button>
                </div>
              </div>
            </div>

            {/* Link & Minimal */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Link & Minimal Styles</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="link">
                  Link Button
                </Button>
                <Button variant="minimal">
                  Minimal Style
                </Button>
              </div>
            </div>

            {/* Destructive */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Destructive Actions</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="destructive">
                  Delete Item
                </Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Button Sizes</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <Button variant="default" size="sm">
                  Small
                </Button>
                <Button variant="default" size="default">
                  Default
                </Button>
                <Button variant="default" size="lg">
                  Large
                </Button>
                <Button variant="default" size="xl">
                  Extra Large
                </Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Icon Buttons</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="default" size="icon-sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon-lg">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading States */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Loading States</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="default" loading>
                  Loading...
                </Button>
                <Button variant="secondary" loading>
                  Processing...
                </Button>
                <Button variant="outline" loading>
                  Please wait...
                </Button>
              </div>
            </div>

            {/* Real Use Cases */}
            <div className="mb-16">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Real-World Examples</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* CTA Card */}
                <div className="card-modern p-6">
                  <h4 className="font-semibold mb-2">Add to Cart</h4>
                  <p className="text-gray-500 text-sm mb-4">Primary conversion action</p>
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart - $49.99
                  </Button>
                </div>

                {/* Premium Card */}
                <div className="card-modern p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                  <h4 className="font-semibold mb-2">Upgrade to Premium</h4>
                  <p className="text-gray-500 text-sm mb-4">Special offer styling</p>
                  <Button variant="premium" className="w-full" size="lg">
                    <Star className="mr-2 h-4 w-4" />
                    Unlock Premium
                  </Button>
                </div>

                {/* Gift Card */}
                <div className="card-modern p-6">
                  <h4 className="font-semibold mb-2">Gift a SoundPrint</h4>
                  <p className="text-gray-500 text-sm mb-4">Secondary action styling</p>
                  <Button variant="gradient" className="w-full" size="lg">
                    <Gift className="mr-2 h-4 w-4" />
                    Send as Gift
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette Section */}
        <section className="section-padding bg-gray-50">
          <div className="container-wide">
            <h2 className="text-3xl font-bold mb-12 text-center">Color Palette</h2>
            
            {/* Primary Colors */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Primary Rose</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                <div className="aspect-square rounded-lg bg-rose-50 flex items-end justify-center pb-2 text-xs">50</div>
                <div className="aspect-square rounded-lg bg-rose-100 flex items-end justify-center pb-2 text-xs">100</div>
                <div className="aspect-square rounded-lg bg-rose-200 flex items-end justify-center pb-2 text-xs">200</div>
                <div className="aspect-square rounded-lg bg-rose-300 flex items-end justify-center pb-2 text-xs">300</div>
                <div className="aspect-square rounded-lg bg-rose-400 flex items-end justify-center pb-2 text-xs text-white">400</div>
                <div className="aspect-square rounded-lg bg-rose-500 flex items-end justify-center pb-2 text-xs text-white">500</div>
                <div className="aspect-square rounded-lg bg-rose-600 flex items-end justify-center pb-2 text-xs text-white">600</div>
                <div className="aspect-square rounded-lg bg-rose-700 flex items-end justify-center pb-2 text-xs text-white">700</div>
                <div className="aspect-square rounded-lg bg-rose-800 flex items-end justify-center pb-2 text-xs text-white">800</div>
                <div className="aspect-square rounded-lg bg-rose-900 flex items-end justify-center pb-2 text-xs text-white">900</div>
              </div>
            </div>

            {/* Gray Scale */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Gray Scale</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                <div className="aspect-square rounded-lg bg-gray-50 flex items-end justify-center pb-2 text-xs">50</div>
                <div className="aspect-square rounded-lg bg-gray-100 flex items-end justify-center pb-2 text-xs">100</div>
                <div className="aspect-square rounded-lg bg-gray-200 flex items-end justify-center pb-2 text-xs">200</div>
                <div className="aspect-square rounded-lg bg-gray-300 flex items-end justify-center pb-2 text-xs">300</div>
                <div className="aspect-square rounded-lg bg-gray-400 flex items-end justify-center pb-2 text-xs text-white">400</div>
                <div className="aspect-square rounded-lg bg-gray-500 flex items-end justify-center pb-2 text-xs text-white">500</div>
                <div className="aspect-square rounded-lg bg-gray-600 flex items-end justify-center pb-2 text-xs text-white">600</div>
                <div className="aspect-square rounded-lg bg-gray-700 flex items-end justify-center pb-2 text-xs text-white">700</div>
                <div className="aspect-square rounded-lg bg-gray-800 flex items-end justify-center pb-2 text-xs text-white">800</div>
                <div className="aspect-square rounded-lg bg-gray-900 flex items-end justify-center pb-2 text-xs text-white">900</div>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 text-gray-700">Accent Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <div className="text-sm font-medium">Violet</div>
                  <div className="text-xs opacity-80">#8b5cf6</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  <div className="text-sm font-medium">Emerald</div>
                  <div className="text-xs opacity-80">#10b981</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950">
                  <div className="text-sm font-medium">Amber</div>
                  <div className="text-xs opacity-80">#f59e0b</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white">
                  <div className="text-sm font-medium">Sky</div>
                  <div className="text-xs opacity-80">#0ea5e9</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white">
                  <div className="text-sm font-medium">Fuchsia</div>
                  <div className="text-xs opacity-80">#d946ef</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="section-padding">
          <div className="container-wide">
            <h2 className="text-3xl font-bold mb-12 text-center">Typography</h2>
            
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="border-b pb-6">
                <span className="text-sm text-gray-500 mb-2 block">Heading 1</span>
                <h1>Transform Your Audio Into Art</h1>
              </div>
              <div className="border-b pb-6">
                <span className="text-sm text-gray-500 mb-2 block">Heading 2</span>
                <h2>Create Your Unique SoundPrint</h2>
              </div>
              <div className="border-b pb-6">
                <span className="text-sm text-gray-500 mb-2 block">Heading 3</span>
                <h3>Premium Quality Materials</h3>
              </div>
              <div className="border-b pb-6">
                <span className="text-sm text-gray-500 mb-2 block">Gradient Text</span>
                <h2 className="text-gradient">Beautiful Gradient Text</h2>
              </div>
              <div>
                <span className="text-sm text-gray-500 mb-2 block">Body Text</span>
                <p className="text-lg text-gray-600">
                  Create stunning visual representations of your favorite sounds. 
                  Whether it&apos;s a heartbeat, a voice message, or your favorite song, 
                  we transform audio into beautiful art prints that last forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Utility Classes Demo */}
        <section className="section-padding bg-gray-50">
          <div className="container-wide">
            <h2 className="text-3xl font-bold mb-12 text-center">Utility Classes</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card-modern card-hover p-6">
                <h4 className="font-semibold mb-2">Card Modern + Hover</h4>
                <p className="text-gray-500 text-sm">
                  Combines <code className="bg-gray-100 px-1 rounded">.card-modern</code> and <code className="bg-gray-100 px-1 rounded">.card-hover</code>
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="font-semibold mb-2">Glass Card</h4>
                <p className="text-gray-500 text-sm">
                  Uses <code className="bg-gray-100 px-1 rounded">.glass-card</code> for frosted effect
                </p>
              </div>
              
              <div className="card-modern p-6 animate-float">
                <h4 className="font-semibold mb-2">Float Animation</h4>
                <p className="text-gray-500 text-sm">
                  Uses <code className="bg-gray-100 px-1 rounded">.animate-float</code>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

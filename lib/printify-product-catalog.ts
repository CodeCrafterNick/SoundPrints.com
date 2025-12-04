/**
 * Complete Printify Product Catalog
 * All wall art products available for SoundPrints
 */

export interface PrintifyProduct {
  id: string
  printifyId: string
  blueprintId: number
  name: string
  shortName: string
  description: string
  category: 'poster' | 'canvas' | 'framed' | 'tapestry' | 'clock' | 'art-print'
  finish: 'matte' | 'satin' | 'silk' | 'canvas' | 'fabric' | 'paper' | 'fine-art'
  orientation: 'vertical' | 'horizontal' | 'both' | 'square'
  sizes: ProductSize[]
  basePrice: number
  popular?: boolean
  new?: boolean
  premium?: boolean
  icon: string
}

export interface ProductSize {
  label: string
  value: string
  width: number
  height: number
  price: number
  popular?: boolean
}

// Core products (first 8)
export const PRINTIFY_PRODUCTS: PrintifyProduct[] = [
  // POSTERS
  {
    id: 'poster-vertical',
    printifyId: '692b87888a961747da09e23d',
    blueprintId: 282,
    name: 'Matte Poster - Vertical',
    shortName: 'Poster',
    description: 'Premium quality matte finish print. Perfect vertical orientation for portraits and tall designs.',
    category: 'poster',
    finish: 'matte',
    orientation: 'vertical',
    basePrice: 19.99,
    popular: true,
    icon: 'FileText',
    sizes: [
      { label: '12" × 16"', value: '12x16', width: 12, height: 16, price: 19.99 },
      { label: '16" × 20"', value: '16x20', width: 16, height: 20, price: 24.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 29.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 39.99 },
    ],
  },
  {
    id: 'poster-horizontal',
    printifyId: '692b878dba98f325e20ef148',
    blueprintId: 284,
    name: 'Matte Poster - Horizontal',
    shortName: 'Poster Landscape',
    description: 'Premium horizontal poster with matte finish. Great for landscape waveforms.',
    category: 'poster',
    finish: 'matte',
    orientation: 'horizontal',
    basePrice: 19.99,
    icon: 'FileText',
    sizes: [
      { label: '16" × 12"', value: '16x12', width: 16, height: 12, price: 19.99 },
      { label: '20" × 16"', value: '20x16', width: 20, height: 16, price: 24.99 },
      { label: '24" × 18"', value: '24x18', width: 24, height: 18, price: 29.99, popular: true },
      { label: '36" × 24"', value: '36x24', width: 36, height: 24, price: 39.99 },
    ],
  },
  {
    id: 'satin-poster',
    printifyId: '692b8790eeefa5c3bc0c6cc9',
    blueprintId: 97,
    name: 'Satin Poster',
    shortName: 'Satin',
    description: 'High-quality 210gsm satin poster with elegant sheen. Rich colors and smooth finish.',
    category: 'poster',
    finish: 'satin',
    orientation: 'both',
    basePrice: 24.99,
    premium: true,
    icon: 'Sparkles',
    sizes: [
      { label: '12" × 18"', value: '12x18', width: 12, height: 18, price: 24.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 34.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 44.99 },
    ],
  },
  {
    id: 'paper-poster',
    printifyId: '692b87a23f91b4e2c2038a7a',
    blueprintId: 554,
    name: 'Paper Poster',
    shortName: 'Paper',
    description: 'Classic paper poster. Affordable and versatile for any space.',
    category: 'poster',
    finish: 'paper',
    orientation: 'both',
    basePrice: 14.99,
    icon: 'FileText',
    sizes: [
      // Updated to match actual Printify/Prodigi availability
      { label: '12" × 18"', value: '12x18', width: 12, height: 18, price: 14.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 19.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 29.99 },
    ],
  },

  // CANVAS
  {
    id: 'stretched-canvas',
    printifyId: '692b87933f91b4e2c2038a74',
    blueprintId: 555,
    name: 'Stretched Canvas',
    shortName: 'Canvas',
    description: 'Gallery-quality stretched canvas, ready to hang. 0.75" wooden frame.',
    category: 'canvas',
    finish: 'canvas',
    orientation: 'both',
    basePrice: 49.99,
    popular: true,
    icon: 'Image',
    sizes: [
      // Updated to match actual Printify/Prodigi availability
      { label: '8" × 10"', value: '8x10', width: 8, height: 10, price: 34.99 },
      { label: '11" × 14"', value: '11x14', width: 11, height: 14, price: 44.99 },
      { label: '12" × 16"', value: '12x16', width: 12, height: 16, price: 49.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 64.99, popular: true },
      { label: '24" × 30"', value: '24x30', width: 24, height: 30, price: 89.99 },
    ],
  },

  // FRAMED POSTERS
  {
    id: 'framed-vertical',
    printifyId: '692b87981a81a881fe09e1da',
    blueprintId: 492,
    name: 'Framed Poster - Vertical',
    shortName: 'Framed',
    description: 'Ready-to-hang framed poster. Available in black or white frame.',
    category: 'framed',
    finish: 'matte',
    orientation: 'vertical',
    basePrice: 59.99,
    popular: true,
    icon: 'Frame',
    sizes: [
      // Updated to match actual Printify/Print Pigeons availability
      { label: '11" × 14"', value: '11x14', width: 11, height: 14, price: 54.99 },
      { label: '16" × 20"', value: '16x20', width: 16, height: 20, price: 69.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 79.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 99.99 },
    ],
  },
  {
    id: 'framed-horizontal',
    printifyId: '692b879bcecf816d92027e26',
    blueprintId: 493,
    name: 'Framed Poster - Horizontal',
    shortName: 'Framed Landscape',
    description: 'Horizontal framed poster with black or white frame. Modern and clean.',
    category: 'framed',
    finish: 'matte',
    orientation: 'horizontal',
    basePrice: 59.99,
    icon: 'Frame',
    sizes: [
      // Updated to match actual Printify/Print Pigeons availability
      { label: '14" × 11"', value: '14x11', width: 14, height: 11, price: 54.99 },
      { label: '20" × 16"', value: '20x16', width: 20, height: 16, price: 69.99 },
      { label: '24" × 18"', value: '24x18', width: 24, height: 18, price: 79.99, popular: true },
      { label: '36" × 24"', value: '36x24', width: 36, height: 24, price: 99.99 },
    ],
  },

  // ART PRINTS
  {
    id: 'giclee-art',
    printifyId: '692b879f22140608080a09a8',
    blueprintId: 494,
    name: 'Giclée Art Print',
    shortName: 'Giclée',
    description: 'Museum-quality giclée print on archival paper. Premium for collectors.',
    category: 'art-print',
    finish: 'fine-art',
    orientation: 'both',
    basePrice: 44.99,
    premium: true,
    icon: 'Palette',
    sizes: [
      // Updated to match actual Printify/Print Pigeons availability
      { label: '11" × 14"', value: '11x14', width: 11, height: 14, price: 39.99 },
      { label: '16" × 20"', value: '16x20', width: 16, height: 20, price: 54.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 64.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 89.99 },
    ],
  },

  // ADDITIONAL PRODUCTS (from add-more-printify-products.js)
  {
    id: 'wall-tapestry',
    printifyId: '692b89283668e9f994010d53',
    blueprintId: 241,
    name: 'Wall Tapestry',
    shortName: 'Tapestry',
    description: 'Lightweight polyester tapestry. Perfect for large wall spaces and soft texture.',
    category: 'tapestry',
    finish: 'fabric',
    orientation: 'both',
    basePrice: 34.99,
    new: true,
    icon: 'Shirt',
    sizes: [
      { label: '26" × 36"', value: '26x36', width: 26, height: 36, price: 34.99 },
      { label: '36" × 26"', value: '36x26', width: 36, height: 26, price: 34.99 },
      { label: '50" × 60"', value: '50x60', width: 50, height: 60, price: 49.99, popular: true },
      { label: '60" × 50"', value: '60x50', width: 60, height: 50, price: 49.99 },
      { label: '68" × 80"', value: '68x80', width: 68, height: 80, price: 69.99 },
      { label: '80" × 68"', value: '80x68', width: 80, height: 68, price: 69.99 },
    ],
  },
  {
    id: 'wall-clock',
    printifyId: '692b892bcecf816d92027e82',
    blueprintId: 277,
    name: 'Wall Clock',
    shortName: 'Clock',
    description: 'Functional wall clock with your sound wave. Modern home decor that tells time.',
    category: 'clock',
    finish: 'matte',
    orientation: 'square',
    basePrice: 29.99,
    new: true,
    icon: 'Clock',
    sizes: [
      { label: '10" Round', value: '10x10', width: 10, height: 10, price: 29.99, popular: true },
    ],
  },
  {
    id: 'framed-alt-vertical',
    printifyId: '692b89352b334c6cb2068b89',
    blueprintId: 540,
    name: 'Premium Framed - Vertical',
    shortName: 'Premium Frame',
    description: 'Alternative framed poster with premium frame options. Museum-quality presentation.',
    category: 'framed',
    finish: 'matte',
    orientation: 'vertical',
    basePrice: 69.99,
    premium: true,
    icon: 'Frame',
    sizes: [
      { label: '11" × 14"', value: '11x14', width: 11, height: 14, price: 59.99 },
      { label: '12" × 16"', value: '12x16', width: 12, height: 16, price: 69.99 },
      { label: '16" × 20"', value: '16x20', width: 16, height: 20, price: 79.99, popular: true },
      { label: '20" × 30"', value: '20x30', width: 20, height: 30, price: 99.99 },
    ],
  },
  {
    id: 'framed-alt-horizontal',
    printifyId: '692b893a8a961747da09e2b0',
    blueprintId: 541,
    name: 'Premium Framed - Horizontal',
    shortName: 'Premium Frame',
    description: 'Alternative horizontal framed poster with different frame styles.',
    category: 'framed',
    finish: 'matte',
    orientation: 'horizontal',
    basePrice: 69.99,
    premium: true,
    icon: 'Frame',
    sizes: [
      { label: '14" × 11"', value: '14x11', width: 14, height: 11, price: 59.99 },
      { label: '16" × 12"', value: '16x12', width: 16, height: 12, price: 69.99 },
      { label: '20" × 16"', value: '20x16', width: 20, height: 16, price: 79.99, popular: true },
      { label: '30" × 20"', value: '30x20', width: 30, height: 20, price: 99.99 },
    ],
  },
  {
    id: 'silk-poster',
    printifyId: '692b893caa869e5c0d0ecc64',
    blueprintId: 763,
    name: 'Silk Poster',
    shortName: 'Silk',
    description: 'Indoor and outdoor silk poster. Durable and vibrant for any setting.',
    category: 'poster',
    finish: 'silk',
    orientation: 'both',
    basePrice: 29.99,
    new: true,
    icon: 'FileText',
    sizes: [
      { label: '12" × 18"', value: '12x18', width: 12, height: 18, price: 29.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 39.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 49.99 },
    ],
  },
  {
    id: 'framed-premium',
    printifyId: '692b89423f91b4e2c2038ace',
    blueprintId: 764,
    name: 'Framed Premium',
    shortName: 'Luxury Frame',
    description: 'Premium framed poster with multiple frame color options. Luxury presentation.',
    category: 'framed',
    finish: 'matte',
    orientation: 'both',
    basePrice: 79.99,
    premium: true,
    icon: 'Gem',
    sizes: [
      { label: '12" × 16"', value: '12x16', width: 12, height: 16, price: 79.99 },
      { label: '16" × 20"', value: '16x20', width: 16, height: 20, price: 89.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 99.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 139.99 },
    ],
  },
  {
    id: 'fine-art-poster',
    printifyId: '692b89453668e9f994010d5c',
    blueprintId: 804,
    name: 'Fine Art Poster',
    shortName: 'Fine Art',
    description: 'Fine art quality poster on premium paper. Museum-grade printing and archival quality.',
    category: 'art-print',
    finish: 'fine-art',
    orientation: 'both',
    basePrice: 39.99,
    premium: true,
    new: true,
    icon: 'Image',
    sizes: [
      { label: '12" × 16"', value: '12x16', width: 12, height: 16, price: 39.99 },
      { label: '16" × 20"', value: '16x20', width: 16, height: 20, price: 49.99 },
      { label: '18" × 24"', value: '18x24', width: 18, height: 24, price: 59.99, popular: true },
      { label: '24" × 36"', value: '24x36', width: 24, height: 36, price: 79.99 },
    ],
  },
]

// Product categories for filtering
export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'ShoppingBag' },
  { id: 'poster', name: 'Posters', icon: 'FileText', count: 5 },
  { id: 'canvas', name: 'Canvas', icon: 'Image', count: 1 },
  { id: 'framed', name: 'Framed', icon: 'Frame', count: 5 },
  { id: 'art-print', name: 'Art Prints', icon: 'Palette', count: 2 },
  { id: 'tapestry', name: 'Tapestry', icon: 'Shirt', count: 1 },
  { id: 'clock', name: 'Clock', icon: 'Clock', count: 1 },
]

// Helper functions
export function getProductById(id: string): PrintifyProduct | undefined {
  return PRINTIFY_PRODUCTS.find(p => p.id === id)
}

export function getProductsByCategory(category: string): PrintifyProduct[] {
  if (category === 'all') return PRINTIFY_PRODUCTS
  return PRINTIFY_PRODUCTS.filter(p => p.category === category)
}

export function getPopularProducts(): PrintifyProduct[] {
  return PRINTIFY_PRODUCTS.filter(p => p.popular)
}

export function getPremiumProducts(): PrintifyProduct[] {
  return PRINTIFY_PRODUCTS.filter(p => p.premium)
}

export function getNewProducts(): PrintifyProduct[] {
  return PRINTIFY_PRODUCTS.filter(p => p.new)
}

export function getProductPrice(product: PrintifyProduct, sizeValue: string): number {
  const size = product.sizes.find(s => s.value === sizeValue)
  return size?.price || product.basePrice
}

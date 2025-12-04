/**
 * Product Catalog
 * Maps template IDs to product information and pricing
 */

export interface ProductInfo {
  templateId: string
  name: string
  description: string
  category: 'wall-art' | 'apparel' | 'digital'
  productType: 'poster' | 'canvas' | 'tshirt' | 'digital-download'
  size: string
  price: number
  printfulVariantId?: number  // To be added once Printful API key is set up
  popular?: boolean
  tags?: string[]
  isDigital?: boolean
}

export const PRODUCT_CATALOG: ProductInfo[] = [
  // Wall Art - Posters
  {
    templateId: 'poster-12x16',
    name: '12" × 16" Poster',
    description: 'Enhanced matte paper poster with premium quality print',
    category: 'wall-art',
    productType: 'poster',
    size: '12" × 16"',
    price: 12.95,
    tags: ['wall-art', 'poster', 'small']
  },
  {
    templateId: 'poster-18x24',
    name: '18" × 24" Poster',
    description: 'Enhanced matte paper poster, perfect for medium wall spaces',
    category: 'wall-art',
    productType: 'poster',
    size: '18" × 24"',
    price: 18.95,
    popular: true,
    tags: ['wall-art', 'poster', 'medium', 'bestseller']
  },
  {
    templateId: 'poster-24x36',
    name: '24" × 36" Poster',
    description: 'Large enhanced matte paper poster for statement pieces',
    category: 'wall-art',
    productType: 'poster',
    size: '24" × 36"',
    price: 29.95,
    tags: ['wall-art', 'poster', 'large']
  },
  
  // Wall Art - Canvas
  {
    templateId: 'canvas-16x20',
    name: '16" × 20" Canvas Print',
    description: 'Premium canvas print with gallery wrap',
    category: 'wall-art',
    productType: 'canvas',
    size: '16" × 20"',
    price: 45.95,
    tags: ['wall-art', 'canvas', 'medium']
  },
  {
    templateId: 'canvas-20x24',
    name: '20" × 24" Canvas Print',
    description: 'Large premium canvas print with gallery wrap',
    category: 'wall-art',
    productType: 'canvas',
    size: '20" × 24"',
    price: 55.95,
    popular: true,
    tags: ['wall-art', 'canvas', 'large', 'bestseller']
  },
  
  // Apparel - T-Shirts (Placeholders for future)
  // {
  //   templateId: 'tshirt-white-front',
  //   name: 'White T-Shirt (Front)',
  //   description: 'Premium cotton t-shirt with front print',
  //   category: 'apparel',
  //   productType: 'tshirt',
  //   size: 'S-3XL',
  //   price: 19.95,
  //   tags: ['apparel', 'tshirt', 'white']
  // }
  
  // Digital Downloads
  {
    templateId: 'digital-hi-def',
    name: 'Super Hi-Def Digital Download',
    description: 'Download your waveform design as a super high-resolution PNG (4000x6000). Perfect for printing yourself or using as digital artwork. Link expires in 24 hours.',
    category: 'digital',
    productType: 'digital-download',
    size: '4000×6000 px',
    price: 1.00,
    tags: ['digital', 'download', 'hi-def', 'png'],
    isDigital: true
  }
]

/**
 * Get product info by template ID
 */
export function getProductInfo(templateId: string): ProductInfo | undefined {
  return PRODUCT_CATALOG.find(p => p.templateId === templateId)
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: 'wall-art' | 'apparel'): ProductInfo[] {
  return PRODUCT_CATALOG.filter(p => p.category === category)
}

/**
 * Get products by type
 */
export function getProductsByType(productType: string): ProductInfo[] {
  return PRODUCT_CATALOG.filter(p => p.productType === productType)
}

/**
 * Get popular products
 */
export function getPopularProducts(): ProductInfo[] {
  return PRODUCT_CATALOG.filter(p => p.popular)
}

/**
 * Calculate total price for items
 */
export function calculateTotal(items: { templateId: string; quantity: number }[]): number {
  return items.reduce((total, item) => {
    const product = getProductInfo(item.templateId)
    return total + (product?.price || 0) * item.quantity
  }, 0)
}

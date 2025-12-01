/**
 * Mockup Pre-Generation Service
 * Generates all product mockups in parallel for instant delivery
 */

import { maskBasedGenerator } from './mask-generator'
import { templateManager } from './template-manager'
import { cacheManager } from './cache'
import type { MockupTemplate } from './types'

// Helper to map product type to category
function getTemplateCategory(template: MockupTemplate): 'wall-art' | 'apparel' {
  const wallArtTypes = ['poster', 'canvas']
  return wallArtTypes.includes(template.productType) ? 'wall-art' : 'apparel'
}

export interface MockupGenerationRequest {
  designBuffer: Buffer
  designHash?: string
  category?: 'wall-art' | 'apparel' | 'all'
  outputFormat?: 'png' | 'jpeg' | 'webp'
  outputQuality?: number
  productFilters?: {
    category?: 'wall-art' | 'apparel'
    productType?: string
  }
}

export interface GeneratedMockup {
  templateId: string
  name: string
  category: string
  productType: string
  size?: string
  buffer: Buffer
  url?: string | null  // Optional Supabase URL after upload
  cached: boolean
  renderTime: number
}

export class MockupPreGenerator {
  /**
   * Generate mockups for all matching templates
   */
  async generateAll(request: MockupGenerationRequest): Promise<GeneratedMockup[]> {
    const { designBuffer, designHash, category, productFilters } = request
    
    // Get matching templates
    const library = await templateManager.loadLibrary()
    let templates = library.templates

    // Apply category filter
    if (category && category !== 'all') {
      templates = templates.filter(t => getTemplateCategory(t) === category)
    }

    // Apply additional filters
    if (productFilters?.category) {
      templates = templates.filter(t => getTemplateCategory(t) === productFilters.category)
    }
    if (productFilters?.productType) {
      templates = templates.filter(t => t.productType === productFilters.productType)
    }

    // For apparel, only return front views in black and white
    const apparelTypes = ['tshirt', 'hoodie']
    if (category === 'apparel' || templates.some(t => apparelTypes.includes(t.productType))) {
      templates = templates.filter(t => {
        // Only keep front views
        if (t.angle !== 'front') return false
        
        // Only keep black and white colors
        if (t.color && !['black', 'white'].includes(t.color.toLowerCase())) return false
        
        return true
      })
    }

    console.log(`Pre-generating ${templates.length} mockups...`)

    // Generate all mockups in parallel
    const results = await Promise.allSettled(
      templates.map(template => this.generateSingle(template.id, designBuffer, designHash))
    )

    // Collect successful results
    const mockups: GeneratedMockup[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        mockups.push(result.value)
      } else {
        console.error(`Failed to generate ${templates[index].id}:`, result.reason)
      }
    })

    console.log(`Generated ${mockups.length}/${templates.length} mockups`)
    return mockups
  }

  /**
   * Generate single mockup with caching
   */
  private async generateSingle(
    templateId: string,
    designBuffer: Buffer,
    designHash?: string
  ): Promise<GeneratedMockup> {
    const startTime = Date.now()

    // Get template info
    const template = await templateManager.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Check cache
    const hash = designHash || cacheManager.hashBuffer(designBuffer)
    const cacheKey = cacheManager.generateKey(templateId, hash)
    const cached = await cacheManager.get(cacheKey)

    let buffer: Buffer
    let wasCached = false

    if (cached) {
      buffer = cached
      wasCached = true
    } else {
      // Generate new mockup
      buffer = await maskBasedGenerator.generate({
        templateId,
        designBuffer,
        config: {
          brightness: 0.92,
          blendMode: 'multiply',
          textureOverlay: !!template.displacementPath,
          textureOpacity: 0.15,
        },
        outputFormat: 'png',
        outputQuality: 90
      })

      // Cache result
      await cacheManager.set(cacheKey, buffer)
    }

    const renderTime = Date.now() - startTime

    return {
      templateId: template.id,
      name: template.name,
      category: getTemplateCategory(template),
      productType: template.productType,
      buffer,
      cached: wasCached,
      renderTime,
    }
  }

  /**
   * Generate mockups for wall art only (fast, no displacement)
   */
  async generateWallArt(designBuffer: Buffer, designHash?: string): Promise<GeneratedMockup[]> {
    return this.generateAll({
      designBuffer,
      designHash,
      productFilters: { category: 'wall-art' },
    })
  }

  /**
   * Generate mockups for apparel (t-shirts with displacement)
   */
  async generateApparel(designBuffer: Buffer, designHash?: string): Promise<GeneratedMockup[]> {
    return this.generateAll({
      designBuffer,
      designHash,
      productFilters: { category: 'apparel' },
    })
  }

  /**
   * Get generation statistics
   */
  async getStats(): Promise<{
    totalTemplates: number
    byProductType: Record<string, number>
    byAngle: Record<string, number>
    byColor: Record<string, number>
  }> {
    return templateManager.getStats()
  }
}

export const mockupPreGenerator = new MockupPreGenerator()

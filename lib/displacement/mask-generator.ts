import sharp from 'sharp'
import path from 'path'
import { templateManager } from './template-manager'
import { cacheManager } from './cache'
import { GenerateMockupOptions, DisplacementConfig, MockupTemplate } from './types'

/**
 * Mask-based Mockup Generator
 * 
 * Uses traditional mockup technique with masks and blend modes
 * instead of displacement mapping for cleaner, less distorted results.
 * 
 * Technique:
 * 1. Composite design onto base with mask
 * 2. Apply blend mode (multiply for fabric, normal for hard surfaces)
 * 3. Adjust brightness/contrast for realism
 * 4. Overlay shadow/highlight layers
 */
export class MaskBasedGenerator {
  /**
   * Generate mockup using mask-based technique
   */
  async generate(options: GenerateMockupOptions): Promise<Buffer> {
    const {
      templateId,
      designBuffer,
      config = {},
      outputFormat = 'png',
      outputQuality = 90
    } = options

    // Generate cache key
    const designHash = cacheManager.hashBuffer(designBuffer)
    const configHash = Object.keys(config).length > 0 
      ? cacheManager.hashObject(config)
      : undefined
    const cacheKey = cacheManager.generateKey(`mask-${templateId}`, designHash, configHash)

    // Check cache
    const cached = await cacheManager.get(cacheKey)
    if (cached) {
      console.log('Returning cached mockup:', cacheKey)
      return cached
    }

    // Load template
    const template = await templateManager.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Generate mockup
    const mockupBuffer = await this.generateFromTemplate(
      template,
      designBuffer,
      config
    )

    // Convert to requested format
    let outputBuffer = sharp(mockupBuffer)
    
    switch (outputFormat) {
      case 'jpeg':
        outputBuffer = outputBuffer.jpeg({ quality: outputQuality })
        break
      case 'webp':
        outputBuffer = outputBuffer.webp({ quality: outputQuality })
        break
      default:
        outputBuffer = outputBuffer.png({ quality: outputQuality })
    }

    const finalBuffer = await outputBuffer.toBuffer()

    // Cache result
    await cacheManager.set(cacheKey, finalBuffer)

    return finalBuffer
  }

  /**
   * Generate mockup using mask-based compositing
   */
  private async generateFromTemplate(
    template: MockupTemplate,
    designBuffer: Buffer,
    config: DisplacementConfig
  ): Promise<Buffer> {
    const templatesDir = path.join(process.cwd(), 'public/mockups/displacement-templates')
    
    // Load base image
    const basePath = path.join(templatesDir, template.basePath)
    const baseImage = sharp(basePath)
    const baseMetadata = await baseImage.metadata()
    const baseWidth = baseMetadata.width!
    const baseHeight = baseMetadata.height!

    // Calculate print area in pixels
    const printX = Math.floor(baseWidth * template.printArea.x)
    const printY = Math.floor(baseHeight * template.printArea.y)
    const printWidth = Math.floor(baseWidth * template.printArea.width)
    const printHeight = Math.floor(baseHeight * template.printArea.height)

    // Resize design to fit print area
    let processedDesign = await sharp(designBuffer)
      .resize(printWidth, printHeight, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer()

    // Apply brightness/contrast adjustments for fabric absorption
    if (config.brightness !== undefined || config.contrast !== undefined) {
      processedDesign = await sharp(processedDesign)
        .modulate({
          brightness: config.brightness || 1.0,
          saturation: config.saturation || 1.0
        })
        .linear(config.contrast || 1.0, 0)
        .toBuffer()
    }

    // Apply mask if available
    if (template.maskPath) {
      const maskPath = path.join(templatesDir, template.maskPath)
      const mask = await sharp(maskPath)
        .resize(printWidth, printHeight)
        .toBuffer()

      // Composite design with mask
      processedDesign = await sharp(processedDesign)
        .composite([{
          input: mask,
          blend: 'dest-in'
        }])
        .toBuffer()
    }

    // Apply displacement texture overlay (subtle) if displacement map exists
    if (template.displacementPath && config.textureOverlay) {
      const displacementPath = path.join(templatesDir, template.displacementPath)
      
      // Check if displacement file actually exists before trying to load it
      try {
        await sharp(displacementPath).metadata() // Verify file is readable
        
        // Use displacement as texture overlay (not pixel displacement)
        const textureOverlay = await sharp(displacementPath)
          .resize(printWidth, printHeight)
          .modulate({ brightness: 1.2 }) // Lighten for subtle effect
          .toBuffer()

        // Apply opacity to the texture before compositing
        const textureOpacity = config.textureOpacity || 0.15
        const textureWithOpacity = await sharp(textureOverlay)
          .ensureAlpha()
          .linear(textureOpacity, 0) // Adjust alpha channel
          .toBuffer()

        processedDesign = await sharp(processedDesign)
          .composite([{
            input: textureWithOpacity,
            blend: 'overlay'
          }])
          .toBuffer()
      } catch (error) {
        console.warn(`Displacement texture not found or unreadable: ${template.displacementPath}, skipping texture overlay`)
      }
    }

    // Prepare composite layers
    const compositeLayers: sharp.OverlayOptions[] = []

    // Add design with blend mode
    const blendMode = config.blendMode || 'multiply'
    compositeLayers.push({
      input: processedDesign,
      top: printY,
      left: printX,
      blend: blendMode === 'multiply' ? 'multiply' : 'over'
    })

    // Add shadow layer if exists
    if (template.shadowPath) {
      const shadowPath = path.join(templatesDir, template.shadowPath)
      compositeLayers.push({
        input: shadowPath,
        blend: 'multiply'
      })
    }

    // Add highlight layer if exists
    if (template.highlightPath) {
      const highlightPath = path.join(templatesDir, template.highlightPath)
      compositeLayers.push({
        input: highlightPath,
        blend: 'screen'
      })
    }

    // Composite all layers onto base
    const result = await baseImage
      .composite(compositeLayers)
      .toBuffer()

    return result
  }

  /**
   * Preview template with print area overlay (for debugging)
   */
  async previewTemplate(templateId: string): Promise<Buffer> {
    const template = await templateManager.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const templatesDir = path.join(process.cwd(), 'public/mockups/displacement-templates')
    const basePath = path.join(templatesDir, template.basePath)
    const baseImage = sharp(basePath)
    const baseMetadata = await baseImage.metadata()
    const baseWidth = baseMetadata.width!
    const baseHeight = baseMetadata.height!

    // Calculate print area
    const printX = Math.floor(baseWidth * template.printArea.x)
    const printY = Math.floor(baseHeight * template.printArea.y)
    const printWidth = Math.floor(baseWidth * template.printArea.width)
    const printHeight = Math.floor(baseHeight * template.printArea.height)

    // Create semi-transparent overlay for print area
    const overlay = await sharp({
      create: {
        width: printWidth,
        height: printHeight,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.3 }
      }
    }).png().toBuffer()

    // Composite overlay onto base
    return baseImage
      .composite([{
        input: overlay,
        top: printY,
        left: printX,
        blend: 'over'
      }])
      .png()
      .toBuffer()
  }
}

// Export singleton instance
export const maskBasedGenerator = new MaskBasedGenerator()

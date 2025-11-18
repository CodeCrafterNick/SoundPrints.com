import fs from 'fs/promises'
import path from 'path'
import { MockupTemplate, TemplateLibrary } from './types'

/**
 * Template Manager - Organizes and loads displacement mockup templates
 */
export class TemplateManager {
  private templatesDir: string
  private library: TemplateLibrary | null = null

  constructor(templatesDir: string = '/public/mockups/displacement-templates') {
    this.templatesDir = path.join(process.cwd(), templatesDir)
  }

  /**
   * Clear the cached library (force reload on next access)
   */
  clearCache(): void {
    this.library = null
  }

  /**
   * Load the template library from disk
   */
  async loadLibrary(forceReload: boolean = false): Promise<TemplateLibrary> {
    if (this.library && !forceReload) return this.library

    const libraryPath = path.join(this.templatesDir, 'library.json')
    
    try {
      const data = await fs.readFile(libraryPath, 'utf-8')
      this.library = JSON.parse(data)
      return this.library!
    } catch (error) {
      // If library doesn't exist, scan directory and create it
      this.library = await this.scanAndCreateLibrary()
      await this.saveLibrary()
      return this.library
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<MockupTemplate | null> {
    const library = await this.loadLibrary()
    return library.templates.find(t => t.id === templateId) || null
  }

  /**
   * Get all templates for a product type
   */
  async getTemplatesByProduct(
    productType: MockupTemplate['productType']
  ): Promise<MockupTemplate[]> {
    const library = await this.loadLibrary()
    return library.templates.filter(t => t.productType === productType)
  }

  /**
   * Get templates matching specific criteria
   */
  async findTemplates(criteria: {
    productType?: MockupTemplate['productType']
    color?: string
    angle?: MockupTemplate['angle']
  }): Promise<MockupTemplate[]> {
    const library = await this.loadLibrary()
    
    return library.templates.filter(template => {
      if (criteria.productType && template.productType !== criteria.productType) return false
      if (criteria.color && template.color !== criteria.color) return false
      if (criteria.angle && template.angle !== criteria.angle) return false
      return true
    })
  }

  /**
   * Add a new template to the library
   */
  async addTemplate(template: MockupTemplate): Promise<void> {
    const library = await this.loadLibrary()
    
    // Check if template already exists
    const existingIndex = library.templates.findIndex(t => t.id === template.id)
    
    if (existingIndex >= 0) {
      library.templates[existingIndex] = template
    } else {
      library.templates.push(template)
    }
    
    library.lastUpdated = new Date().toISOString()
    await this.saveLibrary()
  }

  /**
   * Remove a template from the library
   */
  async removeTemplate(templateId: string): Promise<boolean> {
    const library = await this.loadLibrary()
    const initialLength = library.templates.length
    
    library.templates = library.templates.filter(t => t.id !== templateId)
    
    if (library.templates.length < initialLength) {
      library.lastUpdated = new Date().toISOString()
      await this.saveLibrary()
      return true
    }
    
    return false
  }

  /**
   * Scan templates directory and create library
   */
  private async scanAndCreateLibrary(): Promise<TemplateLibrary> {
    const templates: MockupTemplate[] = []
    
    try {
      const entries = await fs.readdir(this.templatesDir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        
        const templateDir = path.join(this.templatesDir, entry.name)
        const metadataPath = path.join(templateDir, 'metadata.json')
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8')
          const template = JSON.parse(metadataContent) as MockupTemplate
          
          // Validate that required files exist
          const basePath = path.join(this.templatesDir, template.basePath)
          const displacementPath = path.join(this.templatesDir, template.displacementPath)
          
          await fs.access(basePath)
          await fs.access(displacementPath)
          
          templates.push(template)
        } catch (err) {
          console.warn(`Skipping invalid template in ${entry.name}:`, err)
        }
      }
    } catch (error) {
      console.warn('Could not scan templates directory:', error)
    }
    
    return {
      templates,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Save library to disk
   */
  private async saveLibrary(): Promise<void> {
    if (!this.library) return
    
    const libraryPath = path.join(this.templatesDir, 'library.json')
    await fs.mkdir(this.templatesDir, { recursive: true })
    await fs.writeFile(libraryPath, JSON.stringify(this.library, null, 2))
  }

  /**
   * Reload library from disk (clears cache)
   */
  async reloadLibrary(): Promise<TemplateLibrary> {
    this.library = null
    return this.loadLibrary()
  }

  /**
   * Get library statistics
   */
  async getStats(): Promise<{
    totalTemplates: number
    byProductType: Record<string, number>
    byAngle: Record<string, number>
    byColor: Record<string, number>
  }> {
    const library = await this.loadLibrary()
    
    const stats = {
      totalTemplates: library.templates.length,
      byProductType: {} as Record<string, number>,
      byAngle: {} as Record<string, number>,
      byColor: {} as Record<string, number>
    }
    
    library.templates.forEach(template => {
      stats.byProductType[template.productType] = (stats.byProductType[template.productType] || 0) + 1
      stats.byAngle[template.angle] = (stats.byAngle[template.angle] || 0) + 1
      if (template.color) {
        stats.byColor[template.color] = (stats.byColor[template.color] || 0) + 1
      }
    })
    
    return stats
  }
}

// Export singleton instance
export const templateManager = new TemplateManager()

/**
 * Displacement Mapping System Types
 */

export interface MockupTemplate {
  id: string
  name: string
  productType: 'tshirt' | 'hoodie' | 'mug' | 'poster' | 'canvas'
  color?: string
  angle: 'front' | 'back' | 'side' | 'flat' | 'lifestyle'
  basePath: string // Path to base product image
  displacementPath: string // Path to displacement map
  maskPath?: string // Optional mask for print area
  shadowPath?: string // Optional shadow layer
  highlightPath?: string // Optional highlight layer
  printArea: {
    x: number // Position as percentage (0-1)
    y: number
    width: number // Size as percentage (0-1)
    height: number
    rotation?: number // Rotation in degrees
  }
  metadata?: {
    resolution: { width: number; height: number }
    source?: string
    license?: string
  }
}

export interface DisplacementConfig {
  intensity?: number // Displacement strength (default: 8)
  brightness?: number // Fabric light absorption (default: 0.92)
  contrast?: number // Contrast adjustment (default: 1.0)
  saturation?: number // Saturation adjustment (default: 1.0)
  blendMode?: 'multiply' | 'overlay' | 'normal'
  smoothing?: number // Edge smoothing (default: 0)
  textureOverlay?: boolean // Use displacement as texture overlay instead of pixel displacement
  textureOpacity?: number // Texture overlay opacity (0-1, default: 0.15)
}

export interface GenerateMockupOptions {
  templateId: string
  designBuffer: Buffer
  config?: DisplacementConfig
  outputFormat?: 'png' | 'jpeg' | 'webp'
  outputQuality?: number // 1-100
}

export interface TemplateLibrary {
  templates: MockupTemplate[]
  version: string
  lastUpdated: string
}

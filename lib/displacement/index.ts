/**
 * Displacement Mapping System
 * Exports all public APIs
 */

export { TemplateManager, templateManager } from './template-manager'
export { CacheManager, cacheManager } from './cache'
export { MockupGenerator, mockupGenerator } from './generator'

export type {
  MockupTemplate,
  DisplacementConfig,
  GenerateMockupOptions,
  TemplateLibrary
} from './types'

// Re-export displacement algorithms from parent lib
export {
  applyDisplacementMap,
  compositeMockupWithDisplacement,
  generateNormalMap
} from '../displacement-map'

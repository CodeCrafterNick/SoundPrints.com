/**
 * Convert Blueprint Images to Displacement Templates
 * 
 * This script takes Printify blueprint images and creates basic displacement templates.
 * It generates a simple displacement map from the base image using edge detection.
 * 
 * Note: For best quality, you should replace the generated displacement maps
 * with professional ones from PSD templates.
 */

const sharp = require('sharp')
const fs = require('fs/promises')
const path = require('path')

// Blueprint to template mapping
const blueprintConfigs = [
  {
    blueprint: 'bella-canvas-3001',
    productType: 'tshirt',
    color: 'natural',
    templates: [
      {
        id: 'bella-canvas-3001-natural-front',
        name: 'Bella+Canvas 3001 Natural (Front)',
        angle: 'front',
        imageIndex: 0,
        printArea: { x: 0.35, y: 0.32, width: 0.3, height: 0.38 }
      },
      {
        id: 'bella-canvas-3001-natural-back',
        name: 'Bella+Canvas 3001 Natural (Back)',
        angle: 'back',
        imageIndex: 1,
        printArea: { x: 0.35, y: 0.32, width: 0.3, height: 0.38 }
      },
      {
        id: 'bella-canvas-3001-natural-lifestyle',
        name: 'Bella+Canvas 3001 Natural (Lifestyle)',
        angle: 'lifestyle',
        imageIndex: 4,
        printArea: { x: 0.30, y: 0.35, width: 0.35, height: 0.35 }
      }
    ]
  },
  {
    blueprint: 'white-glossy-mug-11oz',
    productType: 'mug',
    color: 'white',
    templates: [
      {
        id: 'white-glossy-mug-11oz-front',
        name: 'White Glossy Mug 11oz (Front)',
        angle: 'front',
        imageIndex: 0,
        printArea: { x: 0.25, y: 0.35, width: 0.5, height: 0.3 }
      }
    ]
  }
]

/**
 * Generate a basic displacement map from an image using edge detection
 */
async function generateDisplacementMap(imagePath, outputPath) {
  console.log(`  Generating displacement map from ${path.basename(imagePath)}...`)
  
  // Load image and convert to grayscale
  const image = sharp(imagePath)
  const metadata = await image.metadata()
  
  // Create displacement map using edge detection + blur
  await image
    .grayscale()
    .normalise() // Normalize to full 0-255 range
    .blur(2) // Smooth out for better displacement
    .modulate({
      brightness: 1.0,
      saturation: 1.0,
      hue: 0
    })
    .png()
    .toFile(outputPath)
  
  console.log(`  ✓ Created displacement map: ${path.basename(outputPath)}`)
}

/**
 * Create a print area mask
 */
async function generateMask(width, height, printArea, outputPath) {
  console.log(`  Generating mask...`)
  
  const maskWidth = Math.floor(width * printArea.width)
  const maskHeight = Math.floor(height * printArea.height)
  const maskX = Math.floor(width * printArea.x)
  const maskY = Math.floor(height * printArea.y)
  
  // Create black background
  const background = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 255 }
    }
  }).png().toBuffer()
  
  // Create white rectangle for print area
  const printRect = await sharp({
    create: {
      width: maskWidth,
      height: maskHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 }
    }
  }).png().toBuffer()
  
  // Composite white rectangle onto black background
  await sharp(background)
    .composite([{
      input: printRect,
      top: maskY,
      left: maskX
    }])
    .png()
    .toFile(outputPath)
  
  console.log(`  ✓ Created mask: ${path.basename(outputPath)}`)
}

/**
 * Process a single blueprint into templates
 */
async function processBlueprint(config) {
  const blueprintDir = path.join(__dirname, '../public/mockups/blueprint-images', config.blueprint)
  const templatesDir = path.join(__dirname, '../public/mockups/displacement-templates')
  
  console.log(`\n📦 Processing ${config.blueprint}...`)
  
  // Get all images in blueprint directory
  const files = await fs.readdir(blueprintDir)
  const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png)$/i))
  
  console.log(`  Found ${imageFiles.length} images`)
  
  // Process each template
  for (const template of config.templates) {
    console.log(`\n  Creating template: ${template.id}`)
    
    const imageFile = imageFiles[template.imageIndex]
    if (!imageFile) {
      console.log(`  ⚠️  Image index ${template.imageIndex} not found, skipping`)
      continue
    }
    
    const sourcePath = path.join(blueprintDir, imageFile)
    const templateDir = path.join(templatesDir, template.id)
    
    // Create template directory
    await fs.mkdir(templateDir, { recursive: true })
    
    // Copy base image
    const basePath = path.join(templateDir, 'base.png')
    await fs.copyFile(sourcePath, basePath)
    console.log(`  ✓ Copied base image`)
    
    // Generate displacement map
    const displacementPath = path.join(templateDir, 'displacement.png')
    await generateDisplacementMap(sourcePath, displacementPath)
    
    // Get image dimensions for mask
    const metadata = await sharp(sourcePath).metadata()
    
    // Generate mask
    const maskPath = path.join(templateDir, 'mask.png')
    await generateMask(metadata.width!, metadata.height!, template.printArea, maskPath)
    
    // Create metadata.json
    const metadata_json = {
      id: template.id,
      name: template.name,
      productType: config.productType,
      color: config.color,
      angle: template.angle,
      basePath: `${template.id}/base.png`,
      displacementPath: `${template.id}/displacement.png`,
      maskPath: `${template.id}/mask.png`,
      printArea: template.printArea,
      metadata: {
        resolution: {
          width: metadata.width,
          height: metadata.height
        },
        source: 'Printify Blueprint',
        license: 'Commercial Use'
      }
    }
    
    const metadataPath = path.join(templateDir, 'metadata.json')
    await fs.writeFile(metadataPath, JSON.stringify(metadata_json, null, 2))
    console.log(`  ✓ Created metadata.json`)
    
    console.log(`  ✅ Template created: ${template.id}`)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Blueprint to Template Converter\n')
  console.log('This will create basic displacement templates from blueprint images.')
  console.log('Note: For best quality, replace generated displacement maps with professional ones.\n')
  
  let totalTemplates = 0
  
  for (const config of blueprintConfigs) {
    try {
      await processBlueprint(config)
      totalTemplates += config.templates.length
    } catch (error) {
      console.error(`\n❌ Error processing ${config.blueprint}:`, error.message)
    }
  }
  
  console.log(`\n\n✅ Done! Created ${totalTemplates} templates.`)
  console.log('\nNext steps:')
  console.log('1. Test templates: GET /api/generate-mockup?action=templates')
  console.log('2. Preview template: GET /api/generate-mockup?action=preview&templateId=bella-canvas-3001-natural-front')
  console.log('3. For better quality, purchase PSD templates and replace displacement maps')
  console.log('\nSee DISPLACEMENT_SYSTEM.md for full documentation.')
}

main().catch(console.error)

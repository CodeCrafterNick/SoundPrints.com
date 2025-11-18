/**
 * Create PSD from individual layer PNG files
 * 
 * Takes a folder with layer PNGs and assembles them into a layered PSD file.
 * 
 * Layer structure (all optional except base):
 * - base.png (required) - Background mockup photo
 * - mask.png - Print area mask
 * - shadow.png - Shadow overlay
 * - highlight.png - Highlight overlay
 * - displacement.png - Texture/displacement map
 * 
 * Usage:
 *   node scripts/create-psd-from-layers.js <input-folder> <output-psd>
 * 
 * Example:
 *   node scripts/create-psd-from-layers.js public/mockups/white-shirt public/mockups/white-shirt.psd
 */

const fs = require('fs')
const path = require('path')
const { writePsdBuffer } = require('ag-psd')
const sharp = require('sharp')

async function createPsdFromLayers(inputFolder, outputPath) {
  console.log('🎨 Creating PSD from layer files\n')
  console.log('Input folder:', inputFolder)
  console.log('Output PSD:', outputPath)
  console.log('='.repeat(80) + '\n')

  // Verify input folder exists
  if (!fs.existsSync(inputFolder)) {
    throw new Error(`Input folder not found: ${inputFolder}`)
  }

  // Layer file mapping (priority order from bottom to top)
  const layerFiles = [
    { name: 'base.png', layerName: 'BASE', required: true },
    { name: 'displacement.png', layerName: 'DISPLACEMENT', required: false },
    { name: 'mask.png', layerName: 'MASK', required: false },
    { name: 'shadow.png', layerName: 'SHADOW', required: false },
    { name: 'highlight.png', layerName: 'HIGHLIGHT', required: false }
  ]

  // Load layers
  const layers = []
  let canvasWidth = 0
  let canvasHeight = 0

  for (const layerSpec of layerFiles) {
    const layerPath = path.join(inputFolder, layerSpec.name)
    
    if (!fs.existsSync(layerPath)) {
      if (layerSpec.required) {
        throw new Error(`Required layer not found: ${layerSpec.name}`)
      }
      console.log(`⏭️  Skipping optional layer: ${layerSpec.name}`)
      continue
    }

    console.log(`📥 Loading: ${layerSpec.name}`)
    
    // Read image data
    const imageBuffer = fs.readFileSync(layerPath)
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()
    
    // Set canvas size from base layer
    if (layerSpec.name === 'base.png') {
      canvasWidth = metadata.width
      canvasHeight = metadata.height
      console.log(`   Canvas size: ${canvasWidth}x${canvasHeight}`)
    }

    // Convert to raw RGBA buffer
    const rawBuffer = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Create layer data
    const layer = {
      name: layerSpec.layerName,
      canvas: {
        width: metadata.width,
        height: metadata.height
      },
      imageData: {
        width: metadata.width,
        height: metadata.height,
        data: new Uint8Array(rawBuffer.data)
      },
      top: 0,
      left: 0,
      right: metadata.width,
      bottom: metadata.height,
      opacity: 255,
      blendMode: layerSpec.layerName === 'SHADOW' ? 'multiply' : 'normal'
    }

    layers.push(layer)
    console.log(`   ✅ Added layer: ${layerSpec.layerName}`)
  }

  if (layers.length === 0) {
    throw new Error('No layers found to create PSD')
  }

  console.log(`\n📦 Creating PSD with ${layers.length} layers...`)

  // Reverse layers (ag-psd expects bottom-to-top order)
  layers.reverse()

  // Create PSD document
  const psd = {
    width: canvasWidth,
    height: canvasHeight,
    channels: 4, // RGBA
    bitsPerChannel: 8,
    colorMode: 3, // RGB
    children: layers
  }

  // Write PSD file
  const psdBuffer = writePsdBuffer(psd)
  fs.writeFileSync(outputPath, Buffer.from(psdBuffer))

  console.log(`\n✅ PSD created successfully!`)
  console.log(`   File: ${outputPath}`)
  console.log(`   Size: ${(psdBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   Layers: ${layers.length}`)
  console.log(`\n💡 Open in Photoshop to verify layers\n`)
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('Usage: node scripts/create-psd-from-layers.js <input-folder> <output-psd>')
    console.error('\nExample:')
    console.error('  node scripts/create-psd-from-layers.js public/mockups/white-shirt public/mockups/white-shirt.psd')
    process.exit(1)
  }

  const [inputFolder, outputPath] = args

  createPsdFromLayers(inputFolder, outputPath)
    .catch(error => {
      console.error('\n❌ Error:', error.message)
      process.exit(1)
    })
}

module.exports = { createPsdFromLayers }

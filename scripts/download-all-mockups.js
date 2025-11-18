/**
 * Download all mockup images for displacement mapping reference
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

const PRINTIFY_API_KEY = envVars.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = envVars.PRINTIFY_SHOP_ID
const PRODUCT_ID = '6918f714cf4bca7030060d86'

const outputDir = path.join(__dirname, '..', 'public', 'mockups', 'displacement-reference')

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

async function downloadAllMockups() {
  try {
    console.log('🔍 Fetching product mockups...\n')

    const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${PRODUCT_ID}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    const product = await response.json()
    
    console.log(`📦 Product: ${product.title}`)
    console.log(`🖼️  Total Images: ${product.images.length}\n`)
    console.log('='.repeat(80) + '\n')

    // Map variant IDs to colors
    const variantIdToColor = new Map()
    product.variants.forEach(variant => {
      const parts = variant.title.split(' / ')
      const color = parts[0]
      const size = parts[1]
      variantIdToColor.set(variant.id, { color, size })
    })

    // Organize images by color and view
    const imagesByColor = new Map()
    
    product.images.forEach(img => {
      const variantId = img.variant_ids?.[0]
      if (!variantId) return
      
      const variant = variantIdToColor.get(variantId)
      if (!variant) return
      
      const { color, size } = variant
      const view = img.src.match(/camera_label=([^&]+)/)?.[1] || 'unknown'
      
      if (!imagesByColor.has(color)) {
        imagesByColor.set(color, {})
      }
      
      imagesByColor.get(color)[view] = {
        url: img.src,
        size: size,
        variantId: variantId
      }
    })

    console.log(`Found mockups for ${imagesByColor.size} colors\n`)

    // Download all images
    let totalDownloaded = 0
    
    for (const [color, views] of imagesByColor.entries()) {
      const colorDir = path.join(outputDir, color.toLowerCase().replace(/\s+/g, '-'))
      if (!fs.existsSync(colorDir)) {
        fs.mkdirSync(colorDir, { recursive: true })
      }
      
      console.log(`📥 Downloading ${color}...`)
      
      for (const [view, data] of Object.entries(views)) {
        const filename = `${view}.jpg`
        const filepath = path.join(colorDir, filename)
        
        try {
          await downloadImage(data.url, filepath)
          console.log(`   ✅ ${view}.jpg`)
          totalDownloaded++
        } catch (error) {
          console.log(`   ❌ ${view}.jpg - ${error.message}`)
        }
      }
      
      // Create metadata file
      const metadata = {
        color: color,
        size: views['front']?.size || 'M',
        variantId: views['front']?.variantId,
        views: Object.keys(views),
        downloadDate: new Date().toISOString()
      }
      
      fs.writeFileSync(
        path.join(colorDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      )
      
      console.log('')
    }

    // Create index file
    const index = {
      productId: PRODUCT_ID,
      productTitle: product.title,
      blueprintId: product.blueprint_id,
      totalColors: imagesByColor.size,
      colors: Array.from(imagesByColor.keys()).sort(),
      views: ['front', 'back', 'front-2', 'back-2'],
      downloadDate: new Date().toISOString()
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'index.json'),
      JSON.stringify(index, null, 2)
    )

    console.log('='.repeat(80))
    console.log(`\n✅ Downloaded ${totalDownloaded} images for ${imagesByColor.size} colors`)
    console.log(`📁 Saved to: ${outputDir}`)
    console.log(`📋 Index file: ${path.join(outputDir, 'index.json')}\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

downloadAllMockups()

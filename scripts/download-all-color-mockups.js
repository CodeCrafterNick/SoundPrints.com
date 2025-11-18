/**
 * Download mockups from all batch products
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

const outputDir = path.join(__dirname, '..', 'public', 'mockups', 'displacement-reference')

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

async function downloadProductMockups(productId, batchNum) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📦 BATCH ${batchNum}: Downloading mockups`)
  console.log(`${'='.repeat(80)}\n`)
  
  const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`
    }
  })

  const product = await response.json()
  
  console.log(`Product: ${product.title}`)
  console.log(`Images: ${product.images?.length || 0}\n`)
  
  if (!product.images || product.images.length === 0) {
    console.log('⚠️  No images found yet - mockups may still be generating\n')
    return { downloaded: 0, colors: [] }
  }

  // Map variant IDs to colors
  const variantIdToColor = new Map()
  product.variants.forEach(variant => {
    const parts = variant.title.split(' / ')
    const color = parts[0]
    const size = parts[1]
    variantIdToColor.set(variant.id, { color, size })
  })

  // Organize images by color
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

  let totalDownloaded = 0
  const downloadedColors = []
  
  for (const [color, views] of imagesByColor.entries()) {
    const colorDir = path.join(outputDir, color.toLowerCase().replace(/\s+/g, '-'))
    
    // Skip if already exists
    if (fs.existsSync(colorDir)) {
      console.log(`⏭️  Skipping ${color} (already exists)`)
      continue
    }
    
    fs.mkdirSync(colorDir, { recursive: true })
    
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
      batchNum: batchNum,
      productId: productId,
      downloadDate: new Date().toISOString()
    }
    
    fs.writeFileSync(
      path.join(colorDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )
    
    downloadedColors.push(color)
    console.log('')
  }
  
  return { downloaded: totalDownloaded, colors: downloadedColors }
}

async function downloadAllBatches() {
  try {
    console.log('🎨 Downloading All Color Mockups\n')
    console.log('='.repeat(80))
    
    // Read product IDs
    const productIdsPath = path.join(outputDir, 'product-ids.json')
    const productData = JSON.parse(fs.readFileSync(productIdsPath, 'utf8'))
    
    console.log(`\n📋 Found ${productData.batches.length} batches`)
    console.log(`⏳ Waiting 5 seconds for mockup generation...\n`)
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const summary = {
      totalDownloaded: 0,
      colorsByBatch: []
    }
    
    for (const batch of productData.batches) {
      const result = await downloadProductMockups(batch.productId, batch.batchNum)
      summary.totalDownloaded += result.downloaded
      summary.colorsByBatch.push({
        batchNum: batch.batchNum,
        downloaded: result.colors.length,
        colors: result.colors
      })
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Update index
    const allColors = []
    const colorDirs = fs.readdirSync(outputDir).filter(f => {
      const fullPath = path.join(outputDir, f)
      return fs.statSync(fullPath).isDirectory()
    })
    
    colorDirs.forEach(dir => {
      const metadataPath = path.join(outputDir, dir, 'metadata.json')
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
        allColors.push(metadata.color)
      }
    })
    
    const index = {
      totalColors: allColors.length,
      colors: allColors.sort(),
      views: ['front', 'back', 'front-2', 'back-2'],
      batches: summary.colorsByBatch,
      lastUpdate: new Date().toISOString()
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'index.json'),
      JSON.stringify(index, null, 2)
    )
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ Download Complete!')
    console.log(`📊 Total images downloaded: ${summary.totalDownloaded}`)
    console.log(`🎨 Total colors: ${allColors.length}`)
    console.log(`📁 Saved to: ${outputDir}`)
    console.log(`📋 Index updated: ${path.join(outputDir, 'index.json')}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

downloadAllBatches()

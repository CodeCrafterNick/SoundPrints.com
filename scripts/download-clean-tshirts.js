/**
 * Download clean t-shirt mockups
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

const outputDir = path.join(__dirname, '..', 'public', 'mockups', 'clean-displacement-reference')

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

async function downloadBatchMockups(productId, batchNum, colors) {
  console.log(`\n📦 Batch ${batchNum}`)
  console.log(`   Colors: ${colors.slice(0, 3).join(', ')}... (${colors.length} total)`)
  console.log(`   Product ID: ${productId}`)
  
  const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`
    }
  })

  const product = await response.json()
  
  if (!product.images || product.images.length === 0) {
    console.log('   ⚠️  No mockup images found yet\n')
    return { downloaded: 0, colors: [] }
  }

  console.log(`   Images: ${product.images.length}`)
  
  // Group images by variant (color/size)
  const imagesByVariant = {}
  for (const img of product.images) {
    if (!imagesByVariant[img.variant_ids[0]]) {
      imagesByVariant[img.variant_ids[0]] = []
    }
    imagesByVariant[img.variant_ids[0]].push(img)
  }
  
  // Find color name for each variant
  const variantColors = {}
  for (const variant of product.variants) {
    const colorName = variant.title.split(' / ')[0]
    const safeColor = colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    variantColors[variant.id] = { name: colorName, safe: safeColor }
  }
  
  let totalDownloaded = 0
  const processedColors = new Set()
  
  // Download images organized by color
  for (const [variantId, images] of Object.entries(imagesByVariant)) {
    const colorInfo = variantColors[variantId]
    if (!colorInfo || processedColors.has(colorInfo.safe)) continue
    
    processedColors.add(colorInfo.safe)
    const colorDir = path.join(outputDir, colorInfo.safe)
    
    if (fs.existsSync(colorDir)) {
      console.log(`   ⏭️  ${colorInfo.name} (already exists)`)
      continue
    }
    
    fs.mkdirSync(colorDir, { recursive: true })
    
    const views = []
    let downloaded = 0
    
    for (const img of images) {
      const label = img.src.match(/camera_label=([^&]+)/)?.[1] || `view-${downloaded + 1}`
      const filename = `${label}.jpg`.replace(/[^a-z0-9.-]/g, '-')
      const filepath = path.join(colorDir, filename)
      
      try {
        await downloadImage(img.src, filepath)
        downloaded++
        views.push({
          filename,
          label,
          url: img.src
        })
      } catch (error) {
        console.log(`   ❌ ${filename} - ${error.message}`)
      }
    }
    
    // Save metadata
    const metadata = {
      color: colorInfo.name,
      productId: productId,
      batchNum: batchNum,
      views: views,
      downloadDate: new Date().toISOString()
    }
    
    fs.writeFileSync(
      path.join(colorDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )
    
    console.log(`   ✅ ${colorInfo.name} (${downloaded} images)`)
    totalDownloaded += downloaded
  }
  
  console.log(`   📊 Downloaded: ${totalDownloaded} images for ${processedColors.size} colors\n`)
  
  return { downloaded: totalDownloaded, colors: Array.from(processedColors) }
}

async function downloadAll() {
  try {
    console.log('📥 Downloading Clean T-Shirt Mockups\n')
    console.log('='.repeat(80))
    
    console.log('\n⏳ Waiting 10 seconds for mockup generation...\n')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Read product IDs
    const productsPath = path.join(__dirname, '..', 'public', 'mockups', 'clean-tshirt-products.json')
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    
    const summary = {
      batches: [],
      totalImages: 0,
      totalColors: 0
    }
    
    console.log('='.repeat(80))
    
    for (const batch of productsData.batches) {
      const result = await downloadBatchMockups(batch.productId, batch.batchNum, batch.colors)
      summary.batches.push({
        batchNum: batch.batchNum,
        images: result.downloaded,
        colors: result.colors.length
      })
      summary.totalImages += result.downloaded
      summary.totalColors += result.colors.length
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Create index
    const colorDirs = fs.readdirSync(outputDir).filter(f => 
      fs.statSync(path.join(outputDir, f)).isDirectory()
    )
    
    const index = colorDirs.map(colorDir => {
      const metadataPath = path.join(outputDir, colorDir, 'metadata.json')
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
        return {
          color: metadata.color,
          folder: colorDir,
          views: metadata.views.length
        }
      }
      return null
    }).filter(Boolean)
    
    fs.writeFileSync(
      path.join(outputDir, 'index.json'),
      JSON.stringify({
        totalColors: index.length,
        colors: index,
        lastUpdated: new Date().toISOString()
      }, null, 2)
    )
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ Download Complete!\n')
    summary.batches.forEach(b => 
      console.log(`   Batch ${b.batchNum}: ${b.images} images (${b.colors} colors)`)
    )
    console.log(`\n📊 Total: ${summary.totalImages} images for ${summary.totalColors} colors`)
    console.log(`📁 Saved to: ${outputDir}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

downloadAll()

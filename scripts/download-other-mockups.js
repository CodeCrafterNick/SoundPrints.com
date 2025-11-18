/**
 * Download mockups for drinkware and wall art products
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

const outputDir = path.join(__dirname, '..', 'public', 'mockups')

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

async function downloadProductMockups(productId, productName, category) {
  console.log(`\n📦 ${productName}`)
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
    return { downloaded: 0, views: [] }
  }

  console.log(`   Images: ${product.images.length}`)
  
  // Create directory
  const safeName = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const productDir = path.join(outputDir, category, safeName)
  
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true })
  }
  
  let downloaded = 0
  const views = []
  
  // Download all images
  for (let i = 0; i < product.images.length; i++) {
    const img = product.images[i]
    const label = img.src.match(/camera_label=([^&]+)/)?.[1] || `view-${i + 1}`
    const position = img.position || 'default'
    
    // Create filename from position and label
    let filename = label
    if (position && position !== 'default' && !label.includes(position)) {
      filename = `${position}-${label}`
    }
    filename = `${filename}.jpg`.replace(/[^a-z0-9.-]/g, '-')
    
    const filepath = path.join(productDir, filename)
    
    try {
      await downloadImage(img.src, filepath)
      console.log(`   ✅ ${filename}`)
      downloaded++
      views.push({
        filename: filename,
        position: position,
        label: label,
        url: img.src
      })
    } catch (error) {
      console.log(`   ❌ ${filename} - ${error.message}`)
    }
  }
  
  // Get variant info
  const variantInfo = product.variants.map(v => ({
    id: v.id,
    title: v.title,
    price: v.price
  }))
  
  // Create metadata
  const metadata = {
    productId: productId,
    productName: productName,
    blueprintId: product.blueprint_id,
    category: category,
    variants: variantInfo,
    views: views,
    downloadDate: new Date().toISOString()
  }
  
  fs.writeFileSync(
    path.join(productDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  )
  
  console.log(`   📋 Metadata saved\n`)
  
  return { downloaded, views }
}

async function downloadAll() {
  try {
    console.log('📥 Downloading Drinkware & Wall Art Mockups\n')
    console.log('='.repeat(80))
    
    console.log('\n⏳ Waiting 5 seconds for mockup generation...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Read product IDs
    const productsPath = path.join(outputDir, 'other-products.json')
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    
    const summary = {
      drinkware: [],
      wallArt: [],
      totalImages: 0
    }
    
    // Download drinkware
    console.log('\n☕ DRINKWARE\n')
    console.log('='.repeat(80))
    
    for (const product of productsData.drinkware) {
      const result = await downloadProductMockups(product.productId, product.name, 'drinkware')
      summary.drinkware.push({
        name: product.name,
        images: result.downloaded
      })
      summary.totalImages += result.downloaded
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Download wall art
    console.log('\n🖼️  WALL ART\n')
    console.log('='.repeat(80))
    
    for (const product of productsData.wallArt) {
      const result = await downloadProductMockups(product.productId, product.name, 'wall-art')
      summary.wallArt.push({
        name: product.name,
        images: result.downloaded
      })
      summary.totalImages += result.downloaded
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Save summary
    const summaryPath = path.join(outputDir, 'download-summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify({
      ...summary,
      downloadDate: new Date().toISOString()
    }, null, 2))
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ Download Complete!\n')
    console.log(`☕ Drinkware:`)
    summary.drinkware.forEach(p => console.log(`   - ${p.name}: ${p.images} images`))
    console.log(`\n🖼️  Wall Art:`)
    summary.wallArt.forEach(p => console.log(`   - ${p.name}: ${p.images} images`))
    console.log(`\n📊 Total Images: ${summary.totalImages}`)
    console.log(`📁 Saved to: ${outputDir}`)
    console.log(`📋 Summary: ${summaryPath}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

downloadAll()

/**
 * Download base product images from Printify blueprints
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

const outputDir = path.join(__dirname, '..', 'public', 'mockups', 'blueprint-images')

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

async function downloadBlueprintImages(blueprintId, name) {
  console.log(`\n📦 ${name} (Blueprint ${blueprintId})`)
  
  const response = await fetch(`https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`, {
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`
    }
  })

  const blueprint = await response.json()
  
  if (!blueprint.images || blueprint.images.length === 0) {
    console.log('   ⚠️  No base images found\n')
    return 0
  }

  console.log(`   Images: ${blueprint.images.length}`)
  
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const productDir = path.join(outputDir, safeName)
  
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true })
  }
  
  let downloaded = 0
  
  for (let i = 0; i < blueprint.images.length; i++) {
    const imageUrl = blueprint.images[i]
    const filename = `view-${i + 1}.jpg`
    const filepath = path.join(productDir, filename)
    
    try {
      await downloadImage(imageUrl, filepath)
      console.log(`   ✅ ${filename}`)
      downloaded++
    } catch (error) {
      console.log(`   ❌ ${filename} - ${error.message}`)
    }
  }
  
  // Save metadata
  const metadata = {
    blueprintId: blueprintId,
    productName: name,
    title: blueprint.title,
    description: blueprint.description,
    brand: blueprint.brand,
    model: blueprint.model,
    images: blueprint.images,
    downloadDate: new Date().toISOString()
  }
  
  fs.writeFileSync(
    path.join(productDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  )
  
  console.log(`   📋 Metadata saved\n`)
  
  return downloaded
}

async function downloadAll() {
  try {
    console.log('📥 Downloading Blueprint Base Images\n')
    console.log('='.repeat(80))
    
    const products = [
      { id: 12, name: 'Bella+Canvas 3001 T-Shirt' },
      { id: 535, name: '11oz White Mug (ORCA)' },
      { id: 425, name: 'Mug 15oz' },
      { id: 353, name: 'Tumbler 20oz' },
      { id: 597, name: 'CamelBak Water Bottle' },
      { id: 554, name: 'Paper Poster' },
      { id: 282, name: 'Matte Vertical Posters' },
      { id: 555, name: 'Stretched Canvas' },
      { id: 540, name: 'Framed Vertical Posters' }
    ]
    
    let totalImages = 0
    
    for (const product of products) {
      const count = await downloadBlueprintImages(product.id, product.name)
      totalImages += count
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('='.repeat(80))
    console.log(`\n✅ Downloaded ${totalImages} base product images`)
    console.log(`📁 Saved to: ${outputDir}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

downloadAll()

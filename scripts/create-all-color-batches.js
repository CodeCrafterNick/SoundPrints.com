/**
 * Create multiple products to get mockups for ALL 72 colors
 */

const fs = require('fs')
const path = require('path')

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

// All 72 colors divided into batches of 12
const colorBatches = [
  // Batch 1 - Already have these
  ['White', 'Black', 'Navy', 'Red', 'Athletic Heather', 'Heather Navy', 'Dark Grey Heather', 'Natural', 'Light Blue', 'Forest', 'Maroon', 'Pink'],
  
  // Batch 2 - Heathers & Pastels
  ['Ash', 'Soft Pink', 'Heather Mauve', 'Heather Clay', 'Heather Orange', 'Heather Red', 'Heather True Royal', 'Heather Kelly', 'Heather Mint', 'Heather Ice Blue', 'Heather Aqua', 'Heather Slate'],
  
  // Batch 3 - Earthy & Neutrals
  ['Brown', 'Tan', 'Soft Cream', 'Vintage White', 'Heather Dust', 'Silver', 'Sage', 'Heather Olive', 'Military Green', 'Olive', 'Army', 'Dark Grey'],
  
  // Batch 4 - Bright Colors
  ['Orange', 'Burnt Orange', 'Gold', 'Yellow', 'Mustard', 'Kelly', 'Leaf', 'Mint', 'Aqua', 'Turquoise', 'Teal', 'Ocean Blue'],
  
  // Batch 5 - Blues & Purples
  ['Baby Blue', 'Steel Blue', 'True Royal', 'Heather Midnight Navy', 'Heather Deep Teal', 'Team Purple', 'Heather Team Purple', 'Lilac', 'Mauve', 'Berry', 'Cardinal', 'Asphalt'],
  
  // Batch 6 - Special Colors & Prisms
  ['Heather Prism Peach', 'Heather Prism Mint', 'Heather Prism Ice Blue', 'Heather Prism Lilac', 'Heather Prism Dusty Blue', 'Black Heather', 'Solid Black Blend', 'Vintage Black', 'Heather Forest', 'Heather Raspberry', 'Autumn', 'Charity Pink']
]

async function getAllVariants() {
  const providersResponse = await fetch('https://api.printify.com/v1/catalog/blueprints/12/print_providers.json', {
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`
    }
  })
  
  const providers = await providersResponse.json()
  const provider = providers[0]
  
  const variantsResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/12/print_providers/${provider.id}/variants.json`, {
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`
    }
  })
  
  const variantData = await variantsResponse.json()
  return {
    provider,
    variants: variantData.variants || []
  }
}

async function uploadImage(batchNum) {
  const soundwaveUrl = `https://placehold.co/2400x600/000000/FFFFFF/png?text=BATCH+${batchNum}`
  
  const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: `soundwave-batch-${batchNum}.png`,
      url: soundwaveUrl
    })
  })

  return await uploadResponse.json()
}

async function createProductForBatch(batchNum, colors, allVariants, provider) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📦 BATCH ${batchNum}: Creating product with ${colors.length} colors`)
  console.log(`${'='.repeat(80)}\n`)
  
  // Upload image
  console.log('📤 Uploading image...')
  const uploadData = await uploadImage(batchNum)
  console.log(`✅ Image uploaded - ID: ${uploadData.id}\n`)
  
  // Get variants for these colors
  const colorGroups = new Map()
  allVariants.forEach(v => {
    const colorName = v.title.split(' / ')[0]
    if (!colorGroups.has(colorName)) {
      colorGroups.set(colorName, [])
    }
    colorGroups.get(colorName).push(v)
  })
  
  const selectedVariants = []
  colors.forEach(colorName => {
    if (colorGroups.has(colorName)) {
      selectedVariants.push(...colorGroups.get(colorName))
    }
  })
  
  console.log(`🎨 Selected colors: ${colors.join(', ')}`)
  console.log(`📊 Total variants: ${selectedVariants.length}\n`)
  
  const variantsWithPricing = selectedVariants.map(v => ({
    id: v.id,
    price: 2999,
    is_enabled: true
  }))
  
  const variantIds = selectedVariants.map(v => v.id)
  
  const productData = {
    title: `Soundwave Batch ${batchNum}`,
    description: `Batch ${batchNum} - ${colors.join(', ')}`,
    blueprint_id: 12,
    print_provider_id: provider.id,
    variants: variantsWithPricing,
    print_areas: [
      {
        variant_ids: variantIds,
        placeholders: [
          {
            position: 'front',
            images: [
              {
                id: uploadData.id,
                x: 0.5,
                y: 0.5,
                scale: 1,
                angle: 0
              }
            ]
          }
        ]
      }
    ]
  }
  
  console.log('⏳ Creating product...')
  const createResponse = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })
  
  if (!createResponse.ok) {
    const error = await createResponse.text()
    console.error('❌ Failed:', error)
    return null
  }
  
  const product = await createResponse.json()
  console.log(`✅ Product created - ID: ${product.id}`)
  console.log(`   Variants: ${product.variants.length}`)
  
  return product.id
}

async function createAllBatches() {
  try {
    console.log('🌈 Creating Products for ALL 72 Colors\n')
    console.log('='.repeat(80))
    
    // Get all variants
    console.log('📚 Fetching variants...')
    const { provider, variants } = await getAllVariants()
    console.log(`✅ Found ${variants.length} total variants\n`)
    
    const productIds = []
    
    // Skip batch 1 (already have it)
    console.log('ℹ️  Skipping Batch 1 (already downloaded)\n')
    productIds.push('6918f714cf4bca7030060d86')
    
    // Create batches 2-6
    for (let i = 1; i < colorBatches.length; i++) {
      const batchNum = i + 1
      const colors = colorBatches[i]
      
      const productId = await createProductForBatch(batchNum, colors, variants, provider)
      if (productId) {
        productIds.push(productId)
        
        // Wait before next batch
        if (i < colorBatches.length - 1) {
          console.log('\n⏳ Waiting 3 seconds before next batch...\n')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    }
    
    // Save product IDs
    const outputPath = path.join(__dirname, '..', 'public', 'mockups', 'displacement-reference', 'product-ids.json')
    fs.writeFileSync(outputPath, JSON.stringify({
      createdAt: new Date().toISOString(),
      totalBatches: colorBatches.length,
      productIds: productIds,
      batches: colorBatches.map((colors, i) => ({
        batchNum: i + 1,
        productId: productIds[i],
        colors: colors
      }))
    }, null, 2))
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ All products created!')
    console.log(`📋 Product IDs saved to: ${outputPath}`)
    console.log(`\n🎯 Next step: Wait 5-10 seconds for mockup generation, then run download script\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createAllBatches()

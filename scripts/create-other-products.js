/**
 * Create drinkware and wall art products to get mockup images
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

// Drinkware products to create
const drinkwareProducts = [
  { id: 535, name: '11oz White Mug (ORCA Coatings)' },
  { id: 425, name: 'Mug 15oz' },
  { id: 353, name: 'Tumbler 20oz' },
  { id: 597, name: 'CamelBak Eddy Water Bottle' }
]

// Wall art products to create
const wallArtProducts = [
  { id: 554, name: 'Paper Poster' },
  { id: 282, name: 'Matte Vertical Posters' },
  { id: 555, name: 'Stretched Canvas' },
  { id: 540, name: 'Framed Vertical Posters' }
]

async function uploadImage(productName) {
  const soundwaveUrl = `https://placehold.co/2400x600/000000/FFFFFF/png?text=${encodeURIComponent(productName)}`
  
  const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: `${productName.toLowerCase().replace(/\s+/g, '-')}.png`,
      url: soundwaveUrl
    })
  })

  return await uploadResponse.json()
}

async function createProduct(blueprintId, productName) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📦 Creating: ${productName}`)
  console.log(`${'='.repeat(80)}\n`)

  try {
    // Get print providers
    const providersResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`, {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    const providers = await providersResponse.json()
    if (providers.length === 0) {
      console.log('❌ No providers found\n')
      return null
    }
    
    const provider = providers[0]
    console.log(`Provider: ${provider.title}`)
    
    // Get variants
    const variantsResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${provider.id}/variants.json`, {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    const variantData = await variantsResponse.json()
    const allVariants = variantData.variants || []
    
    console.log(`Variants: ${allVariants.length}`)
    
    if (allVariants.length === 0) {
      console.log('❌ No variants found\n')
      return null
    }
    
    // Upload image
    console.log('📤 Uploading image...')
    const uploadData = await uploadImage(productName)
    console.log(`✅ Image uploaded - ID: ${uploadData.id}`)
    
    // Limit to 100 variants
    const selectedVariants = allVariants.slice(0, 100)
    console.log(`Selected ${selectedVariants.length} variants (max 100)`)
    
    const variantsWithPricing = selectedVariants.map(v => ({
      id: v.id,
      price: 2999,
      is_enabled: true
    }))
    
    const variantIds = selectedVariants.map(v => v.id)
    
    // Create product
    const productData = {
      title: `Soundwave ${productName}`,
      description: `Custom soundwave on ${productName}`,
      blueprint_id: blueprintId,
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
    console.log(`   Variants: ${product.variants.length}\n`)
    
    return {
      productId: product.id,
      blueprintId: blueprintId,
      name: productName,
      variantCount: product.variants.length
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function createAllProducts() {
  console.log('☕ Creating Drinkware & Wall Art Products\n')
  console.log('='.repeat(80))
  
  const results = {
    drinkware: [],
    wallArt: [],
    createdAt: new Date().toISOString()
  }
  
  // Create drinkware products
  console.log('\n☕ DRINKWARE PRODUCTS\n')
  for (const product of drinkwareProducts) {
    const result = await createProduct(product.id, product.name)
    if (result) {
      results.drinkware.push(result)
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Create wall art products
  console.log('\n🖼️  WALL ART PRODUCTS\n')
  for (const product of wallArtProducts) {
    const result = await createProduct(product.id, product.name)
    if (result) {
      results.wallArt.push(result)
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Save results
  const outputPath = path.join(__dirname, '..', 'public', 'mockups', 'other-products.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  
  console.log('\n' + '='.repeat(80))
  console.log('\n✅ All products created!')
  console.log(`📋 Results saved to: ${outputPath}`)
  console.log(`\n☕ Drinkware: ${results.drinkware.length} products`)
  console.log(`🖼️  Wall Art: ${results.wallArt.length} products`)
  console.log(`\n⏳ Wait 5-10 seconds for mockup generation, then run download script\n`)
}

createAllProducts()

/**
 * Recreate all products with transparent placeholder to get clean mockups
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

// T-shirt colors grouped into batches of 12
const COLOR_BATCHES = [
  ['White', 'Black', 'Heather Grey', 'Navy', 'Dark Grey Heather', 'True Royal', 'Purple', 'Red', 'Leaf', 'Light Blue', 'Light Pink', 'Silver'],
  ['Asphalt', 'Brown', 'Kelly', 'Team Purple', 'Maroon', 'Forest Green', 'Heather Navy', 'Heather Deep Teal', 'Charity Pink', 'Heather Red', 'Heather Orange', 'Gold'],
  ['Heather Orchid', 'Deep Heather', 'Heather Cardinal', 'Heather Forest', 'Olive', 'Teal', 'Sunset', 'Steel Blue', 'Mauve', 'Mint', 'Yellow Haze', 'Dusty Blue'],
  ['Orchid', 'Heather Midnight Navy', 'Heather Maroon', 'Heather Royal', 'Heather True Royal', 'Heather Kelly', 'Aqua', 'Solid Light Pink', 'Solid Warm Gray', 'Heather Dust', 'Heather Peach', 'Soft Cream'],
  ['Heather Mint', 'Heather Columbia Blue', 'Autumn', 'Solid Red Triblend', 'Heather Clay', 'Heather Raspberry', 'Storm', 'Pebble', 'Soft Pink', 'Tan', 'Heather Sunset', 'Athletic Heather'],
  ['Canvas Red', 'Heather Slate', 'Heather Team Purple', 'Ash', 'Solid Tahiti Blue', 'Athletic Blue', 'Athletic Maroon', 'Heather Military Green', 'Natural', 'Heather Prism Peach', 'Heather Ice Blue', 'Heather Aqua']
]

async function uploadImage() {
  console.log('📤 Uploading transparent placeholder...\n')
  
  const imagePath = path.join(__dirname, '..', 'public', 'transparent-placeholder.png')
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = imageBuffer.toString('base64')
  
  const response = await fetch(`https://api.printify.com/v1/uploads/images.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: 'transparent-placeholder.png',
      contents: base64Image
    })
  })

  const result = await response.json()
  console.log('✅ Image uploaded successfully')
  console.log(`   Image ID: ${result.id}\n`)
  
  return result.id
}

async function getProviderAndVariants() {
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

async function createTShirtBatch(imageId, batchNum, colors, allVariants, providerId) {
  console.log(`\n👕 Creating T-Shirt Batch ${batchNum}/6`)
  console.log(`   Colors: ${colors.join(', ')}`)
  
  // Get variants for these colors
  const colorVariants = allVariants.filter(v => colors.includes(v.title.split(' / ')[0]))
  const variantIds = colorVariants.map(v => v.id)
  
  console.log(`   Found ${variantIds.length} variants`)
  
  const productData = {
    title: `Clean Mockup Reference - Batch ${batchNum}`,
    description: 'Product for generating clean mockup images',
    blueprint_id: 12,
    print_provider_id: providerId,
    variants: variantIds.map(id => ({
      id: id,
      price: 2999,
      is_enabled: true
    })),
    print_areas: [
      {
        variant_ids: variantIds,
        placeholders: [
          {
            position: 'front',
            images: [
              {
                id: imageId,
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

  const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })

  const product = await response.json()
  console.log(`   ✅ Created - Product ID: ${product.id}`)
  console.log(`   📊 Variants: ${variantIds.length}\n`)
  
  return product.id
}

async function createDrinkwareProduct(imageId, blueprintId, name) {
  console.log(`\n☕ Creating ${name}`)
  
  const productData = {
    title: `Clean Mockup Reference - ${name}`,
    description: 'Product for generating clean mockup images',
    blueprint_id: blueprintId,
    print_provider_id: blueprintId === 535 ? 29 : (blueprintId === 425 ? 16 : (blueprintId === 353 ? 16 : 99)),
    variants: [
      {
        id: blueprintId === 535 ? 17390 : (blueprintId === 425 ? 12984 : (blueprintId === 353 ? 12263 : [36965, 36966, 36967, 36968])),
        price: blueprintId === 597 ? 2499 : 1999,
        is_enabled: true
      }
    ],
    print_areas: [
      {
        variant_ids: blueprintId === 597 ? [36965, 36966, 36967, 36968] : [blueprintId === 535 ? 17390 : (blueprintId === 425 ? 12984 : 12263)],
        placeholders: [
          {
            position: 'default',
            images: [
              {
                id: imageId,
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

  // Fix variants for water bottle (has 4 variants)
  if (blueprintId === 597) {
    productData.variants = [
      { id: 36965, price: 2499, is_enabled: true },
      { id: 36966, price: 2499, is_enabled: true },
      { id: 36967, price: 2499, is_enabled: true },
      { id: 36968, price: 2499, is_enabled: true }
    ]
  }

  const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })

  const product = await response.json()
  console.log(`   ✅ Created - Product ID: ${product.id}\n`)
  
  return product.id
}

async function createWallArtProduct(imageId, blueprintId, name) {
  console.log(`\n🖼️  Creating ${name}`)
  
  // Get variant IDs for each product type
  const variantIds = {
    554: [47652, 47653, 47654, 47655, 47656, 47657, 47658, 47659, 47660, 47661, 47662, 47663], // Paper Poster
    282: [9513, 9514, 9515, 9516, 9517, 9518, 9519, 9520, 9521, 9522, 9523, 9524, 9525], // Matte Vertical
    555: [47762, 47763, 47764, 47765, 47766, 47767, 47768, 47769, 47770, 47771], // Stretched Canvas
    540: Array.from({length: 21}, (_, i) => 46450 + i) // Framed Vertical (approximate)
  }

  const variants = variantIds[blueprintId].map(id => ({
    id: id,
    price: 2999,
    is_enabled: true
  }))

  const productData = {
    title: `Clean Mockup Reference - ${name}`,
    description: 'Product for generating clean mockup images',
    blueprint_id: blueprintId,
    print_provider_id: blueprintId === 554 ? 16 : (blueprintId === 282 ? 16 : (blueprintId === 555 ? 16 : 16)),
    variants: variants,
    print_areas: [
      {
        variant_ids: variants.map(v => v.id),
        placeholders: [
          {
            position: 'default',
            images: [
              {
                id: imageId,
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

  const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })

  const product = await response.json()
  console.log(`   ✅ Created - Product ID: ${product.id}`)
  console.log(`   📊 Variants: ${variants.length}\n`)
  
  return product.id
}

async function recreateAll() {
  try {
    console.log('🔄 Recreating All Products with Clean Mockups\n')
    console.log('='.repeat(80))
    
    // Upload transparent image
    const imageId = await uploadImage()
    
    // Get provider and variants
    console.log('\n📋 Getting print provider and variants...\n')
    const { provider, variants } = await getProviderAndVariants()
    console.log(`   Provider: ${provider.title} (ID: ${provider.id})`)
    console.log(`   Total variants: ${variants.length}\n`)
    
    const allProducts = {
      tshirts: [],
      drinkware: [],
      wallArt: []
    }
    
    // Create t-shirt batches
    console.log('\n👕 T-SHIRT BATCHES\n')
    console.log('='.repeat(80))
    
    for (let i = 0; i < COLOR_BATCHES.length; i++) {
      const productId = await createTShirtBatch(imageId, i + 1, COLOR_BATCHES[i], variants, provider.id)
      allProducts.tshirts.push({
        batchNum: i + 1,
        productId: productId,
        colors: COLOR_BATCHES[i]
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Create drinkware
    console.log('\n☕ DRINKWARE\n')
    console.log('='.repeat(80))
    
    const drinkware = [
      { id: 535, name: '11oz White Mug (ORCA)' },
      { id: 425, name: 'Mug 15oz' },
      { id: 353, name: 'Tumbler 20oz' },
      { id: 597, name: 'CamelBak Water Bottle' }
    ]
    
    for (const item of drinkware) {
      const productId = await createDrinkwareProduct(imageId, item.id, item.name)
      allProducts.drinkware.push({
        name: item.name,
        blueprintId: item.id,
        productId: productId
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Create wall art
    console.log('\n🖼️  WALL ART\n')
    console.log('='.repeat(80))
    
    const wallArt = [
      { id: 554, name: 'Paper Poster' },
      { id: 282, name: 'Matte Vertical Posters' },
      { id: 555, name: 'Stretched Canvas' },
      { id: 540, name: 'Framed Vertical Posters' }
    ]
    
    for (const item of wallArt) {
      const productId = await createWallArtProduct(imageId, item.id, item.name)
      allProducts.wallArt.push({
        name: item.name,
        blueprintId: item.id,
        productId: productId
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Save all product IDs
    const outputPath = path.join(__dirname, '..', 'public', 'mockups', 'clean-products.json')
    fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2))
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ All Products Created!\n')
    console.log(`👕 T-Shirts: ${allProducts.tshirts.length} batches`)
    console.log(`☕ Drinkware: ${allProducts.drinkware.length} products`)
    console.log(`🖼️  Wall Art: ${allProducts.wallArt.length} products`)
    console.log(`\n📋 Product IDs saved to: ${outputPath}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

recreateAll()

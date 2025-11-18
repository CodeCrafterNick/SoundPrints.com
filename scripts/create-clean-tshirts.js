/**
 * Create t-shirt products with transparent image (only front print area to keep it simple)
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
const COLOR_BATCHES = [
  ['White', 'Black', 'Navy', 'Red', 'Athletic Heather', 'Heather Navy', 'Dark Grey Heather', 'Natural', 'Light Blue', 'Forest', 'Maroon', 'Pink'],
  ['Ash', 'Soft Pink', 'Heather Mauve', 'Heather Clay', 'Heather Orange', 'Heather Red', 'Heather True Royal', 'Heather Kelly', 'Heather Mint', 'Heather Ice Blue', 'Heather Aqua', 'Heather Slate'],
  ['Brown', 'Tan', 'Soft Cream', 'Vintage White', 'Heather Dust', 'Silver', 'Sage', 'Heather Olive', 'Military Green', 'Olive', 'Army', 'Dark Grey'],
  ['Orange', 'Burnt Orange', 'Gold', 'Yellow', 'Mustard', 'Kelly', 'Leaf', 'Mint', 'Aqua', 'Turquoise', 'Teal', 'Ocean Blue'],
  ['Baby Blue', 'Steel Blue', 'True Royal', 'Heather Midnight Navy', 'Heather Deep Teal', 'Team Purple', 'Heather Team Purple', 'Lilac', 'Mauve', 'Berry', 'Cardinal', 'Asphalt'],
  ['Heather Prism Peach', 'Heather Prism Mint', 'Heather Prism Ice Blue', 'Heather Prism Lilac', 'Heather Prism Dusty Blue', 'Black Heather', 'Solid Black Blend', 'Vintage Black', 'Heather Forest', 'Heather Raspberry', 'Autumn', 'Charity Pink']
]

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

async function uploadTransparentImage() {
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
  console.log('✅ Image uploaded')
  console.log(`   Image ID: ${result.id}\n`)
  
  return result.id
}

async function createTShirtBatch(imageId, batchNum, colors, allVariants, providerId) {
  console.log(`\n👕 Creating T-Shirt Batch ${batchNum}/6`)
  console.log(`   Colors: ${colors.join(', ')}`)
  
  // Get variants for these colors
  const colorVariants = allVariants.filter(v => {
    const colorName = v.title.split(' / ')[0]
    return colors.includes(colorName)
  })
  
  const variantIds = colorVariants.map(v => v.id)
  console.log(`   Found ${variantIds.length} variants`)
  
  const productData = {
    title: `Clean T-Shirt Mockups - Batch ${batchNum}`,
    description: 'Product for generating clean mockup images with transparent background',
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
  
  if (product.id) {
    console.log(`   ✅ Created - Product ID: ${product.id}`)
    console.log(`   📊 Variants: ${variantIds.length}\n`)
    return product.id
  } else {
    console.log(`   ❌ Failed:`, product)
    return null
  }
}

async function createAllTShirts() {
  try {
    console.log('👕 Creating Clean T-Shirt Mockup Products\n')
    console.log('='.repeat(80) + '\n')
    
    // Upload transparent image
    const imageId = await uploadTransparentImage()
    
    // Get provider and variants
    console.log('📋 Getting print provider and variants...\n')
    const { provider, variants } = await getProviderAndVariants()
    console.log(`   Provider: ${provider.title} (ID: ${provider.id})`)
    console.log(`   Total variants: ${variants.length}\n`)
    
    const productIds = []
    
    // Create batches
    console.log('='.repeat(80))
    
    for (let i = 0; i < COLOR_BATCHES.length; i++) {
      const productId = await createTShirtBatch(imageId, i + 1, COLOR_BATCHES[i], variants, provider.id)
      if (productId) {
        productIds.push({
          batchNum: i + 1,
          productId: productId,
          colors: COLOR_BATCHES[i]
        })
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Save product IDs
    const outputPath = path.join(__dirname, '..', 'public', 'mockups', 'clean-tshirt-products.json')
    fs.writeFileSync(outputPath, JSON.stringify({
      createdAt: new Date().toISOString(),
      totalBatches: productIds.length,
      imageId: imageId,
      providerId: provider.id,
      batches: productIds
    }, null, 2))
    
    console.log('\n' + '='.repeat(80))
    console.log(`\n✅ Created ${productIds.length} t-shirt products`)
    console.log(`📋 Product IDs saved to: ${outputPath}\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createAllTShirts()

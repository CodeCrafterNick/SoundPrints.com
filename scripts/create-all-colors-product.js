/**
 * Create a Printify product with ALL 72 colors
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

async function createAllColorsProduct() {
  try {
    console.log('🌈 Creating Product with ALL 72 Colors\n')
    console.log('='.repeat(80) + '\n')

    // Step 1: Get all variants for Blueprint 12
    console.log('📚 Step 1: Fetching all color variants...')
    
    const providersResponse = await fetch('https://api.printify.com/v1/catalog/blueprints/12/print_providers.json', {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    const providers = await providersResponse.json()
    const provider = providers[0] // Printful
    
    const variantsResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/12/print_providers/${provider.id}/variants.json`, {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    const variantData = await variantsResponse.json()
    const allVariants = variantData.variants || []
    
    console.log(`✅ Found ${allVariants.length} total variants\n`)

    // Step 2: Upload soundwave image
    console.log('📤 Step 2: Uploading soundwave image...')
    
    const soundwaveUrl = 'https://placehold.co/2400x600/000000/FFFFFF/png?text=ALL+COLORS+SOUNDWAVE'
    
    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_name: 'all-colors-soundwave.png',
        url: soundwaveUrl
      })
    })

    const uploadData = await uploadResponse.json()
    console.log(`✅ Image uploaded - ID: ${uploadData.id}\n`)

    // Step 3: Select top colors (we need to stay under 100 variants)
    console.log('💰 Step 3: Selecting popular colors (Printify limit: 100 variants)...')
    
    // Popular colors we want to offer - picking ~12 colors × ~8 sizes = ~96 variants
    const popularColors = [
      'White', 'Black', 'Navy', 'Red', 'Athletic Heather',
      'Heather Navy', 'Dark Grey Heather', 'Natural', 
      'Light Blue', 'Forest', 'Maroon', 'Pink'
    ]
    
    // Get all unique colors with their variants
    const colorGroups = new Map()
    allVariants.forEach(v => {
      const colorName = v.title.split(' / ')[0]
      if (!colorGroups.has(colorName)) {
        colorGroups.set(colorName, [])
      }
      colorGroups.get(colorName).push(v)
    })
    
    console.log(`   Total unique colors available: ${colorGroups.size}`)
    
    // Select variants only from popular colors
    const selectedVariants = []
    popularColors.forEach(colorName => {
      if (colorGroups.has(colorName)) {
        selectedVariants.push(...colorGroups.get(colorName))
      }
    })
    
    console.log(`   Selected ${popularColors.length} colors with all sizes`)
    console.log(`   Total variants: ${selectedVariants.length}`)
    
    // Prepare with pricing
    const variantsWithPricing = selectedVariants.map(v => ({
      id: v.id,
      price: 2999, // $29.99 for all
      is_enabled: true
    }))
    
    console.log(`✅ Ready to create product with ${selectedVariants.length} variants\n`)

    // Step 4: Get all variant IDs for print area
    const variantIds = selectedVariants.map(v => v.id)
    
    // Step 5: Create product
    console.log('📦 Step 4: Creating product with all colors...')
    
    const productData = {
      title: 'Soundwave T-Shirt - All Colors',
      description: 'Custom soundwave design available in all 72 colors',
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
      console.error('❌ Product creation failed:', error)
      return
    }

    const product = await createResponse.json()
    console.log(`✅ Product created - ID: ${product.id}`)
    console.log(`   Title: ${product.title}`)
    console.log(`   Variants: ${product.variants.length}`)
    console.log(`   Status: ${product.visible ? 'Visible' : 'Hidden'}\n`)

    // Step 6: Wait and fetch product to see mockups
    console.log('⏳ Step 5: Waiting for mockup generation (5 seconds)...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const productResponse = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${product.id}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    const fullProduct = await productResponse.json()
    
    console.log('='.repeat(80))
    console.log('🎨 COLORS AVAILABLE')
    console.log('='.repeat(80) + '\n')
    
    if (fullProduct.options) {
      const colorOption = fullProduct.options.find(opt => opt.type === 'color')
      if (colorOption) {
        console.log(`Found ${colorOption.values.length} colors:\n`)
        colorOption.values.forEach((color, i) => {
          const hex = color.colors[0]
          console.log(`${String(i + 1).padStart(2)}. ${color.title.padEnd(30)} ${hex}`)
        })
      }
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('🖼️  MOCKUP IMAGES')
    console.log('='.repeat(80) + '\n')
    
    if (fullProduct.images && fullProduct.images.length > 0) {
      console.log(`Generated ${fullProduct.images.length} mockup images:\n`)
      fullProduct.images.forEach((img, i) => {
        const label = img.src.match(/camera_label=([^&]+)/)?.[1] || 'unknown'
        console.log(`${i + 1}. ${label}: ${img.src}`)
      })
    } else {
      console.log('⚠️  No mockup images found yet (may still be generating)')
    }

    console.log('\n' + '='.repeat(80))
    console.log(`\n✅ Product with ALL COLORS created successfully!`)
    console.log(`   Product ID: ${product.id}`)
    console.log(`   Total Variants: ${product.variants.length}`)
    console.log(`   View in Printify: https://printify.com/app/products/${product.id}`)
    console.log(`\n⚠️  Product left in shop - delete manually if needed\n`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createAllColorsProduct()

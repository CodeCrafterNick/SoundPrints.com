/**
 * Update existing products with transparent image and redownload mockups
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

async function updateProduct(productId, newImageId, productName) {
  console.log(`📝 Updating: ${productName}`)
  console.log(`   Product ID: ${productId}`)
  
  // Get current product
  const getResponse = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`, {
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`
    }
  })
  
  const product = await getResponse.json()
  
  if (product.error) {
    console.log(`   ❌ Error: ${product.error}\n`)
    return false
  }
  
  // Update print areas with new image
  product.print_areas = product.print_areas.map(area => ({
    ...area,
    placeholders: area.placeholders.map(placeholder => ({
      ...placeholder,
      images: placeholder.images.map(img => ({
        ...img,
        id: newImageId
      }))
    }))
  }))
  
  // Update product
  const updateResponse = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: product.title,
      description: product.description,
      blueprint_id: product.blueprint_id,
      print_provider_id: product.print_provider_id,
      variants: product.variants,
      print_areas: product.print_areas
    })
  })
  
  const result = await updateResponse.json()
  
  if (result.id) {
    console.log(`   ✅ Updated successfully\n`)
    return true
  } else {
    console.log(`   ❌ Update failed:`, result, '\n')
    return false
  }
}

async function updateAllProducts() {
  try {
    console.log('🔄 Updating All Products with Transparent Image\n')
    console.log('='.repeat(80) + '\n')
    
    // Upload transparent image
    const imageId = await uploadTransparentImage()
    
    // Read existing product IDs
    const tshirtIds = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'public', 'mockups', 'displacement-reference', 'product-ids.json'), 'utf8'
    ))
    
    const otherProducts = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', 'public', 'mockups', 'other-products.json'), 'utf8'
    ))
    
    let updated = 0
    let failed = 0
    
    // Update T-shirt batches
    console.log('👕 T-SHIRTS\n')
    console.log('='.repeat(80) + '\n')
    
    for (let i = 0; i < tshirtIds.batches.length; i++) {
      const batch = tshirtIds.batches[i]
      const success = await updateProduct(batch.productId, imageId, `T-Shirt Batch ${i + 1}`)
      if (success) updated++
      else failed++
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Update Drinkware
    console.log('\n☕ DRINKWARE\n')
    console.log('='.repeat(80) + '\n')
    
    for (const product of otherProducts.drinkware) {
      const success = await updateProduct(product.productId, imageId, product.name)
      if (success) updated++
      else failed++
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Update Wall Art
    console.log('\n🖼️  WALL ART\n')
    console.log('='.repeat(80) + '\n')
    
    for (const product of otherProducts.wallArt) {
      const success = await updateProduct(product.productId, imageId, product.name)
      if (success) updated++
      else failed++
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n' + '='.repeat(80))
    console.log(`\n✅ Update Complete!`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Failed: ${failed}`)
    console.log(`\n⏳ Wait 10 seconds for mockup regeneration, then run download scripts\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

updateAllProducts()

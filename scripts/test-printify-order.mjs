#!/usr/bin/env node
/**
 * Test Printify Order Submission
 * 
 * This script tests the Printify API by:
 * 1. Uploading a test image
 * 2. Creating a test order (won't actually print/ship in test mode)
 * 
 * Usage: node scripts/test-printify-order.mjs
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID

if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
  console.error('❌ Missing PRINTIFY_API_KEY or PRINTIFY_SHOP_ID in .env.local')
  process.exit(1)
}

const API_URL = 'https://api.printify.com/v1'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()
  
  if (!response.ok) {
    console.error('API Error:', data)
    throw new Error(data.message || response.statusText)
  }
  
  return data
}

async function testPrintifyOrder() {
  console.log('🧪 Testing Printify Order Submission\n')
  console.log('Shop ID:', PRINTIFY_SHOP_ID)
  console.log('API Key:', PRINTIFY_API_KEY.substring(0, 20) + '...\n')

  // Step 1: Test API connection
  console.log('1️⃣ Testing API connection...')
  try {
    const shops = await request('/shops.json')
    const shop = shops.find(s => s.id.toString() === PRINTIFY_SHOP_ID)
    if (shop) {
      console.log(`   ✅ Connected to shop: ${shop.title} (ID: ${shop.id})\n`)
    } else {
      console.log(`   ❌ Shop ID ${PRINTIFY_SHOP_ID} not found in your shops:`)
      shops.forEach(s => console.log(`      - ${s.title} (ID: ${s.id})`))
      return
    }
  } catch (error) {
    console.error('   ❌ Failed to connect to Printify:', error.message)
    return
  }

  // Step 2: Get available print providers for posters (Blueprint 282)
  console.log('2️⃣ Getting print providers for Vertical Poster (Blueprint 282)...')
  let printProviderId = 99 // Default to Printify Choice
  try {
    const providers = await request('/catalog/blueprints/282/print_providers.json')
    console.log(`   ✅ Found ${providers.length} print providers`)
    providers.forEach(p => console.log(`      - ${p.title} (ID: ${p.id})`))
    printProviderId = providers[0]?.id || 99
    console.log(`   Using provider: ${printProviderId}\n`)
  } catch (error) {
    console.error('   ❌ Failed to get print providers:', error.message)
  }

  // Step 3: Get available variants
  console.log('3️⃣ Getting variants for Blueprint 282...')
  let variantId = null
  try {
    const variantData = await request(`/catalog/blueprints/282/print_providers/${printProviderId}/variants.json`)
    console.log(`   ✅ Found ${variantData.variants?.length || 0} variants`)
    variantData.variants?.slice(0, 5).forEach(v => {
      console.log(`      - ID: ${v.id}, Title: ${v.title}, Price: $${v.price / 100}`)
    })
    // Pick the first variant (usually smallest size)
    variantId = variantData.variants?.[0]?.id
    console.log(`   Using variant: ${variantId}\n`)
  } catch (error) {
    console.error('   ❌ Failed to get variants:', error.message)
    return
  }

  // Step 4: Upload a test image (using a real image URL)
  console.log('4️⃣ Uploading test image...')
  let imageId
  let imageUrl
  try {
    // Use a publicly accessible test image
    const uploadResult = await request('/uploads/images.json', {
      method: 'POST',
      body: JSON.stringify({
        file_name: 'test-waveform.png',
        // Using a real test image from Picsum Photos
        url: 'https://picsum.photos/3000/4000',
      }),
    })
    imageId = uploadResult.id
    console.log(`   ✅ Image uploaded: ${imageId}`)
    
    // Get the image URL from the upload
    const imageDetails = await request(`/uploads/${imageId}.json`)
    imageUrl = imageDetails.preview_url
    console.log(`   Image URL: ${imageUrl}\n`)
  } catch (error) {
    console.error('   ❌ Failed to upload image:', error.message)
    console.log('   ℹ️  Trying with base64 encoded placeholder...\n')
    
    // Try uploading with a base64 image
    try {
      const uploadResult = await request('/uploads/images.json', {
        method: 'POST',
        body: JSON.stringify({
          file_name: 'test-waveform.png',
          // Use a known working image URL
          url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=3000&h=4000&fit=crop',
        }),
      })
      imageId = uploadResult.id
      console.log(`   ✅ Image uploaded (retry): ${imageId}`)
      
      const imageDetails = await request(`/uploads/${imageId}.json`)
      imageUrl = imageDetails.preview_url
      console.log(`   Image URL: ${imageUrl}\n`)
    } catch (e2) {
      console.error('   ❌ Retry failed:', e2.message)
      console.log('   ⚠️  Continuing without image upload...\n')
    }
  }

  if (!imageUrl) {
    console.log('   ❌ Cannot create order without an uploaded image')
    console.log('   Please check if you have any existing images in your Printify account...\n')
    
    try {
      const uploads = await request('/uploads.json')
      console.log(`   Found ${uploads.length || 0} existing uploads:`)
      uploads.slice?.(0, 5).forEach(u => {
        console.log(`      - ID: ${u.id}, Name: ${u.file_name}`)
      })
      if (uploads.length > 0) {
        const firstUpload = await request(`/uploads/${uploads[0].id}.json`)
        imageUrl = firstUpload.preview_url
        console.log(`   Using existing image URL: ${imageUrl}\n`)
      }
    } catch (e) {
      console.log('   Could not fetch existing uploads')
      return
    }
  }

  if (!imageUrl) {
    console.log('   ❌ No image available for order creation')
    return
  }

  // Step 5: Create a test order
  console.log('5️⃣ Creating test order...')
  console.log('   ⚠️  Using is_printify_express: false (TEST MODE - won\'t print/ship)\n')
  
  const testOrder = {
    external_id: `test-${Date.now()}`,
    label: 'SoundPrints Test Order',
    line_items: [
      {
        blueprint_id: 282, // Vertical Poster
        print_provider_id: printProviderId,
        variant_id: variantId,
        quantity: 1,
        print_areas: {
          front: imageUrl  // Use the full image URL
        }
      }
    ],
    shipping_method: 1, // Standard shipping
    is_printify_express: false, // TEST MODE - won't actually print or ship
    send_shipping_notification: false,
    address_to: {
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@soundprints.com',
      phone: '555-123-4567',
      country: 'US',
      region: 'CA',
      address1: '123 Test Street',
      address2: '',
      city: 'San Francisco',
      zip: '94102'
    }
  }

  try {
    const order = await request(`/shops/${PRINTIFY_SHOP_ID}/orders.json`, {
      method: 'POST',
      body: JSON.stringify(testOrder),
    })
    
    console.log('   ✅ Test order created!')
    console.log(`   Order ID: ${order.id}`)
    console.log(`   External ID: ${order.external_id}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Total: $${(order.total_price / 100).toFixed(2)}`)
    console.log(`   Shipping: $${(order.total_shipping / 100).toFixed(2)}`)
    console.log('')
    console.log('   📋 Full order response:')
    console.log(JSON.stringify(order, null, 2))
    
  } catch (error) {
    console.error('   ❌ Failed to create order:', error.message)
    console.log('\n   Debug info:')
    console.log(`   - Blueprint ID: 282`)
    console.log(`   - Provider ID: ${printProviderId}`)
    console.log(`   - Variant ID: ${variantId}`)
    console.log(`   - Image URL: ${imageUrl}`)
  }

  console.log('\n✨ Test complete!')
}

testPrintifyOrder().catch(console.error)

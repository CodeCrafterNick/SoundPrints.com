/**
 * Check how many mockup images the API returns for the multi-color product
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

// Product ID from the last test
const PRODUCT_ID = '6918f714cf4bca7030060d86'

async function checkProductImages() {
  try {
    console.log('🔍 Fetching product from Printify API...\n')
    console.log('='.repeat(80) + '\n')

    const response = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${PRODUCT_ID}.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Failed to fetch product:', error)
      return
    }

    const product = await response.json()
    
    console.log('📦 PRODUCT DETAILS')
    console.log('='.repeat(80))
    console.log(`Product ID: ${product.id}`)
    console.log(`Title: ${product.title}`)
    console.log(`Blueprint ID: ${product.blueprint_id}`)
    console.log(`Variants: ${product.variants?.length || 0}`)
    console.log(`Images: ${product.images?.length || 0}`)
    console.log(`Visible: ${product.visible}`)
    console.log('')

    // Analyze images
    if (product.images && product.images.length > 0) {
      console.log('🖼️  MOCKUP IMAGES ANALYSIS')
      console.log('='.repeat(80))
      console.log(`Total Images: ${product.images.length}\n`)

      // Group by variant
      const imagesByVariant = new Map()
      product.images.forEach(img => {
        const variantIds = img.variant_ids || []
        variantIds.forEach(variantId => {
          if (!imagesByVariant.has(variantId)) {
            imagesByVariant.set(variantId, [])
          }
          imagesByVariant.get(variantId).push(img)
        })
      })

      console.log(`Variants with mockups: ${imagesByVariant.size}`)
      console.log(`Images per variant: ${product.images.length / imagesByVariant.size}\n`)

      // Show first variant's images
      const firstVariantId = Array.from(imagesByVariant.keys())[0]
      const firstVariantImages = imagesByVariant.get(firstVariantId)
      
      console.log(`Example - Variant ${firstVariantId}:`)
      firstVariantImages.forEach((img, i) => {
        const label = img.src.match(/camera_label=([^&]+)/)?.[1] || 'unknown'
        console.log(`  ${i + 1}. ${label}: ${img.src}`)
      })

      // Group by position/camera
      console.log('\n' + '='.repeat(80))
      console.log('📸 MOCKUP VIEWS')
      console.log('='.repeat(80) + '\n')
      
      const viewCounts = new Map()
      product.images.forEach(img => {
        const label = img.src.match(/camera_label=([^&]+)/)?.[1] || 'unknown'
        viewCounts.set(label, (viewCounts.get(label) || 0) + 1)
      })

      Array.from(viewCounts.entries()).forEach(([view, count]) => {
        console.log(`${view.padEnd(15)} - ${count} images`)
      })

      // Calculate unique colors with images
      console.log('\n' + '='.repeat(80))
      console.log('🎨 COLOR COVERAGE')
      console.log('='.repeat(80) + '\n')
      
      console.log(`Unique variants with mockups: ${imagesByVariant.size}`)
      console.log(`Total product variants: ${product.variants?.length || 0}`)
      
      // Map variant IDs to colors
      const variantIdToColor = new Map()
      if (product.variants) {
        product.variants.forEach(variant => {
          // Title format: "Color / Size"
          const parts = variant.title.split(' / ')
          const color = parts[0]
          variantIdToColor.set(variant.id, color)
        })
      }
      
      // Get unique colors that have mockups
      const colorsWithMockups = new Set()
      Array.from(imagesByVariant.keys()).forEach(variantId => {
        const color = variantIdToColor.get(variantId)
        if (color) {
          colorsWithMockups.add(color)
        }
      })
      
      console.log(`Colors with mockups: ${colorsWithMockups.size}`)
      console.log(`\nColors that have mockup images:`)
      Array.from(colorsWithMockups).sort().forEach((color, i) => {
        console.log(`  ${String(i + 1).padStart(2)}. ${color}`)
      })
      
      if (product.options) {
        const colorOption = product.options.find(opt => opt.type === 'color')
        if (colorOption) {
          console.log(`\nTotal colors in product: ${colorOption.values.length}`)
          console.log(`Coverage: ${Math.round((colorsWithMockups.size / colorOption.values.length) * 100)}%`)
        }
      }

    } else {
      console.log('⚠️  No images found in product')
    }

    console.log('\n' + '='.repeat(80))
    console.log('\n✅ Analysis complete!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProductImages()

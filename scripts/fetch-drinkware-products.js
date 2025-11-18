/**
 * Fetch drinkware products from Printify
 */

const fs = require('fs')
const path = require('path')

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

// Top drinkware blueprint IDs from catalog
const drinkwareIds = [
  { id: 535, name: '11oz White Mug (ORCA Coatings)' },
  { id: 68, name: 'Mug 11oz' },
  { id: 425, name: 'Mug 15oz' },
  { id: 353, name: 'Tumbler 20oz' },
  { id: 597, name: 'CamelBak Eddy Water Bottle' },
]

async function fetchDrinkware() {
  console.log('☕ DRINKWARE PRODUCTS\n')
  console.log('='.repeat(80) + '\n')
  
  for (const product of drinkwareIds) {
    try {
      console.log(`\n📦 ${product.name} (ID: ${product.id})`)
      
      const response = await fetch(`https://api.printify.com/v1/catalog/blueprints/${product.id}/print_providers.json`, {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      })
      
      if (!response.ok) continue
      
      const providers = await response.json()
      if (providers.length === 0) continue
      
      const provider = providers[0]
      console.log(`   Provider: ${provider.title}`)
      
      // Fetch variants
      const variantResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/${product.id}/print_providers/${provider.id}/variants.json`, {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      })
      
      if (!variantResponse.ok) continue
      
      const variantData = await variantResponse.json()
      const variants = variantData.variants || []
      
      console.log(`   Variants: ${variants.length}`)
      
      // Show first few variants as examples
      variants.slice(0, 3).forEach(v => {
        console.log(`     - ${v.title} (Variant ID: ${v.id})`)
      })
      
    } catch (error) {
      console.error(`   Error: ${error.message}`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n✅ Top picks for implementation:')
  console.log('1. 11oz White Mug (ORCA Coatings) - Blueprint 535')
  console.log('2. Mug 15oz - Blueprint 425')
  console.log('3. Tumbler 20oz - Blueprint 353')
  console.log('4. CamelBak Eddy Water Bottle - Blueprint 597\n')
}

fetchDrinkware()

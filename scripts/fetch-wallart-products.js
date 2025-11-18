/**
 * Fetch wall art products from Printify
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

// Top wall art blueprint IDs from catalog
const wallArtIds = [
  { id: 554, name: 'Paper Poster' },
  { id: 282, name: 'Matte Vertical Posters' },
  { id: 284, name: 'Matte Horizontal Posters' },
  { id: 555, name: 'Stretched Canvas' },
  { id: 540, name: 'Framed Vertical Posters' },
]

async function fetchWallArt() {
  console.log('🖼️  WALL ART PRODUCTS\n')
  console.log('='.repeat(80) + '\n')
  
  for (const product of wallArtIds) {
    try {
      console.log(`\n🎨 ${product.name} (ID: ${product.id})`)
      
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
      
      // Show first few variant titles
      console.log(`   Sample sizes:`)
      variants.slice(0, 5).forEach(v => {
        console.log(`     - ${v.title}`)
      })
      
    } catch (error) {
      console.error(`   Error: ${error.message}`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\n✅ Top picks for implementation:')
  console.log('1. Paper Poster - Blueprint 554 (Museum-grade, 200gsm)')
  console.log('2. Matte Vertical Posters - Blueprint 282 (46 sizes)')
  console.log('3. Stretched Canvas - Blueprint 555 (Cotton fabric, wooden frame)')
  console.log('4. Framed Vertical Posters - Blueprint 540 (Black/Walnut/White frames)\n')
}

fetchWallArt()

/**
 * Fetch Printify catalog to see available products
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

async function fetchCatalog() {
  try {
    console.log('📚 Fetching Printify catalog...\n')

    const response = await fetch('https://api.printify.com/v1/catalog/blueprints.json', {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error:', error)
      return
    }

    const blueprints = await response.json()
    
    // Filter for relevant products
    const tshirts = blueprints.filter(b => 
      b.title.toLowerCase().includes('t-shirt') || 
      b.title.toLowerCase().includes('tee')
    )
    
    const drinkware = blueprints.filter(b => 
      b.title.toLowerCase().includes('mug') || 
      b.title.toLowerCase().includes('tumbler') || 
      b.title.toLowerCase().includes('bottle')
    )
    
    const wallArt = blueprints.filter(b => 
      b.title.toLowerCase().includes('poster') || 
      b.title.toLowerCase().includes('canvas') || 
      b.title.toLowerCase().includes('print') ||
      b.title.toLowerCase().includes('wall')
    )

    console.log('👕 T-SHIRTS:')
    console.log('='.repeat(80))
    tshirts.forEach(t => {
      console.log(`ID: ${t.id} - ${t.title}`)
      console.log(`   Brand: ${t.brand} | Model: ${t.model}`)
      console.log(`   Description: ${t.description}`)
      console.log()
    })

    console.log('\n☕ DRINKWARE:')
    console.log('='.repeat(80))
    drinkware.forEach(d => {
      console.log(`ID: ${d.id} - ${d.title}`)
      console.log(`   Brand: ${d.brand} | Model: ${d.model}`)
      console.log(`   Description: ${d.description}`)
      console.log()
    })

    console.log('\n🖼️  WALL ART:')
    console.log('='.repeat(80))
    wallArt.forEach(w => {
      console.log(`ID: ${w.id} - ${w.title}`)
      console.log(`   Brand: ${w.brand} | Model: ${w.model}`)
      console.log(`   Description: ${w.description}`)
      console.log()
    })

    // Now fetch variants for the main t-shirt blueprint (12)
    console.log('\n\n🎨 T-SHIRT COLORS (Blueprint 12 - Bella+Canvas 3001):')
    console.log('='.repeat(80))
    
    const variantsResponse = await fetch('https://api.printify.com/v1/catalog/blueprints/12.json', {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    if (variantsResponse.ok) {
      const blueprintData = await variantsResponse.json()
      const variants = blueprintData.variants || []
      
      // Group by color
      const colorMap = new Map()
      variants.forEach(v => {
        const colorName = v.title.split(' / ')[0] // "White / S" -> "White"
        if (!colorMap.has(colorName)) {
          colorMap.set(colorName, v.id)
        }
      })
      
      console.log('Available colors:')
      Array.from(colorMap.entries()).forEach(([color, variantId]) => {
        console.log(`  ${color} - Variant ID: ${variantId}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

fetchCatalog()

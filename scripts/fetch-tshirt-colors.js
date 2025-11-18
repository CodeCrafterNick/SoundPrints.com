/**
 * Fetch t-shirt color options from Printify
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

async function fetchTShirtColors() {
  try {
    console.log('📚 Fetching Bella+Canvas 3001 print providers...\n')

    const response = await fetch('https://api.printify.com/v1/catalog/blueprints/12/print_providers.json', {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error:', error)
      return
    }

    const providers = await response.json()
    
    console.log('Print Providers:', providers.length)
    
    // Get first provider's variants
    if (providers.length > 0) {
      const provider = providers[0]
      console.log('\nProvider:', provider.title)
      console.log('Provider ID:', provider.id)
      
      // Now fetch variants for this provider
      console.log('\n📚 Fetching variants...\n')
      
      const variantResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/12/print_providers/${provider.id}/variants.json`, {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      })
      
      if (!variantResponse.ok) {
        const error = await variantResponse.text()
        console.error('Error fetching variants:', error)
        return
      }
      
      const variantData = await variantResponse.json()
      const variants = variantData.variants || []
      
      console.log(`Found ${variants.length} total variants\n`)
      
      // Get unique colors
      const colorMap = new Map()
      
      variants.forEach(v => {
        // Title format: "Color / Size"
        const parts = v.title.split(' / ')
        const colorName = parts[0]
        
        if (!colorMap.has(colorName)) {
          colorMap.set(colorName, {
            colorName: colorName,
            exampleVariantId: v.id,
            sizes: []
          })
        }
        
        colorMap.get(colorName).sizes.push({
          size: parts[1],
          variantId: v.id
        })
      })
      
      console.log(`Unique colors: ${colorMap.size}\n`)
      console.log('='.repeat(80) + '\n')
      
      // Sort alphabetically and display
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
      
      sortedColors.forEach(([colorName, data]) => {
        const sizes = data.sizes.map(s => s.size).join(', ')
        console.log(`${colorName.padEnd(35)} - ${data.sizes.length} sizes: ${sizes}`)
      })
      
      // Create TypeScript enum
      console.log('\n\n' + '='.repeat(80))
      console.log('TypeScript Color Options:')
      console.log('='.repeat(80) + '\n')
      
      sortedColors.forEach(([colorName, data]) => {
        const enumKey = colorName.toUpperCase().replace(/[ -]/g, '_')
        console.log(`  ${enumKey}: '${colorName}',`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fetchTShirtColors()

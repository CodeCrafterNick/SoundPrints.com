/**
 * Download mockup images from the test product
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const mockupUrls = [
  'https://images-api.printify.com/mockup/6918f653c52e8248460e3211/18542/92547/soundwave-test-product.jpg?camera_label=front',
  'https://images-api.printify.com/mockup/6918f653c52e8248460e3211/18542/92720/soundwave-test-product.jpg?camera_label=back',
  'https://images-api.printify.com/mockup/6918f653c52e8248460e3211/18542/102044/soundwave-test-product.jpg?camera_label=front-2',
  'https://images-api.printify.com/mockup/6918f653c52e8248460e3211/18542/102045/soundwave-test-product.jpg?camera_label=back-2'
]

const outputDir = path.join(__dirname, '..', 'public', 'mockups', 'soundwave-test')

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(outputDir, filename)
    const file = fs.createWriteStream(filepath)
    
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        console.log(`✅ Downloaded: ${filename}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

async function downloadAll() {
  console.log('📥 Downloading mockup images...\n')
  
  for (let i = 0; i < mockupUrls.length; i++) {
    const label = mockupUrls[i].match(/camera_label=([^&]+)/)[1]
    await downloadImage(mockupUrls[i], `${i + 1}-${label}.jpg`)
  }
  
  console.log(`\n✅ All images downloaded to: ${outputDir}\n`)
}

downloadAll()

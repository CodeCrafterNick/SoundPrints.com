// Test if the Supabase audio URL is accessible
const audioUrl = 'https://yieyrckshdjulcypmrid.supabase.co/storage/v1/object/public/audio-files/1763002172063-n663yv.mp3'

console.log('Testing audio URL:', audioUrl)

fetch(audioUrl, { method: 'HEAD' })
  .then(response => {
    console.log('Status:', response.status)
    console.log('Headers:')
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
    
    if (response.ok) {
      console.log('\n✓ Audio URL is accessible')
    } else {
      console.log('\n✗ Audio URL returned error status')
    }
  })
  .catch(error => {
    console.error('✗ Error accessing audio URL:', error.message)
  })

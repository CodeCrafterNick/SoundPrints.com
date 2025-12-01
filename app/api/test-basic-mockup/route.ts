import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const startTime = Date.now()

    // Simple mockup generation using basic overlay
    // This demonstrates a basic approach without displacement maps
    
    // Create a simple colored background (representing a t-shirt)
    const colors = [
      { name: 'Black T-Shirt', color: { r: 0, g: 0, b: 0 } },
      { name: 'White T-Shirt', color: { r: 255, g: 255, b: 255 } },
      { name: 'Navy T-Shirt', color: { r: 0, g: 31, b: 63 } },
    ]

    const mockups = await Promise.all(
      colors.map(async ({ name, color }) => {
        try {
          // Resize design to fit mockup area (simulated print area)
          const resizedDesign = await sharp(buffer)
            .resize(400, 400, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toBuffer()

          // Create base mockup (solid color background)
          const baseMockup = await sharp({
            create: {
              width: 600,
              height: 800,
              channels: 4,
              background: color
            }
          })
            .png()
            .toBuffer()

          // Composite design onto mockup
          const mockupBuffer = await sharp(baseMockup)
            .composite([
              {
                input: resizedDesign,
                top: 200, // Position from top
                left: 100, // Position from left
                blend: 'over'
              }
            ])
            .png()
            .toBuffer()

          // Convert to base64 data URL
          const base64 = mockupBuffer.toString('base64')
          const dataUrl = `data:image/png;base64,${base64}`

          return {
            name,
            url: dataUrl,
            renderTime: Date.now() - startTime
          }
        } catch (error) {
          console.error(`Error generating mockup for ${name}:`, error)
          return null
        }
      })
    )

    const successfulMockups = mockups.filter(m => m !== null)

    return NextResponse.json({
      success: true,
      mockups: successfulMockups,
      totalTime: Date.now() - startTime
    })
  } catch (error) {
    console.error('Error in test-basic-mockup:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

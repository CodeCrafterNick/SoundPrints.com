import { NextRequest, NextResponse } from 'next/server'
import { maskBasedGenerator } from '@/lib/displacement/mask-generator'

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

    // Test template IDs (t-shirt front black, t-shirt front white)
    const templateIds = ['tshirt-front-black', 'tshirt-front-white']
    
    const mockups = await Promise.all(
      templateIds.map(async (templateId) => {
        try {
          const mockupBuffer = await maskBasedGenerator.generate({
            templateId,
            designBuffer: buffer,
            config: {
              brightness: 0.92,
              blendMode: 'multiply',
              textureOverlay: true,
              textureOpacity: 0.15,
            },
            outputFormat: 'png',
            outputQuality: 90
          })

          // Convert buffer to base64 data URL
          const base64 = mockupBuffer.toString('base64')
          const dataUrl = `data:image/png;base64,${base64}`

          return {
            templateId,
            name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            url: dataUrl,
            renderTime: Date.now() - startTime
          }
        } catch (error) {
          console.error(`Error generating mockup for ${templateId}:`, error)
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
    console.error('Error in test-displacement-mockup:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

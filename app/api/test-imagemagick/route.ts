import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  let tempInputPath: string | null = null
  let tempOutputPath: string | null = null

  try {
    // Check if ImageMagick is installed
    let version = ''
    let installed = false

    try {
      const { stdout } = await execAsync('magick -version')
      version = stdout.split('\n')[0]
      installed = true
    } catch (error) {
      // Try older 'convert' command
      try {
        const { stdout } = await execAsync('convert -version')
        version = stdout.split('\n')[0]
        installed = true
      } catch (err) {
        return NextResponse.json({
          success: false,
          installed: false,
          error: 'ImageMagick not found. Install with: brew install imagemagick'
        })
      }
    }

    // Get uploaded image
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({
        success: false,
        installed,
        version,
        error: 'No image provided'
      })
    }

    // Save image to temp file
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    tempInputPath = path.join(os.tmpdir(), `test-input-${Date.now()}.png`)
    tempOutputPath = path.join(os.tmpdir(), `test-output-${Date.now()}.png`)
    
    await writeFile(tempInputPath, buffer)

    // Test basic ImageMagick operations
    const capabilities = []

    // Test 1: Resize
    try {
      await execAsync(`magick "${tempInputPath}" -resize 400x400 "${tempOutputPath}"`)
      capabilities.push('Resize/Scale')
    } catch (err) {
      capabilities.push('Resize: FAILED')
    }

    // Test 2: Add border
    try {
      await execAsync(`magick "${tempInputPath}" -bordercolor black -border 10 "${tempOutputPath}"`)
      capabilities.push('Border/Frame')
    } catch (err) {
      capabilities.push('Border: FAILED')
    }

    // Test 3: Colorspace
    try {
      await execAsync(`magick "${tempInputPath}" -colorspace Gray "${tempOutputPath}"`)
      capabilities.push('Colorspace Conversion')
    } catch (err) {
      capabilities.push('Colorspace: FAILED')
    }

    // Test 4: Composite (basic overlay)
    try {
      await execAsync(`magick "${tempInputPath}" -gravity center -background white -extent 600x600 "${tempOutputPath}"`)
      capabilities.push('Composite/Overlay')
    } catch (err) {
      capabilities.push('Composite: FAILED')
    }

    // Test 5: Distort (for displacement maps)
    try {
      await execAsync(`magick "${tempInputPath}" -virtual-pixel transparent +distort Perspective '0,0 0,0' "${tempOutputPath}"`)
      capabilities.push('Perspective Distortion')
    } catch (err) {
      capabilities.push('Distortion: FAILED')
    }

    // Read the final test output
    const fs = require('fs')
    const outputBuffer = fs.readFileSync(tempOutputPath)
    const base64 = outputBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    // Cleanup temp files
    await unlink(tempInputPath)
    await unlink(tempOutputPath)

    return NextResponse.json({
      success: true,
      installed,
      version,
      capabilities,
      testImage: dataUrl,
      message: 'ImageMagick is working correctly!'
    })

  } catch (error) {
    // Cleanup temp files on error
    if (tempInputPath) {
      try { await unlink(tempInputPath) } catch (e) {}
    }
    if (tempOutputPath) {
      try { await unlink(tempOutputPath) } catch (e) {}
    }

    console.error('Error testing ImageMagick:', error)
    return NextResponse.json(
      { 
        success: false,
        installed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

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
    const designBuffer = Buffer.from(bytes)

    const startTime = Date.now()

    // Different canvas orientations with 3D perspective
    const scenes = [
      {
        name: 'Angled Canvas - Left View',
        size: '24" × 36" Canvas',
        wallColor: { r: 240, g: 240, b: 240 },
        canvasWidth: 700,
        canvasHeight: 1000,
        angle: -15, // degrees
        perspective: true,
        depthEffect: 0.15
      },
      {
        name: 'Angled Canvas - Right View',
        size: '30" × 40" Canvas',
        wallColor: { r: 235, g: 235, b: 235 },
        canvasWidth: 750,
        canvasHeight: 1000,
        angle: 12,
        perspective: true,
        depthEffect: 0.18
      },
      {
        name: 'Straight Canvas - Front View',
        size: '18" × 24" Canvas',
        wallColor: { r: 245, g: 245, b: 245 },
        canvasWidth: 600,
        canvasHeight: 800,
        angle: 0,
        perspective: false,
        depthEffect: 0.1
      },
      {
        name: 'Dramatic Angle - Side View',
        size: '20" × 30" Canvas',
        wallColor: { r: 230, g: 230, b: 230 },
        canvasWidth: 650,
        canvasHeight: 950,
        angle: 20,
        perspective: true,
        depthEffect: 0.25
      }
    ]

    const mockups = await Promise.all(
      scenes.map(async (scene) => {
        try {
          // Calculate canvas dimensions with padding
          const padding = 30
          const canvasContentWidth = scene.canvasWidth - padding * 2
          const canvasContentHeight = scene.canvasHeight - padding * 2

          // Resize design to fit canvas
          const resizedDesign = await sharp(designBuffer)
            .resize(canvasContentWidth, canvasContentHeight, {
              fit: 'inside',
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toBuffer()

          // Get actual dimensions
          const designMeta = await sharp(resizedDesign).metadata()
          const designWidth = designMeta.width || canvasContentWidth
          const designHeight = designMeta.height || canvasContentHeight

          // Create white canvas background
          const canvasBg = await sharp({
            create: {
              width: scene.canvasWidth,
              height: scene.canvasHeight,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
          }).png().toBuffer()

          // Center design on canvas
          const designX = Math.floor((scene.canvasWidth - designWidth) / 2)
          const designY = Math.floor((scene.canvasHeight - designHeight) / 2)

          // Composite design onto canvas
          const canvas = await sharp(canvasBg)
            .composite([{
              input: resizedDesign,
              top: designY,
              left: designX
            }])
            .png()
            .toBuffer()

          // Apply perspective transformation if needed
          let transformedCanvas = canvas
          let finalWidth = scene.canvasWidth
          let finalHeight = scene.canvasHeight

          if (scene.perspective && scene.angle !== 0) {
            try {
              // Use ImageMagick for proper perspective transform
              const tempInput = join(tmpdir(), `canvas-${Date.now()}-${Math.random()}.png`)
              const tempOutput = join(tmpdir(), `canvas-perspective-${Date.now()}-${Math.random()}.png`)

              await writeFile(tempInput, canvas)

              // Calculate perspective control points based on angle
              const w = scene.canvasWidth
              const h = scene.canvasHeight
              const angleRad = (scene.angle * Math.PI) / 180
              
              // Perspective depth (how much the far edge shrinks)
              const depthFactor = scene.depthEffect
              
              let sourcePoints: string
              let destPoints: string

              if (scene.angle > 0) {
                // Rotating right - right edge goes back
                const rightShrink = Math.floor(h * depthFactor)
                sourcePoints = `0,0 ${w},0 ${w},${h} 0,${h}`
                destPoints = `0,0 ${w},${rightShrink} ${w},${h - rightShrink} 0,${h}`
              } else {
                // Rotating left - left edge goes back
                const leftShrink = Math.floor(h * depthFactor)
                sourcePoints = `0,0 ${w},0 ${w},${h} 0,${h}`
                destPoints = `0,${leftShrink} ${w},0 ${w},${h} 0,${h - leftShrink}`
              }

              // Apply perspective distortion with ImageMagick
              const magickCmd = `magick "${tempInput}" -matte -virtual-pixel transparent -distort Perspective "${sourcePoints} ${destPoints}" "${tempOutput}"`
              
              await execAsync(magickCmd)

              // Read the transformed image
              transformedCanvas = await sharp(tempOutput).toBuffer()
              const transformedMeta = await sharp(transformedCanvas).metadata()
              finalWidth = transformedMeta.width || finalWidth
              finalHeight = transformedMeta.height || finalHeight

              // Cleanup temp files
              await unlink(tempInput).catch(() => {})
              await unlink(tempOutput).catch(() => {})

              // Add canvas depth/edge
              const edgeWidth = Math.floor(30 * Math.abs(Math.sin(angleRad)))
              const edgeDepth = Math.floor(h * depthFactor / 2)
              
              if (edgeWidth > 5) {
                // Create gradient for depth edge
                const edgeColor = scene.angle > 0 
                  ? { r: 220, g: 220, b: 220 } 
                  : { r: 180, g: 180, b: 180 }

                const edge = await sharp({
                  create: {
                    width: edgeWidth,
                    height: finalHeight,
                    channels: 4,
                    background: { ...edgeColor, alpha: 1 }
                  }
                })
                  .linear(0.7, 30) // Darken slightly for depth
                  .png()
                  .toBuffer()

                // Combine canvas with edge
                const canvasWithEdge = await sharp({
                  create: {
                    width: finalWidth + edgeWidth,
                    height: finalHeight,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                  }
                })
                  .composite([
                    scene.angle > 0 
                      ? { input: transformedCanvas, left: 0, top: 0 }
                      : { input: transformedCanvas, left: edgeWidth, top: 0 },
                    scene.angle > 0
                      ? { input: edge, left: finalWidth, top: 0 }
                      : { input: edge, left: 0, top: 0 }
                  ])
                  .png()
                  .toBuffer()

                transformedCanvas = canvasWithEdge
                finalWidth += edgeWidth
              }
            } catch (magickError) {
              console.warn('ImageMagick perspective failed, using fallback:', magickError)
              // Fallback to simple scaling if ImageMagick not available
              const widthScale = Math.cos((Math.abs(scene.angle) * Math.PI) / 180)
              finalWidth = Math.floor(scene.canvasWidth * widthScale)
              transformedCanvas = await sharp(canvas)
                .resize(finalWidth, finalHeight, { fit: 'fill' })
                .toBuffer()
            }
          }

          // Create shadow
          const shadowBlur = 25
          const shadowOffsetX = scene.angle > 0 ? 20 : -20
          const shadowOffsetY = 15
          const shadowIntensity = 0.3

          const shadowWidth = finalWidth + shadowBlur * 3
          const shadowHeight = finalHeight + shadowBlur * 3

          const shadowBase = await sharp({
            create: {
              width: shadowWidth,
              height: shadowHeight,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: shadowIntensity }
            }
          })
            .blur(shadowBlur)
            .png()
            .toBuffer()

          // Create room wall
          const roomWidth = 1600
          const roomHeight = 1200

          const wall = await sharp({
            create: {
              width: roomWidth,
              height: roomHeight,
              channels: 4,
              background: scene.wallColor
            }
          }).png().toBuffer()

          // Position elements
          const canvasX = Math.floor((roomWidth - finalWidth) / 2)
          const canvasY = Math.floor((roomHeight - finalHeight) / 2) - 50

          const shadowX = canvasX - shadowBlur + shadowOffsetX
          const shadowY = canvasY - shadowBlur + shadowOffsetY

          // Composite onto wall
          const roomMockup = await sharp(wall)
            .composite([
              {
                input: shadowBase,
                top: shadowY,
                left: shadowX,
                blend: 'over'
              },
              {
                input: transformedCanvas,
                top: canvasY,
                left: canvasX,
                blend: 'over'
              }
            ])
            .jpeg({ quality: 92 })
            .toBuffer()

          // Convert to base64 data URL
          const base64 = roomMockup.toString('base64')
          const dataUrl = `data:image/jpeg;base64,${base64}`

          return {
            name: scene.name,
            size: scene.size,
            url: dataUrl,
            renderTime: Date.now() - startTime
          }
        } catch (error) {
          console.error(`Error generating mockup for ${scene.name}:`, error)
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
    console.error('Error in test-wall-mockup:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

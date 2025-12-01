import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import sharp from 'sharp'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const orientation = formData.get('orientation') as string || 'both'
    const fitMode = (formData.get('fitMode') as string || 'cover') as 'inside' | 'cover'
    const focalX = parseFloat(formData.get('focalX') as string || '0.5')
    const focalY = parseFloat(formData.get('focalY') as string || '0.5')

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer()
    const designBuffer = Buffer.from(bytes)

    console.log('Mockup settings:', { orientation, fitMode, focalPoint: { x: focalX, y: focalY } })

    const startTime = Date.now()

    // PSD templates to test
    const allTemplates = [
      {
        name: 'iPad Mockup',
        psdPath: join(process.cwd(), 'public/mockups/wall-art/ipad.psd'),
        orientation: 'portrait',
        canvasSize: { width: 5000, height: 3125 },
        // Layer structure: [0]=Refl (full canvas), [1]=DESIGN (full canvas), [2]=Base (full canvas)
        // Method: Extract base layer, add design, then reflection on top
        method: 'layerByLayer',
        designBounds: { x: 1551, y: 557, width: 2715, height: 1869 },
        maskBounds: { x: 1551, y: 557, width: 2715, height: 1869 },
        baseLayerIndex: 2,
        reflLayerIndex: 0,
        designLayerIndex: 1
      },
      {
        name: 'Landscape Canvas',
        psdPath: join(process.cwd(), 'public/mockups/wall-art/Poster/Landscape.psd'),
        orientation: 'landscape',
        canvasSize: { width: 5000, height: 3000 },
        // Layer structure: [0]=Refl (full canvas), [1]=DESIGN (full canvas), [2]=Base (cropped to design area)
        // Method: Delete DESIGN layer and flatten (simpler for this structure)
        method: 'deleteLayer',
        designBounds: { x: 1902, y: 323, width: 1274, height: 1063 },
        maskBounds: { x: 1902, y: 323, width: 1274, height: 1063 },
        baseLayerIndex: 2,
        reflLayerIndex: 0,
        designLayerIndex: 1
      },
      {
        name: 'Long Sleeve Shirt',
        psdPath: join(process.cwd(), 'public/mockups/wall-art/long-sleeve.psd'),
        orientation: 'square',
        canvasSize: { width: 625, height: 689 },
        // Layer structure: [0]=Composite, [1]=Base, [2]=Design (240x246 at 258,184 with mask), [3]=Shadow
        // Method: Custom masked layer - extract mask from layer 2, apply to design, composite Base+Design+Shadow
        method: 'maskedLayer',
        designBounds: { x: 258, y: 184, width: 240, height: 246 },
        maskBounds: { x: 258, y: 184, width: 240, height: 246 },
        baseLayerIndex: 1,
        maskLayerIndex: 2,
        shadowLayerIndex: 3
      },
      {
        name: '24x36 Canvas Angled',
        psdPath: join(process.cwd(), 'public/mockups/wall-art/24x36-blank-canvas-angled.psd'),
        orientation: 'portrait',
        canvasSize: { width: 2000, height: 2000 },
        // Layer structure: [0]=Composite, [1]=Base (2005x2005), [2]=Design (1339x1177 at 297,412), [3]=Overlay/Shadow
        // Method: Delete layer - delete Design layer and composite user design
        method: 'deleteLayer',
        designBounds: { x: 297, y: 412, width: 1339, height: 1177 },
        maskBounds: { x: 297, y: 412, width: 1339, height: 1177 },
        baseLayerIndex: 1,
        reflLayerIndex: 3,
        designLayerIndex: 2
      }
    ]

    // Filter templates based on orientation
    const templates = orientation === 'both' 
      ? allTemplates 
      : allTemplates.filter(t => t.orientation === orientation)
    
    console.log(`Processing ${templates.length} templates for orientation: ${orientation}`)
    templates.forEach(t => console.log(`  - ${t.name} (${t.orientation})`))

    // Process all templates in parallel
    const mockups = await Promise.all(
      templates.map(async (template) => {
        const templateStartTime = Date.now()
        
        try {
          // Create temp files
          const tempDesign = join(tmpdir(), `design-${Date.now()}-${Math.random()}.png`)
          const tempOutput = join(tmpdir(), `mockup-${Date.now()}-${Math.random()}.png`)

          // Save design to temp file
          await writeFile(tempDesign, designBuffer)

          // Check if ImageMagick is available
          let hasMagick = false
          try {
            await execAsync('magick -version')
            hasMagick = true
          } catch {
            try {
              await execAsync('convert -version')
              hasMagick = true
            } catch {
              console.warn('ImageMagick not found, using Sharp fallback')
            }
          }

          let outputBuffer: Buffer

          if (hasMagick) {
            // Use ImageMagick to composite design into PSD layers
            
            const magickCmd = process.platform === 'darwin' 
              ? 'magick' 
              : 'convert'

            try {
              const psdWidth = template.canvasSize?.width || 5000
              const psdHeight = template.canvasSize?.height || 3000
              
              // Prepare design sized to screen area
              const maskX = template.maskBounds?.x || 1551
              const maskY = template.maskBounds?.y || 557
              const maskWidth = template.maskBounds?.width || 2715
              const maskHeight = template.maskBounds?.height || 1869
              
              // Calculate gravity based on focal point
              let gravity: string = 'centre'
              if (fitMode === 'cover') {
                if (focalY < 0.33) gravity = focalX < 0.33 ? 'northwest' : focalX > 0.66 ? 'northeast' : 'north'
                else if (focalY > 0.66) gravity = focalX < 0.33 ? 'southwest' : focalX > 0.66 ? 'southeast' : 'south'
                else gravity = focalX < 0.33 ? 'west' : focalX > 0.66 ? 'east' : 'centre'
              }
              
              const resizedDesign = await sharp(designBuffer)
                .resize(maskWidth, maskHeight, {
                  fit: fitMode,
                  position: gravity,
                  background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .toBuffer()

              const designMeta = await sharp(resizedDesign).metadata()
              const finalDesignWidth = designMeta.width || maskWidth
              const finalDesignHeight = designMeta.height || maskHeight

              // Center within screen area
              const designOffsetX = maskX + Math.floor((maskWidth - finalDesignWidth) / 2)
              const designOffsetY = maskY + Math.floor((maskHeight - finalDesignHeight) / 2)

              let finalComposite: Buffer

              if (template.method === 'maskedLayer') {
                // Long Sleeve method: Extract mask from layer 2, apply to design
                console.log(`${template.name}: Masked layer method`)
                
                // Step 1: Extract Base layer and extend to full canvas
                const tempBase = join(tmpdir(), `base-${Date.now()}.png`)
                const baseLayerIndex = template.baseLayerIndex || 1
                await execAsync(
                  `${magickCmd} "${template.psdPath}[${baseLayerIndex}]" -background transparent -flatten -gravity northwest -extent ${psdWidth}x${psdHeight} "${tempBase}"`
                )
                
                // Step 2: Extract mask from Design layer (layer 2)
                const tempMask = join(tmpdir(), `mask-${Date.now()}.png`)
                const maskLayerIndex = template.maskLayerIndex || 2
                await execAsync(
                  `${magickCmd} "${template.psdPath}[${maskLayerIndex}]" -alpha extract "${tempMask}"`
                )
                
                // Step 3: Apply mask to user design
                const tempDesignResized = join(tmpdir(), `design-resized-${Date.now()}.png`)
                await writeFile(tempDesignResized, resizedDesign)
                
                const tempDesignMasked = join(tmpdir(), `design-masked-${Date.now()}.png`)
                await execAsync(
                  `${magickCmd} "${tempDesignResized}" "${tempMask}" -compose CopyOpacity -composite "${tempDesignMasked}"`
                )
                
                // Step 4: Position masked design on canvas
                const tempDesignPositioned = join(tmpdir(), `design-positioned-${Date.now()}.png`)
                await execAsync(
                  `${magickCmd} "${tempDesignMasked}" -background transparent -gravity northwest -extent ${psdWidth}x${psdHeight} -page +${maskX}+${maskY} -flatten "${tempDesignPositioned}"`
                )
                
                // Step 5: Extract Shadow layer
                const tempShadow = join(tmpdir(), `shadow-${Date.now()}.png`)
                const shadowLayerIndex = template.shadowLayerIndex || 3
                await execAsync(
                  `${magickCmd} "${template.psdPath}[${shadowLayerIndex}]" "${tempShadow}"`
                )
                
                // Step 6: Composite Base + Design + Shadow (multiply blend)
                const withDesign = await sharp(tempBase)
                  .composite([{
                    input: tempDesignPositioned,
                    left: 0,
                    top: 0
                  }])
                  .toBuffer()
                
                finalComposite = await sharp(withDesign)
                  .composite([{
                    input: tempShadow,
                    left: 0,
                    top: 0,
                    blend: 'multiply'
                  }])
                  .toBuffer()
                
                // Cleanup temp files
                await unlink(tempBase).catch(() => {})
                await unlink(tempMask).catch(() => {})
                await unlink(tempDesignResized).catch(() => {})
                await unlink(tempDesignMasked).catch(() => {})
                await unlink(tempDesignPositioned).catch(() => {})
                await unlink(tempShadow).catch(() => {})
                
              } else if (template.method === 'deleteLayer') {
                // Landscape method: Delete DESIGN layer and flatten
                console.log(`${template.name}: Delete DESIGN layer method`)
                
                const tempBase = join(tmpdir(), `base-${Date.now()}.png`)
                const designLayerIndex = template.designLayerIndex || 1
                await execAsync(
                  `${magickCmd} "${template.psdPath}" -delete ${designLayerIndex} -flatten "${tempBase}"`
                )

                // Composite design
                finalComposite = await sharp(tempBase)
                  .composite([{
                    input: resizedDesign,
                    left: designOffsetX,
                    top: designOffsetY
                  }])
                  .toBuffer()

                await unlink(tempBase).catch(() => {})

              } else {
                // iPad method: Layer by layer (Base + Design + Reflection)
                console.log(`${template.name}: Layer by layer method`)
                
                // Step 1: Extract ONLY Base layer and extend to full canvas
                const tempBase = join(tmpdir(), `base-${Date.now()}.png`)
                const baseLayerIndex = template.baseLayerIndex || 2
                await execAsync(
                  `${magickCmd} "${template.psdPath}[${baseLayerIndex}]" -background white -flatten -gravity northwest -extent ${psdWidth}x${psdHeight} "${tempBase}"`
                )

                // Step 2: Composite design on base
                const withDesign = await sharp(tempBase)
                  .composite([{
                    input: resizedDesign,
                    left: designOffsetX,
                    top: designOffsetY
                  }])
                  .toBuffer()

                // Step 3: Extract Reflection layer and composite on top
                const tempRefl = join(tmpdir(), `refl-${Date.now()}.png`)
                const reflLayerIndex = template.reflLayerIndex || 0
                await execAsync(
                  `${magickCmd} "${template.psdPath}[${reflLayerIndex}]" "${tempRefl}"`
                )

                finalComposite = await sharp(withDesign)
                  .composite([{
                    input: tempRefl,
                    left: 0,
                    top: 0
                  }])
                  .toBuffer()

                await unlink(tempBase).catch(() => {})
                await unlink(tempRefl).catch(() => {})
              }

              const tempOutput2 = join(tmpdir(), `output-${Date.now()}.png`)
              await writeFile(tempOutput2, finalComposite)

              // Step 5: Final resize
              const outputMeta = await sharp(tempOutput2).metadata()
              const aspectRatio = (outputMeta.width || psdWidth) / (outputMeta.height || psdHeight)
              
              let finalWidth = 1600
              let finalHeight = Math.round(finalWidth / aspectRatio)
              
              outputBuffer = await sharp(tempOutput2)
                .resize(finalWidth, finalHeight, { fit: 'inside' })
                .jpeg({ quality: 92 })
                .toBuffer()

              // Cleanup
              await unlink(tempOutput2).catch(() => {})
            } catch (magickError) {
              console.warn('Smart object replacement failed, using fallback:', magickError)
              
              // Fallback: simple flatten and composite
              const tempPsdFlat = join(tmpdir(), `psd-flat-fallback-${Date.now()}.png`)
              await execAsync(`${magickCmd} "${template.psdPath}[0]" "${tempPsdFlat}"`)

              const psdInfo = await sharp(tempPsdFlat).metadata()

              const canvasAreaX = template.maskBounds?.x || template.designBounds?.x || 0
              const canvasAreaY = template.maskBounds?.y || template.designBounds?.y || 0
              const canvasAreaWidth = template.maskBounds?.width || template.designBounds?.width || 2000
              const canvasAreaHeight = template.maskBounds?.height || template.designBounds?.height || 1500

              const resizedDesignFallback = await sharp(designBuffer)
                .resize(canvasAreaWidth, canvasAreaHeight, {
                  fit: 'inside',
                  background: { r: 255, g: 255, b: 255, alpha: 1 }
                })
                .toBuffer()

              const designMeta = await sharp(resizedDesignFallback).metadata()
              const finalDesignWidth = designMeta.width || canvasAreaWidth
              const finalDesignHeight = designMeta.height || canvasAreaHeight

              const designOffsetX = canvasAreaX + Math.floor((canvasAreaWidth - finalDesignWidth) / 2)
              const designOffsetY = canvasAreaY + Math.floor((canvasAreaHeight - finalDesignHeight) / 2)

              const tempResizedFallback = join(tmpdir(), `design-resized-fallback-${Date.now()}.png`)
              await writeFile(tempResizedFallback, resizedDesignFallback)

              await execAsync(
                `${magickCmd} "${tempPsdFlat}" "${tempResizedFallback}" -geometry +${designOffsetX}+${designOffsetY} -composite "${tempOutput}"`
              )

              outputBuffer = await sharp(tempOutput)
                .resize(1600, null, { fit: 'inside' })
                .jpeg({ quality: 92 })
                .toBuffer()

              await unlink(tempPsdFlat).catch(() => {})
              await unlink(tempResizedFallback).catch(() => {})
            }
          } else {
            // Fallback: Use Sharp to flatten PSD and composite
            // Note: Sharp can read PSDs but not smart objects
            const psdBuffer = await readFile(template.psdPath)
            const psdFlat = await sharp(psdBuffer, { density: 150 })
              .flatten({ background: { r: 255, g: 255, b: 255 } })
              .toBuffer()

            const psdMeta = await sharp(psdFlat).metadata()
            const psdWidth = psdMeta.width || 5000
            const psdHeight = psdMeta.height || 3000

            // Use mask bounds for the actual visible canvas area
            let canvasAreaX, canvasAreaY, canvasAreaWidth, canvasAreaHeight
            
            if (template.maskBounds) {
              // Use the MASK layer dimensions - this is the exact visible area
              canvasAreaX = template.maskBounds.x
              canvasAreaY = template.maskBounds.y
              canvasAreaWidth = template.maskBounds.width
              canvasAreaHeight = template.maskBounds.height
            } else if (template.designBounds) {
              // Fallback to DESIGN layer if no mask
              canvasAreaX = template.designBounds.x
              canvasAreaY = Math.max(0, template.designBounds.y)
              canvasAreaWidth = template.designBounds.width
              canvasAreaHeight = template.designBounds.height
            } else {
              // Last resort: Calculate the canvas/frame area
              const frameMargin = 0.15
              canvasAreaWidth = Math.floor(psdWidth * (1 - frameMargin * 2))
              canvasAreaHeight = Math.floor(psdHeight * (1 - frameMargin * 2))
              canvasAreaX = Math.floor(psdWidth * frameMargin)
              canvasAreaY = Math.floor(psdHeight * frameMargin)
            }

            // Resize design to fit within the canvas area exactly
            const resizedDesign = await sharp(designBuffer)
              .resize(canvasAreaWidth, canvasAreaHeight, {
                fit: 'inside',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
              })
              .toBuffer()

            const designMeta = await sharp(resizedDesign).metadata()
            const finalDesignWidth = designMeta.width || canvasAreaWidth
            const finalDesignHeight = designMeta.height || canvasAreaHeight

            // Center design within the canvas area
            const designOffsetX = canvasAreaX + Math.floor((canvasAreaWidth - finalDesignWidth) / 2)
            const designOffsetY = canvasAreaY + Math.floor((canvasAreaHeight - finalDesignHeight) / 2)

            const offsetX = designOffsetX
            const offsetY = designOffsetY

            // Composite
            outputBuffer = await sharp(psdFlat)
              .composite([{
                input: resizedDesign,
                left: offsetX,
                top: offsetY
              }])
              .resize(1600, 960, { fit: 'inside' })
              .jpeg({ quality: 92 })
              .toBuffer()
          }

          // Cleanup temp files
          await unlink(tempDesign).catch(() => {})
          await unlink(tempOutput).catch(() => {})

          // Convert to base64
          const base64 = outputBuffer.toString('base64')
          const dataUrl = `data:image/jpeg;base64,${base64}`

          return {
            name: template.name,
            orientation: template.orientation,
            url: dataUrl,
            renderTime: Date.now() - templateStartTime,
            method: hasMagick ? 'ImageMagick + PSD' : 'Sharp (fallback)'
          }
        } catch (error) {
          console.error(`Error generating mockup for ${template.name}:`, error)
          return {
            name: template.name,
            orientation: template.orientation,
            error: error instanceof Error ? error.message : 'Unknown error',
            renderTime: Date.now() - templateStartTime
          }
        }
      })
    )

    const successfulMockups = mockups.filter(m => m.url)

    return NextResponse.json({
      success: true,
      mockups: successfulMockups,
      errors: mockups.filter(m => m.error),
      totalTime: Date.now() - startTime
    })
  } catch (error) {
    console.error('Error in test-psd-mockup:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

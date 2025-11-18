#!/usr/bin/env node

/**
 * Generate displacement map from mannequin-white-model.jpg
 * 
 * Creates a grayscale displacement map that captures fabric wrinkles,
 * folds, and depth information for realistic mockup rendering.
 */

const sharp = require('sharp');
const path = require('path');

async function createDisplacementMap() {
  const inputPath = path.join(process.cwd(), 'public/mockups/mannequin-white-model.jpg');
  const outputDir = path.join(process.cwd(), 'public/mockups/displacement');
  const outputPath = path.join(outputDir, 'tshirt-white-model-displacement.png');

  console.log('📸 Loading source image:', inputPath);

  try {
    // Load the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log('📐 Image dimensions:', metadata.width, 'x', metadata.height);
    console.log('🎨 Processing displacement map...\n');

    // Step 1: Convert to grayscale
    console.log('1️⃣  Converting to grayscale...');
    const grayscale = image.clone().grayscale();

    // Step 2: Enhance edges (to emphasize wrinkles and folds)
    console.log('2️⃣  Detecting edges and wrinkles...');
    const edgeDetected = grayscale.clone()
      .convolve({
        width: 3,
        height: 3,
        // Sobel edge detection kernel (emphasizes wrinkles)
        kernel: [
          -1, -2, -1,
           0,  0,  0,
           1,  2,  1
        ]
      });

    // Step 3: Normalize and enhance contrast
    console.log('3️⃣  Normalizing brightness...');
    const normalized = edgeDetected.clone()
      .normalize() // Stretch contrast to full 0-255 range
      .modulate({
        brightness: 1.1, // Slightly brighten
        saturation: 1.0
      });

    // Step 4: Apply slight blur to smooth out noise
    console.log('4️⃣  Smoothing displacement map...');
    const smoothed = normalized.clone()
      .blur(1.5); // Gentle blur to remove pixel noise

    // Step 5: Apply contrast adjustment (S-curve for better depth)
    console.log('5️⃣  Enhancing contrast for depth...');
    const final = smoothed.clone()
      .linear(1.3, -38) // Increase contrast: output = 1.3 * input - 38
      .normalise(); // Ensure values stay in 0-255 range

    // Create output directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('📁 Created directory:', outputDir);
    }

    // Save displacement map
    await final.png().toFile(outputPath);
    
    console.log('\n✅ Displacement map created successfully!');
    console.log('📍 Saved to:', outputPath);
    console.log('\n💡 Usage:');
    console.log('   - Toggle "Sharp (Server)" rendering');
    console.log('   - Enable "Displacement" checkbox');
    console.log('   - See realistic fabric wrinkles!\n');

    // Also create a preview comparison
    console.log('🖼️  Creating preview comparison...');
    
    const preview = await sharp({
      create: {
        width: metadata.width * 2 + 20,
        height: metadata.height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([
      {
        input: await image.clone().toBuffer(),
        left: 0,
        top: 0
      },
      {
        input: await final.toBuffer(),
        left: metadata.width + 20,
        top: 0
      }
    ])
    .png()
    .toFile(path.join(outputDir, 'preview-comparison.png'));

    console.log('✅ Preview saved to:', path.join(outputDir, 'preview-comparison.png'));
    console.log('   (Left: Original | Right: Displacement Map)\n');

    // Generate statistics
    const stats = await final.stats();
    console.log('📊 Displacement map statistics:');
    console.log('   Min brightness:', Math.round(stats.channels[0].min));
    console.log('   Max brightness:', Math.round(stats.channels[0].max));
    console.log('   Mean brightness:', Math.round(stats.channels[0].mean));
    console.log('   Std deviation:', Math.round(stats.channels[0].stdev));

  } catch (error) {
    console.error('\n❌ Error creating displacement map:');
    console.error(error.message);
    process.exit(1);
  }
}

createDisplacementMap();

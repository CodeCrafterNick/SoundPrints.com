const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Automatically extract displacement template from PSD file
 * 
 * Usage:
 *   node scripts/auto-extract-psd.js path/to/mockup.psd template-id
 * 
 * REQUIRED PSD LAYER NAMES (case-insensitive):
 *   - DESIGN: Smart object or layer for design placement (auto-detects print area)
 * 
 * OPTIONAL PSD LAYER NAMES:
 *   - DISPLACEMENT: Grayscale wrinkle/distortion map (can be used as texture overlay)
 *   - SHADOW: Shadow layer
 *   - HIGHLIGHT: Highlight/shine layer  
 *   - MASK: Print area mask (recommended for clean compositing)
 *   - BASE: Base mockup (if not present, uses composite)
 * 
 * Two rendering modes:
 *   1. MASK MODE (recommended): Clean mask-based compositing with optional subtle texture
 *      - No distortion, just blend modes + mask
 *      - Displacement used as subtle texture overlay (15% opacity)
 *      - Fast and clean results
 * 
 *   2. DISPLACEMENT MODE (advanced): Full pixel displacement mapping
 *      - Realistic fabric wrinkles by offsetting pixels
 *      - Can cause distortion if intensity too high
 *      - Best for fabric products
 * 
 * The script will:
 *   1. Read the PSD file
 *   2. Extract layers by standardized names
 *   3. Auto-detect print area from DESIGN layer bounds
 *   4. Generate metadata.json
 *   5. Update library.json
 * 
 * No manual export needed!
 */

async function findLayerByName(layers, searchTerms) {
  for (const layer of layers) {
    const name = (layer.name || '').toLowerCase();
    
    for (const term of searchTerms) {
      if (name.includes(term.toLowerCase())) {
        return layer;
      }
    }
    
    // Recursively search child layers
    if (layer.children && layer.children.length > 0) {
      const found = await findLayerByName(layer.children, searchTerms);
      if (found) return found;
    }
  }
  
  return null;
}

async function findSmartObject(layers) {
  for (const layer of layers) {
    if (layer.type === 'smartObject') {
      return layer;
    }
    
    // Recursively search
    if (layer.children && layer.children.length > 0) {
      const found = await findSmartObject(layer.children);
      if (found) return found;
    }
  }
  
  return null;
}

async function isGrayscale(imageData) {
  if (!imageData || imageData.length === 0) return false;
  
  // Check if the image data appears to be grayscale
  // Sample first 100 pixels
  const sampleSize = Math.min(100 * 4, imageData.length);
  let isGray = true;
  
  for (let i = 0; i < sampleSize; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    
    // Check if R=G=B (grayscale)
    if (Math.abs(r - g) > 5 || Math.abs(g - b) > 5 || Math.abs(r - b) > 5) {
      isGray = false;
      break;
    }
  }
  
  return isGray;
}

async function extractLayerImage(psd, layer, outputPath) {
  try {
    // Get layer bounds
    const { top, left, bottom, right } = layer;
    const width = right - left;
    const height = bottom - top;
    
    if (width <= 0 || height <= 0) {
      console.log(`   ⚠️  Layer has no content (${width}x${height})`);
      return null;
    }
    
    // Create blank canvas
    const canvas = Buffer.alloc(width * height * 4);
    
    // Fill with layer data
    const channels = layer.channels;
    if (!channels) return null;
    
    // Get channel data
    const red = channels.find(c => c.kind === 0); // Red
    const green = channels.find(c => c.kind === 1); // Green
    const blue = channels.find(c => c.kind === 2); // Blue
    const alpha = channels.find(c => c.kind === -1); // Alpha
    
    if (!red && !green && !blue) return null;
    
    // Composite channels
    for (let i = 0; i < width * height; i++) {
      canvas[i * 4] = red ? red.data[i] : 0;
      canvas[i * 4 + 1] = green ? green.data[i] : 0;
      canvas[i * 4 + 2] = blue ? blue.data[i] : 0;
      canvas[i * 4 + 3] = alpha ? alpha.data[i] : 255;
    }
    
    // Save with Sharp
    await sharp(canvas, {
      raw: {
        width,
        height,
        channels: 4
      }
    }).png().toFile(outputPath);
    
    return { width, height, top, left };
  } catch (error) {
    console.log(`   ⚠️  Error extracting layer:`, error.message);
    return null;
  }
}

async function autoExtractPSD() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node auto-extract-psd.js <path-to-psd> <template-id>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/auto-extract-psd.js ~/Downloads/tshirt-mockup.psd bella-canvas-white-front');
    console.log('');
    console.log('REQUIRED PSD LAYERS (case-insensitive):');
    console.log('  DESIGN - Smart object for design placement');
    console.log('');
    console.log('OPTIONAL PSD LAYERS:');
    console.log('  MASK - Print area mask (recommended for clean compositing)');
    console.log('  DISPLACEMENT - Grayscale texture/wrinkle map (can be used as overlay)');
    console.log('  SHADOW - Shadow layer');
    console.log('  HIGHLIGHT - Highlight/shine layer');
    console.log('');
    console.log('TWO RENDERING MODES:');
    console.log('  🎭 Mask Mode (default): Clean mask-based compositing');
    console.log('     - No distortion, uses blend modes + mask');
    console.log('     - Displacement used as subtle texture (15% opacity)');
    console.log('     - Best for most products');
    console.log('');
    console.log('  🌊 Displacement Mode: Full pixel displacement');
    console.log('     - Realistic fabric wrinkles by offsetting pixels');
    console.log('     - Can cause distortion if too strong');
    console.log('     - Best for soft fabrics');
    console.log('');
    console.log('The script will automatically:');
    console.log('  ✅ Extract all layers by name');
    console.log('  ✅ Auto-detect print area from DESIGN layer');
    console.log('  ✅ Create metadata.json');
    console.log('  ✅ Update library.json');
    process.exit(1);
  }
  
  const psdPath = args[0];
  const templateId = args[1];
  
  // Import ES module (readPsd is default export)
  const psdModule = await import('@webtoon/psd');
  const readPsd = psdModule.default;
  
  console.log('🔍 Auto-extracting PSD template...');
  console.log('Source:', psdPath);
  console.log('Template ID:', templateId);
  console.log('');
  
  // Read PSD file
  let psdData;
  try {
    const buffer = await fs.readFile(psdPath);
    console.log('📖 Reading PSD file...');
    psdData = new readPsd(buffer);
    console.log(`✅ PSD loaded: ${psdData.width}x${psdData.height}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error reading PSD:', error.message);
    process.exit(1);
  }
  
  // Create template directory
  const templateDir = path.join('public/mockups/displacement-templates', templateId);
  await fs.mkdir(templateDir, { recursive: true });
  console.log('✅ Created template directory:', templateDir);
  console.log('');
  
  // Extract base image (flattened composite)
  console.log('📸 Extracting base image...');
  const baseBuffer = psdData.composite;
  if (!baseBuffer) {
    console.error('❌ No composite image found in PSD');
    process.exit(1);
  }
  
  // Convert composite to PNG
  const basePath = path.join(templateDir, 'base.png');
  await sharp(Buffer.from(baseBuffer), {
    raw: {
      width: psdData.width,
      height: psdData.height,
      channels: 4
    }
  }).png().toFile(basePath);
  
  const baseStats = await fs.stat(basePath);
  console.log(`✅ base.png: ${psdData.width}x${psdData.height} (${(baseStats.size / 1024 / 1024).toFixed(1)}MB)`);
  console.log('');
  
  // STANDARDIZED LAYER NAMES - These exact names will be searched for
  const LAYER_NAMES = {
    displacement: 'DISPLACEMENT',    // Wrinkle/distortion map (grayscale)
    design: 'DESIGN',               // Smart object for design placement
    shadow: 'SHADOW',               // Shadow layer
    highlight: 'HIGHLIGHT',         // Highlight/shine layer
    mask: 'MASK',                   // Print area mask
    base: 'BASE'                    // Base mockup layer (optional, uses composite if not found)
  };
  
  console.log('📋 Standardized layer names:');
  console.log('   DESIGN - Smart object for design placement');
  console.log('   DISPLACEMENT - Wrinkle/distortion map (grayscale)');
  console.log('   SHADOW - Shadow layer (optional)');
  console.log('   HIGHLIGHT - Highlight/shine layer (optional)');
  console.log('   MASK - Print area mask (optional)');
  console.log('   BASE - Base mockup (optional, uses composite if not found)');
  console.log('');
  
  // Find displacement map layer
  console.log('🔍 Searching for DISPLACEMENT layer...');
  const displacementLayer = await findLayerByName(psdData.children, [LAYER_NAMES.displacement]);
  
  let displacementPath = null;
  if (displacementLayer) {
    console.log(`   ✅ Found: "${displacementLayer.name}"`);
    displacementPath = path.join(templateDir, 'displacement.png');
    
    const result = await extractLayerImage(psdData, displacementLayer, displacementPath);
    if (result) {
      const stats = await fs.stat(displacementPath);
      console.log(`   Extracted: ${result.width}x${result.height} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      displacementPath = null;
    }
  } else {
    console.log(`   ⚠️  Layer named "${LAYER_NAMES.displacement}" not found`);
  }
  
  console.log('');
  
  // Find design smart object (or layer named DESIGN)
  console.log('🔍 Searching for DESIGN layer...');
  let designLayer = await findLayerByName(psdData.children, [LAYER_NAMES.design]);
  
  // If no DESIGN layer found, look for any smart object
  if (!designLayer) {
    console.log(`   Layer named "${LAYER_NAMES.design}" not found, looking for smart objects...`);
    designLayer = await findSmartObject(psdData.children || []);
  }
  
  let printArea = {
    x: 0.3,
    y: 0.25,
    width: 0.4,
    height: 0.5
  };
  
  if (designLayer) {
    console.log(`   ✅ Found: "${designLayer.name}"`);
    const { top, left, bottom, right } = designLayer;
    const soWidth = right - left;
    const soHeight = bottom - top;
    
    // Calculate normalized coordinates
    printArea = {
      x: left / psdData.width,
      y: top / psdData.height,
      width: soWidth / psdData.width,
      height: soHeight / psdData.height
    };
    
    console.log(`   Position: (${left}, ${top})`);
    console.log(`   Size: ${soWidth}x${soHeight}`);
    console.log(`   Normalized: x=${printArea.x.toFixed(3)}, y=${printArea.y.toFixed(3)}, w=${printArea.width.toFixed(3)}, h=${printArea.height.toFixed(3)}`);
  } else {
    console.log(`   ⚠️  No "${LAYER_NAMES.design}" layer or smart object found, using default print area`);
  }
  
  console.log('');
  
  // Look for optional layers
  console.log('🔍 Searching for optional layers...');
  
  const optionalLayers = [
    { names: [LAYER_NAMES.shadow], file: 'shadow.png' },
    { names: [LAYER_NAMES.highlight], file: 'highlight.png' },
    { names: [LAYER_NAMES.mask], file: 'mask.png' }
  ];
  
  const foundOptional = {};
  
  for (const optional of optionalLayers) {
    const layer = await findLayerByName(psdData.children, optional.names);
    if (layer) {
      console.log(`   ✅ Found ${optional.names[0]}: "${layer.name}"`);
      const outputPath = path.join(templateDir, optional.file);
      const result = await extractLayerImage(psdData, layer, outputPath);
      if (result) {
        const stats = await fs.stat(outputPath);
        console.log(`   Extracted: ${result.width}x${result.height} (${(stats.size / 1024).toFixed(1)}KB)`);
        foundOptional[optional.file] = true;
      }
    } else {
      console.log(`   ⚪ ${optional.names[0]} not found (optional)`);
    }
  }
  
  console.log('');
  
  // If no displacement map found, generate one from base image
  if (!displacementPath) {
    console.log('🎨 Generating displacement map from base image...');
    displacementPath = path.join(templateDir, 'displacement.png');
    
    // Extract print area
    const printX = Math.round(printArea.x * psdData.width);
    const printY = Math.round(printArea.y * psdData.height);
    const printW = Math.round(printArea.width * psdData.width);
    const printH = Math.round(printArea.height * psdData.height);
    
    await sharp(basePath)
      .extract({ left: printX, top: printY, width: printW, height: printH })
      .grayscale()
      .normalise()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1] // Sobel vertical
      })
      .normalise()
      .blur(2)
      .linear(1.5, -50)
      .resize(psdData.width, psdData.height, { fit: 'fill', kernel: 'lanczos3' })
      .png()
      .toFile(displacementPath);
    
    const stats = await fs.stat(displacementPath);
    console.log(`✅ Generated displacement.png (${(stats.size / 1024).toFixed(1)}KB)`);
    console.log('');
  }
  
  // Create metadata
  console.log('📝 Generating metadata...');
  
  const metadata = {
    id: templateId,
    name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    productType: 't-shirt', // Could be auto-detected from filename
    color: 'white',
    angle: 'front',
    basePath: 'base.png',
    displacementPath: 'displacement.png',
    printArea
  };
  
  if (foundOptional['mask.png']) metadata.maskPath = 'mask.png';
  if (foundOptional['shadow.png']) metadata.shadowPath = 'shadow.png';
  if (foundOptional['highlight.png']) metadata.highlightPath = 'highlight.png';
  
  await fs.writeFile(
    path.join(templateDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('✅ Created metadata.json');
  console.log('');
  
  // Update library
  console.log('📚 Updating library...');
  const libraryPath = 'public/mockups/displacement-templates/library.json';
  let library;
  
  try {
    const libraryData = await fs.readFile(libraryPath, 'utf-8');
    library = JSON.parse(libraryData);
  } catch (error) {
    library = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      templates: []
    };
  }
  
  const libraryEntry = {
    ...metadata,
    basePath: `${templateId}/base.png`,
    displacementPath: `${templateId}/displacement.png`
  };
  
  if (metadata.maskPath) libraryEntry.maskPath = `${templateId}/mask.png`;
  if (metadata.shadowPath) libraryEntry.shadowPath = `${templateId}/shadow.png`;
  if (metadata.highlightPath) libraryEntry.highlightPath = `${templateId}/highlight.png`;
  
  const existingIndex = library.templates.findIndex(t => t.id === templateId);
  if (existingIndex >= 0) {
    library.templates[existingIndex] = libraryEntry;
  } else {
    library.templates.push(libraryEntry);
  }
  
  library.lastUpdated = new Date().toISOString();
  
  await fs.writeFile(libraryPath, JSON.stringify(library, null, 2));
  console.log('✅ Updated library.json');
  console.log('');
  
  console.log('🎉 Template extracted successfully!');
  console.log('');
  console.log('Summary:');
  console.log('  Template ID:', templateId);
  console.log('  Location:', templateDir);
  console.log('  Base image:', `${psdData.width}x${psdData.height}`);
  console.log('  Print area:', `${(printArea.width * 100).toFixed(1)}% × ${(printArea.height * 100).toFixed(1)}%`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review metadata.json and adjust if needed');
  console.log('  2. Test with: npx tsx test-displacement.js');
  console.log('');
}

autoExtractPSD().catch(console.error);

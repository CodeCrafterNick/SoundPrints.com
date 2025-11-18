const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Extract displacement map and base image from a PSD mockup template
 * 
 * Usage:
 *   node scripts/extract-psd-displacement.js path/to/mockup.psd output-template-id
 * 
 * PSD Structure Expected:
 *   - Smart object layer for design placement
 *   - Displacement map layer (grayscale)
 *   - Background/base mockup layer
 * 
 * Manual Steps Required:
 *   1. Open PSD in Photoshop
 *   2. Export each layer as PNG:
 *      - base.png (flattened mockup without design)
 *      - displacement.png (the displacement/distortion map layer)
 *      - mask.png (optional - the design area mask)
 *      - shadow.png (optional - shadow layer)
 *      - highlight.png (optional - highlight layer)
 *   3. Place exported files in a folder
 *   4. Run this script to organize them into template structure
 */

async function extractPSDTemplate() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node extract-psd-displacement.js <psd-exports-folder> <template-id>');
    console.log('');
    console.log('Steps:');
    console.log('  1. Open your PSD in Photoshop');
    console.log('  2. Export layers as PNG files:');
    console.log('     - base.png (mockup without design)');
    console.log('     - displacement.png (displacement/distortion map)');
    console.log('     - mask.png (optional - design area)');
    console.log('     - shadow.png (optional)');
    console.log('     - highlight.png (optional)');
    console.log('  3. Save all PNGs to a folder');
    console.log('  4. Run: node extract-psd-displacement.js /path/to/folder template-id');
    console.log('');
    console.log('Example:');
    console.log('  node extract-psd-displacement.js ~/Downloads/tshirt-white-psd bella-canvas-white-front');
    process.exit(1);
  }
  
  const sourceFolder = args[0];
  const templateId = args[1];
  
  console.log('📦 Extracting PSD template...');
  console.log('Source:', sourceFolder);
  console.log('Template ID:', templateId);
  console.log('');
  
  // Check if source folder exists
  try {
    await fs.access(sourceFolder);
  } catch (error) {
    console.error('❌ Error: Source folder not found:', sourceFolder);
    process.exit(1);
  }
  
  // List files in source folder
  const files = await fs.readdir(sourceFolder);
  console.log('Files found:', files.join(', '));
  console.log('');
  
  // Create template directory
  const templateDir = path.join('public/mockups/displacement-templates', templateId);
  await fs.mkdir(templateDir, { recursive: true });
  console.log('✅ Created template directory:', templateDir);
  
  // Required files
  const requiredFiles = ['base.png', 'displacement.png'];
  const optionalFiles = ['mask.png', 'shadow.png', 'highlight.png'];
  
  // Copy and validate required files
  for (const filename of requiredFiles) {
    const sourcePath = path.join(sourceFolder, filename);
    const destPath = path.join(templateDir, filename);
    
    try {
      await fs.access(sourcePath);
      await fs.copyFile(sourcePath, destPath);
      
      // Get image info
      const image = sharp(destPath);
      const metadata = await image.metadata();
      console.log(`✅ ${filename}: ${metadata.width}x${metadata.height}`);
    } catch (error) {
      console.error(`❌ Missing required file: ${filename}`);
      console.error('   Please export this layer from your PSD');
      process.exit(1);
    }
  }
  
  // Copy optional files if they exist
  for (const filename of optionalFiles) {
    const sourcePath = path.join(sourceFolder, filename);
    const destPath = path.join(templateDir, filename);
    
    try {
      await fs.access(sourcePath);
      await fs.copyFile(sourcePath, destPath);
      
      const image = sharp(destPath);
      const metadata = await image.metadata();
      console.log(`✅ ${filename}: ${metadata.width}x${metadata.height} (optional)`);
    } catch (error) {
      console.log(`⚪ ${filename}: not found (optional - skipped)`);
    }
  }
  
  console.log('');
  console.log('📐 Analyzing print area...');
  
  // Analyze base image to determine print area
  const baseImage = sharp(path.join(templateDir, 'base.png'));
  const baseMetadata = await baseImage.metadata();
  
  // Interactive prompt for print area (you'll need to measure in Photoshop)
  console.log('');
  console.log('🔍 Next step: Define the print area');
  console.log('   Open your PSD and measure the smart object position/size');
  console.log('   Then update the metadata.json file with these values (0-1 range):');
  console.log('');
  console.log('   Example:');
  console.log('   {');
  console.log('     "printArea": {');
  console.log('       "x": 0.3,      // Left edge (0-1)');
  console.log('       "y": 0.25,     // Top edge (0-1)');
  console.log('       "width": 0.4,  // Width (0-1)');
  console.log('       "height": 0.5  // Height (0-1)');
  console.log('     }');
  console.log('   }');
  console.log('');
  
  // Create template metadata
  const metadata = {
    id: templateId,
    name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    productType: 't-shirt', // Update this
    color: 'natural',       // Update this
    angle: 'front',         // Update this
    basePath: 'base.png',
    displacementPath: 'displacement.png',
    printArea: {
      x: 0.3,      // TODO: Measure from PSD
      y: 0.25,     // TODO: Measure from PSD
      width: 0.4,  // TODO: Measure from PSD
      height: 0.5  // TODO: Measure from PSD
    }
  };
  
  // Add optional layers if they exist
  try {
    await fs.access(path.join(templateDir, 'mask.png'));
    metadata.maskPath = 'mask.png';
  } catch (e) {}
  
  try {
    await fs.access(path.join(templateDir, 'shadow.png'));
    metadata.shadowPath = 'shadow.png';
  } catch (e) {}
  
  try {
    await fs.access(path.join(templateDir, 'highlight.png'));
    metadata.highlightPath = 'highlight.png';
  } catch (e) {}
  
  await fs.writeFile(
    path.join(templateDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('✅ Created metadata.json');
  console.log('   ⚠️  Please edit this file to set correct print area values');
  console.log('');
  
  // Update library.json
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
  
  // Add or update template in library
  const existingIndex = library.templates.findIndex(t => t.id === templateId);
  const libraryEntry = {
    ...metadata,
    basePath: `${templateId}/base.png`,
    displacementPath: `${templateId}/displacement.png`
  };
  
  if (metadata.maskPath) libraryEntry.maskPath = `${templateId}/mask.png`;
  if (metadata.shadowPath) libraryEntry.shadowPath = `${templateId}/shadow.png`;
  if (metadata.highlightPath) libraryEntry.highlightPath = `${templateId}/highlight.png`;
  
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
  console.log('Next steps:');
  console.log('  1. Edit metadata.json to set correct print area coordinates');
  console.log('  2. Edit metadata.json to set product type, color, and angle');
  console.log('  3. Test with: npx tsx test-displacement.js');
  console.log('');
  console.log('Template location:', templateDir);
}

extractPSDTemplate().catch(console.error);

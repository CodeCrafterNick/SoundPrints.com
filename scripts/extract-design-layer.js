#!/usr/bin/env node

const { readPsd, initializeCanvas } = require('ag-psd');
const fs = require('fs');

// Try to initialize canvas if available, otherwise skip
try {
  const { createCanvas } = require('canvas');
  initializeCanvas(createCanvas);
  console.log('Canvas initialized');
} catch (e) {
  console.warn('Canvas module not available, will try without it');
}

const psdPath = process.argv[2] || 'public/mockups/white-shirt.psd';

console.log(`Reading ${psdPath}...`);
const buffer = fs.readFileSync(psdPath);

let psd;
try {
  psd = readPsd(buffer, { skipLayerImageData: true });
} catch (e1) {
  console.log('Failed with skipLayerImageData:true, trying without...');
  try {
    psd = readPsd(buffer, { skipLayerImageData: false });
  } catch (e2) {
    console.error('Failed to read PSD:', e2.message);
    process.exit(1);
  }
}

console.log(`Canvas: ${psd.width}x${psd.height}`);
console.log(`Layers found: ${psd.children?.length || 0}`);

if (psd.children) {
  console.log('\nAll layers:');
  psd.children.forEach((layer, i) => {
    console.log(`  ${i + 1}. "${layer.name}" - ${layer.left},${layer.top} to ${layer.right},${layer.bottom}`);
  });
}

// Find DESIGN layer
const design = psd.children?.find(l => l.name?.toLowerCase() === 'design');

if (!design) {
  console.error('\n❌ DESIGN layer not found');
  console.log('Please ensure your PSD has a layer named "DESIGN"');
  process.exit(1);
}

console.log('\n✅ Found DESIGN layer:');
console.log(`  Position: ${design.left}, ${design.top}`);
console.log(`  Size: ${design.right - design.left}x${design.bottom - design.top}`);
console.log(`  Bounds: left=${design.left}, top=${design.top}, right=${design.right}, bottom=${design.bottom}`);

// Calculate normalized coordinates (0-1 scale)
const x = design.left / psd.width;
const y = design.top / psd.height;
const width = (design.right - design.left) / psd.width;
const height = (design.bottom - design.top) / psd.height;

const normalized = {
  x: +x.toFixed(4),
  y: +y.toFixed(4),
  width: +width.toFixed(4),
  height: +height.toFixed(4)
};

console.log('\n📐 Normalized coordinates (for metadata.json):');
console.log(JSON.stringify(normalized, null, 2));

// Optionally write to a JSON file
if (process.argv[3] === '--write') {
  const outputPath = 'public/mockups/displacement-templates/white-shirt-front/metadata.json';
  const metadata = {
    id: 'white-shirt-front',
    printArea: normalized
  };
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
  console.log(`\n✅ Written to ${outputPath}`);
}

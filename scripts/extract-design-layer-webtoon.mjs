#!/usr/bin/env node

import Psd from '@webtoon/psd';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';

const psdPath = process.argv[2] || 'public/mockups/white-shirt.psd';

console.log(`Reading ${psdPath}...`);
const buffer = readFileSync(psdPath);

try {
  const psd = Psd.parse(buffer.buffer);
  
  console.log(`Canvas: ${psd.width}x${psd.height}`);
  console.log(`Layers found: ${psd.children?.length || 0}`);
  
  if (psd.children) {
    console.log('\nAll layers:');
    psd.children.forEach((layer, i) => {
      console.log(`  ${i + 1}. "${layer.name}" - type: ${layer.type}`);
      if (layer.type === 'Layer') {
        console.log(`     Position: ${layer.left},${layer.top} Size: ${layer.width}x${layer.height}`);
      }
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
  console.log(`  Size: ${design.width}x${design.height}`);
  
  // Calculate normalized coordinates (0-1 scale)
  const x = design.left / psd.width;
  const y = design.top / psd.height;
  const width = design.width / psd.width;
  const height = design.height / psd.height;
  
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
    writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
    console.log(`\n✅ Written to ${outputPath}`);
  }
} catch (error) {
  console.error('Failed to read PSD:', error.message);
  process.exit(1);
}

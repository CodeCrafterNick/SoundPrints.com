#!/usr/bin/env node

import Psd from '@webtoon/psd';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { PNG } from 'pngjs';
import path from 'path';

const psdPath = process.argv[2] || 'public/mockups/white-shirt.psd';
const outputDir = process.argv[3] || 'public/mockups/displacement-templates/white-shirt-front';

console.log(`Reading ${psdPath}...`);
const buffer = readFileSync(psdPath);
const psd = Psd.parse(buffer.buffer);

console.log(`Canvas: ${psd.width}x${psd.height}`);
console.log(`Layers: ${psd.children?.length || 0}`);

// Create output directory
mkdirSync(outputDir, { recursive: true });

// Layer name mapping (PSD layer name -> output filename)
const layerMap = {
  'BASE': 'base.png',
  'MASK': 'mask.png',
  'SHADOWS': 'shadow.png',
  'HIGHLIGHTS': 'highlight.png',
  'DESIGN': null // Don't export DESIGN layer
};

psd.children?.forEach(layer => {
  const outputName = layerMap[layer.name];
  
  if (!outputName) {
    console.log(`Skipping layer: ${layer.name}`);
    return;
  }

  console.log(`\nExporting ${layer.name} -> ${outputName}`);
  
  try {
    // Get layer image data
    const imageData = layer.imageData;
    
    if (!imageData) {
      console.log(`  ⚠️  No image data for ${layer.name}`);
      return;
    }

    // Create PNG
    const png = new PNG({
      width: psd.width,
      height: psd.height
    });

    // Convert imageData to Buffer if needed
    const dataBuffer = Buffer.isBuffer(imageData) ? imageData : Buffer.from(new Uint8Array(imageData));

    // If layer is smaller than canvas, we need to composite it
    if (layer.width === psd.width && layer.height === psd.height) {
      // Full canvas layer
      png.data = dataBuffer;
    } else {
      // Layer needs to be positioned on canvas
      console.log(`  Compositing ${layer.width}x${layer.height} at (${layer.left}, ${layer.top})`);
      
      // Start with transparent canvas
      png.data.fill(0);
      
      // Copy layer data to correct position
      for (let y = 0; y < layer.height; y++) {
        for (let x = 0; x < layer.width; x++) {
          const canvasX = x + layer.left;
          const canvasY = y + layer.top;
          
          if (canvasX >= 0 && canvasX < psd.width && canvasY >= 0 && canvasY < psd.height) {
            const srcIdx = (y * layer.width + x) * 4;
            const dstIdx = (canvasY * psd.width + canvasX) * 4;
            
            png.data[dstIdx] = imageData[srcIdx];     // R
            png.data[dstIdx + 1] = imageData[srcIdx + 1]; // G
            png.data[dstIdx + 2] = imageData[srcIdx + 2]; // B
            png.data[dstIdx + 3] = imageData[srcIdx + 3]; // A
          }
        }
      }
    }

    const outputPath = path.join(outputDir, outputName);
    const pngBuffer = PNG.sync.write(png);
    writeFileSync(outputPath, pngBuffer);
    
    console.log(`  ✅ Saved to ${outputPath} (${(pngBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch (error) {
    console.error(`  ❌ Error exporting ${layer.name}:`, error.message);
  }
});

console.log('\n✅ Layer extraction complete!');

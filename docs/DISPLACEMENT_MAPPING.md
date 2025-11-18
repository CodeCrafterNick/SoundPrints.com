# Displacement Mapping Guide for Realistic Mockups

## Overview

Displacement mapping creates photorealistic product mockups by warping artwork to match fabric wrinkles, folds, and textures. This gives a much more realistic appearance than flat overlays.

## What You Need

### 1. Product Photos (Model Shots)
- High-resolution photos of models wearing blank t-shirts, hoodies, etc.
- Multiple angles: front, side, back, 3/4 view
- Good lighting to capture fabric details
- **Sources:**
  - Hire photographer for custom shots
  - Stock photo sites: Unsplash, Pexels, Adobe Stock
  - Mockup generators: Placeit, Smartmockups (for base templates)

### 2. Displacement Maps
Grayscale images where brightness = displacement amount:
- **White pixels** = push/raise (fabric peaks)
- **Black pixels** = pull/sink (fabric valleys)
- **Gray pixels** = neutral (flat fabric)

#### Creating Displacement Maps

**Option A: Photoshop (Recommended)**
1. Open model photo in Photoshop
2. Duplicate layer → Desaturate (Image > Adjustments > Desaturate)
3. Increase contrast (Curves/Levels) to emphasize wrinkles
4. Use High Pass filter (Filter > Other > High Pass, 10-20px)
5. Adjust levels so wrinkles are white, shadows are black
6. Blur slightly (Gaussian Blur, 1-2px) to smooth
7. Save as `displacement-map-tshirt-front.png`

**Option B: GIMP (Free Alternative)**
1. Open photo → Colors > Desaturate
2. Colors > Curves → Make S-curve to boost contrast
3. Filters > Edge Detect > Edge
4. Invert if needed (bright wrinkles, dark shadows)
5. Filters > Blur > Gaussian Blur (2px)
6. Export as PNG

**Option C: AI Tools**
- Use AI to generate normal maps from photos:
  - NormalMap-Online: http://cpetry.github.io/NormalMap-Online/
  - Substance 3D Sampler (converts photos to materials)
- Convert normal maps to displacement (use blue channel)

### 3. Smart Object PSDs

Photoshop files with Smart Objects allow artwork replacement while preserving effects:

#### Creating PSD Template

```
1. File > New (3000x3000px, 300 DPI)
2. Place model photo as base layer
3. Create Rectangle (artwork area)
4. Convert to Smart Object (Right-click > Convert to Smart Object)
5. Apply Displacement:
   - Filter > Distort > Displace
   - Horizontal: 10px, Vertical: 10px
   - Select displacement map file
6. Apply Layer Effects:
   - Blending Mode: Multiply (for dark fabrics)
   - Opacity: 92% (fabric absorption)
   - Inner Shadow (subtle depth)
7. Add Adjustment Layers:
   - Curves (match lighting)
   - Hue/Saturation (color matching)
8. Save as template-tshirt-black-front.psd
```

## Implementation Approaches

### Approach 1: Node.js/Sharp (Custom Implementation)

**Pros:**
- Full control over displacement algorithm
- No external dependencies
- Fast server-side rendering
- Works with our existing stack

**Cons:**
- More complex to implement realistic lighting
- Need to create displacement maps manually

**Implementation:**
```typescript
import { applyDisplacementMap, compositeMockupWithDisplacement } from '@/lib/displacement-map'

// Generate mockup with displacement
const mockupBuffer = await compositeMockupWithDisplacement(
  '/mockups/model-tshirt-black.png',
  artworkBuffer,
  { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
  '/mockups/displacement-tshirt-black.png'
)
```

### Approach 2: Photoshop Scripting (PSD Smart Objects)

**Pros:**
- Industry-standard quality
- All Photoshop effects available
- Easy for designers to update templates

**Cons:**
- Requires Photoshop installed on server
- Slower rendering (launches Photoshop)
- Licensing costs

**Implementation:**
```bash
# Using photoshop-node package
npm install photoshop-node

# Or command line:
photoshop-cli --script replace-smart-object.jsx \
  --input template.psd \
  --output mockup.png \
  --artwork artwork.png
```

### Approach 3: ImageMagick Displacement

**Pros:**
- Built-in displacement support
- Well-documented
- Works on any platform

**Cons:**
- Separate binary dependency
- Less control than custom implementation

**Implementation:**
```bash
# Install ImageMagick
brew install imagemagick

# Apply displacement
convert artwork.png \
  \( displacement-map.png -blur 0x2 \) \
  -compose Displace \
  -define compose:args=10x10 \
  -composite \
  displaced-artwork.png

# Composite onto mockup
convert mockup.png \
  displaced-artwork.png \
  -geometry +300+320 \
  -composite \
  final-mockup.png
```

### Approach 4: Canvas API (Client-Side)

**Pros:**
- No server processing
- Real-time preview
- Uses existing canvas code

**Cons:**
- Slower for high-res exports
- Browser memory limits

**Implementation:**
```typescript
// Read displacement map
const dispMap = ctx.getImageData(0, 0, width, height)
const dispData = dispMap.data

// Read artwork
const artwork = ctx.getImageData(0, 0, width, height)
const artData = artwork.data

// Apply displacement
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4
    const brightness = dispData[idx] // Grayscale value
    
    // Calculate offset
    const offsetX = ((brightness / 255) - 0.5) * 20
    const offsetY = ((brightness / 255) - 0.5) * 20
    
    // Sample from offset position
    const srcX = Math.floor(x + offsetX)
    const srcY = Math.floor(y + offsetY)
    const srcIdx = (srcY * width + srcX) * 4
    
    // Copy pixel
    outputData[idx] = artData[srcIdx]
    outputData[idx + 1] = artData[srcIdx + 1]
    outputData[idx + 2] = artData[srcIdx + 2]
    outputData[idx + 3] = artData[srcIdx + 3]
  }
}
```

## Resources

### Displacement Map Libraries
- **Sharp**: Already installed, custom implementation above
- **ImageMagick**: `brew install imagemagick`
- **fabric.js**: Client-side displacement filters
- **Photopea**: Free online Photoshop alternative

### Stock Model Photos
- **Free:**
  - Unsplash.com (search "blank t-shirt model")
  - Pexels.com (search "model wearing plain shirt")
  - Pixabay.com
  
- **Paid:**
  - Adobe Stock
  - Shutterstock
  - iStock
  - Envato Elements

### Mockup Templates (with PSDs)
- **Creative Market**: Pre-made t-shirt PSD mockups
- **Graphic Burger**: Free PSD mockups
- **MockupWorld**: Free mockup templates
- **Smartmockups**: Online generator + downloadable PSDs
- **Placeit**: Subscription service with 1000s of mockups

### Displacement Map Tools
- **NormalMap-Online**: Generate from photos
- **Substance 3D Sampler**: AI-powered material creation
- **CrazyBump**: Photo to displacement/normal maps
- **Materialize**: Free displacement map generator

## Next Steps

1. **Acquire Assets:**
   - Download model photos (or hire photographer)
   - Create displacement maps in Photoshop
   - Or purchase pre-made PSD templates

2. **Choose Implementation:**
   - **Quick Start**: Use our Sharp implementation (already coded)
   - **Best Quality**: Purchase PSD templates from Creative Market
   - **Hybrid**: Use PSDs for initial creation, then extract displacement maps

3. **Set Up Pipeline:**
   ```
   public/mockups/
   ├── models/
   │   ├── tshirt-black-front.png
   │   ├── tshirt-white-front.png
   │   └── hoodie-black-front.png
   ├── displacement/
   │   ├── tshirt-front-displacement.png
   │   └── hoodie-front-displacement.png
   └── psds/
       ├── tshirt-black-template.psd
       └── hoodie-black-template.psd
   ```

4. **Integrate with API:**
   - Update `/app/api/generate-mockup/route.ts`
   - Add displacement map option
   - Return photorealistic mockups

Would you like me to implement one of these approaches?

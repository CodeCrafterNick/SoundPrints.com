# Quick Start: Creating Model Mockups with Displacement Mapping

## TL;DR - Get Started in 5 Minutes

### Option 1: Use Free Stock Photos (Fastest)

1. **Download model photos:**
   ```bash
   # Go to Unsplash and search "blank t-shirt model"
   # Download 3-5 high-res photos
   # Save to: public/mockups/models/
   ```

2. **Create simple displacement map in Preview (Mac):**
   ```
   - Open model photo in Preview
   - Tools > Adjust Color > Black & White
   - Export as PNG to: public/mockups/displacement/
   ```

3. **Test it:**
   ```bash
   cd /Users/nick/Desktop/Projects/SoundPrints.com
   pnpm dev
   # Go to /create
   # Toggle "Use Displacement" checkbox
   ```

### Option 2: Purchase Pre-Made PSDs (Best Quality)

1. **Buy mockup template:**
   - Go to [Creative Market - T-Shirt Mockups](https://creativemarket.com/search?q=t-shirt+mockup+psd)
   - Filter: PSD files with Smart Objects
   - Cost: $5-20 per mockup
   - Download includes displacement maps usually

2. **Extract assets:**
   ```bash
   # Open PSD in Photoshop
   # Save model photo: File > Export > PNG (2048px)
   # Find displacement layer > Save as PNG
   # Copy both to public/mockups/
   ```

3. **Update config:**
   ```typescript
   // In app/api/generate-mockup/route.ts
   't-shirt-black': {
     mockupPath: 'public/mockups/models/tshirt-black-front.png',
     displacementPath: 'public/mockups/displacement/tshirt-black-displacement.png',
     position: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 }
   }
   ```

### Option 3: AI-Generated Displacement Maps

1. **Upload photo to NormalMap Online:**
   - Go to: http://cpetry.github.io/NormalMap-Online/
   - Upload your model photo
   - Download normal map
   - Extract blue channel (displacement) in any image editor

2. **Or use this Python script:**
   ```python
   from PIL import Image
   import numpy as np
   
   # Load image
   img = Image.open('model-photo.jpg').convert('L')  # Grayscale
   arr = np.array(img)
   
   # Detect edges (Sobel)
   from scipy import ndimage
   sx = ndimage.sobel(arr, axis=0)
   sy = ndimage.sobel(arr, axis=1)
   displacement = np.hypot(sx, sy)
   
   # Normalize and save
   displacement = (displacement / displacement.max() * 255).astype(np.uint8)
   Image.fromarray(displacement).save('displacement.png')
   ```

## Current Implementation Status

✅ **Already Coded:**
- Displacement map algorithm (`/lib/displacement-map.ts`)
- API endpoint with displacement support (`/app/api/generate-mockup/route.ts`)
- Automatic fallback to standard rendering if maps missing

⏸️ **Needs Assets:**
- Model photos (blank t-shirts on models)
- Displacement maps (grayscale wrinkle maps)
- Or PSD templates with both

⏸️ **Needs UI:**
- Checkbox to enable displacement
- Slider to adjust intensity
- Preview of displacement effect

## Recommended Workflow

**For Testing (Free, 10 mins):**
1. Download 1 free stock photo from Unsplash
2. Convert to B&W in Preview (displacement map)
3. Save both to `public/mockups/`
4. Enable displacement in component
5. See if the effect looks good

**For Production (Best quality):**
1. Purchase 5-10 PSD mockup templates ($50-100 total)
2. Extract model photos + displacement maps
3. Organize in `public/mockups/models/` and `/displacement/`
4. Configure all products in API
5. Add UI controls for users

**For Custom Branding:**
1. Hire photographer ($500-2000)
2. Get custom shots: models, angles, lighting
3. Create professional displacement maps in Photoshop
4. Full control over brand aesthetics

## File Structure

```
public/mockups/
├── models/                           # High-res model photos
│   ├── tshirt-black-front.png       (2048x2048, model wearing blank shirt)
│   ├── tshirt-black-back.png
│   ├── tshirt-white-front.png
│   ├── hoodie-black-front.png
│   └── ...
├── displacement/                     # Grayscale displacement maps
│   ├── tshirt-black-displacement.png (2048x2048, wrinkle map)
│   ├── tshirt-white-displacement.png
│   ├── hoodie-black-displacement.png
│   └── ...
└── psds/                            # Original PSD files (optional, for editing)
    ├── tshirt-black-template.psd
    └── ...
```

## Next Action

**Choose your path:**

A. **Quick test** → Download 1 photo from Unsplash, test displacement in 10 mins
B. **Production quality** → Budget $100 for mockup PSDs, get professional results
C. **Custom brand** → Hire photographer, create unique branded mockups

Which would you like to do first?

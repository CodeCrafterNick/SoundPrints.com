# SoundPrints Mockup Library

## Blueprint Base Images (CLEAN - No Text/Designs)

These are the official Printify blueprint product photos with NO designs or text applied. Perfect for displacement mapping!

### Location: `blueprint-images/`

#### T-Shirts (`bella-canvas-3001-t-shirt/`)
- **12 views** of the base product
- Various angles and lighting
- ~3MB per image (high resolution)
- NO text, NO designs - completely clean

#### Drinkware
- **11oz White Mug (ORCA)**: 4 views
- **Mug 15oz**: 2 views  
- **Tumbler 20oz**: 5 views
- **CamelBak Water Bottle**: 4 views

#### Wall Art
- **Paper Poster**: 3 views
- **Matte Vertical Posters**: 8 views
- **Stretched Canvas**: 5 views
- **Framed Vertical Posters**: 4 views

### Total: 47 clean product images (88MB)

## Usage for Displacement Mapping

These blueprint images are the **base product photos** you should use for displacement mapping:

1. Load the appropriate blueprint image for the product type
2. Apply your soundwave design using displacement/blend techniques
3. Generate realistic product previews locally without API costs

### Directory Structure
```
mockups/
├── blueprint-images/              # ← USE THESE for displacement mapping
│   ├── bella-canvas-3001-t-shirt/
│   │   ├── view-1.jpg            # Clean t-shirt photos
│   │   ├── view-2.jpg
│   │   └── ... (12 views)
│   ├── 11oz-white-mug-orca/
│   ├── mug-15oz/
│   └── ...
└── README.md
```

## Image Details

- **Format**: JPEG
- **Quality**: High resolution (2.6MB - 3.6MB per t-shirt image)
- **Content**: Clean product photos from Printify catalog
- **Background**: Professional product photography
- **Design Area**: Empty/blank - ready for your designs

## Metadata

Each product folder includes `metadata.json` with:
- Blueprint ID
- Product name, title, description
- Brand and model information
- Original image URLs
- Download timestamp

---

Last updated: November 15, 2025

**Note**: The `clean-displacement-reference/`, `displacement-reference/`, and `drinkware/` folders contain mockups WITH designs applied. Use `blueprint-images/` for clean base photos.

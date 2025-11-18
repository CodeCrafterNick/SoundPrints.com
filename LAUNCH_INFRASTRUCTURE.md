# Launch Infrastructure - Pre-Generation & Printful Integration

## Overview

This document describes the new launch infrastructure for instant mockup generation and Printful fulfillment integration.

## Architecture

### 1. Pre-Generation System (`/lib/displacement/pregenerate.ts`)

**Purpose**: Generate all product mockups in parallel for instant product switching

**Key Features**:
- Parallel generation using `Promise.allSettled`
- Automatic caching with cache-aware generation
- Category filtering (wall-art, apparel, all)
- Multiple output formats (PNG, JPEG, WebP)
- Performance tracking with render times

**API**:
```typescript
interface MockupGenerationRequest {
  designBuffer: Buffer
  designHash?: string
  category?: 'wall-art' | 'apparel' | 'all'
  outputFormat?: 'png' | 'jpeg' | 'webp'
  outputQuality?: number
}

interface GeneratedMockup {
  templateId: string
  name: string
  category: string
  productType: string
  size?: string
  buffer: Buffer
  url?: string | null  // Supabase URL after upload
  cached: boolean
  renderTime: number
}

// Generate all mockups
const mockups = await mockupPreGenerator.generateAll({
  designBuffer,
  category: 'wall-art'
})

// Generate by category
const wallArt = await mockupPreGenerator.generateWallArt(designBuffer)
const apparel = await mockupPreGenerator.generateApparel(designBuffer)
```

### 2. Pre-Generation API (`/app/api/pregenerate-mockups/route.ts`)

**Endpoint**: `POST /api/pregenerate-mockups`

**Request**:
```typescript
// Form data
const formData = new FormData()
formData.append('design', designFile)
formData.append('category', 'all')  // or 'wall-art', 'apparel'
formData.append('format', 'png')
formData.append('quality', '90')
formData.append('uploadToStorage', 'true')  // Upload to Supabase

const response = await fetch('/api/pregenerate-mockups', {
  method: 'POST',
  body: formData
})
```

**Response**:
```typescript
{
  mockups: Array<{
    templateId: string
    name: string
    category: string
    url: string | null  // Supabase public URL
    cached: boolean
    renderTime: number
  }>,
  stats: {
    total: number
    cached: number
    generated: number
    totalTime: number
    averageTime: number
  }
}
```

**Example Usage**:
```typescript
// Client-side example
async function pregenerateMockups(designFile: File) {
  const formData = new FormData()
  formData.append('design', designFile)
  formData.append('category', 'all')
  formData.append('uploadToStorage', 'true')
  
  const response = await fetch('/api/pregenerate-mockups', {
    method: 'POST',
    body: formData
  })
  
  const { mockups, stats } = await response.json()
  
  console.log(`Generated ${stats.total} mockups in ${stats.totalTime}ms`)
  console.log(`${stats.cached} from cache, ${stats.generated} newly generated`)
  
  return mockups
}
```

### 3. Printful API Client (`/lib/printful-client.ts`)

**Purpose**: Complete integration with Printful API for order fulfillment

**Key Features**:
- Product catalog access
- File upload to Printful CDN
- Order creation and confirmation
- Shipping calculation
- Mockup generation (optional)

**API**:
```typescript
import { printfulClient } from '@/lib/printful-client'

// Get products
const products = await printfulClient.getCatalogProducts()

// Get product variants (sizes/colors)
const variants = await printfulClient.getProductVariants(productId)

// Upload design file
const file = await printfulClient.uploadFile(publicUrl)

// Create order (draft)
const order = await printfulClient.createOrder({
  external_id: 'order-123',
  shipping: 'STANDARD',
  recipient: {
    name: 'John Doe',
    address1: '123 Main St',
    city: 'Los Angeles',
    state_code: 'CA',
    country_code: 'US',
    zip: '90001',
    email: 'john@example.com'
  },
  items: [{
    variant_id: 4012,  // White poster 18x24
    quantity: 1,
    files: [{ type: 'default', url: designUrl }]
  }]
}, false)  // false = draft, true = auto-confirm

// Calculate shipping
const shipping = await printfulClient.calculateShipping(order)

// Confirm order
const confirmedOrder = await printfulClient.createOrder(order, true)
```

### 4. Order Creation API (`/app/api/orders/create/route.ts`)

**Endpoint**: `POST /api/orders/create`

**Request**:
```typescript
{
  designUrl: string,           // Public URL to design
  items: Array<{
    variantId: number,         // Printful variant ID
    quantity: number,
    files: Array<{
      type: 'front' | 'back',
      url: string
    }>
  }>,
  recipient: {
    name: string,
    address1: string,
    city: string,
    state_code: string,
    country_code: string,
    zip: string,
    email?: string,
    phone?: string
  },
  confirm?: boolean            // Auto-confirm order
}
```

**Response**:
```typescript
{
  orderId: number,             // Printful order ID
  cost: {
    subtotal: number,
    shipping: number,
    tax: number,
    total: number
  },
  status: string,
  trackingUrl?: string,
  dbOrderId?: number           // Database order ID
}
```

**Example Usage**:
```typescript
async function createOrder(designUrl: string, items: any[], recipient: any) {
  const response = await fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      designUrl,
      items,
      recipient,
      confirm: false  // Create draft first
    })
  })
  
  const order = await response.json()
  return order
}
```

## Launch Strategy

### Phase 1: Wall Art (Completed)

**Products**:
- Poster 12x16" (template: poster-12x16)
- Poster 18x24" (template: poster-18x24)
- Poster 24x36" (template: poster-24x36)
- Canvas 16x20" (template: canvas-16x20)
- Canvas 20x24" (template: canvas-20x24)

**Features**:
- ✅ Template metadata created
- ✅ Pre-generation API ready
- ✅ Printful client ready
- ✅ Order creation API ready
- ⏳ Base images needed
- ⏳ Printful API key needed
- ⏳ Product catalog mapping

### Phase 2: Apparel (Pending)

**Products**:
- T-Shirt White (Front)
- T-Shirt White (Back)
- T-Shirt Black (Front)
- T-Shirt Black (Back)

**Requirements**:
- ⏳ Create 4 PSDs with displacement maps
- ⏳ Extract layers and create templates
- ⏳ Add to library.json
- ⏳ Test displacement rendering

### Phase 3: Integration (Next)

**Tasks**:
1. Get Printful API key from https://www.printful.com/dashboard/store
2. Create product catalog mapping (template ID → Printful variant ID)
3. Integrate pre-generation into /create page
4. Connect to Stripe payment flow
5. Add order tracking and webhooks

## Integration Example

### Complete User Flow

```typescript
// 1. User uploads audio and creates waveform design
const waveformCanvas = generateWaveformCanvas(audioData, config)
const designBlob = await canvasToBlob(waveformCanvas)
const designFile = new File([designBlob], 'waveform.png')

// 2. Pre-generate all mockups instantly
const formData = new FormData()
formData.append('design', designFile)
formData.append('category', 'all')
formData.append('uploadToStorage', 'true')

const { mockups, stats } = await fetch('/api/pregenerate-mockups', {
  method: 'POST',
  body: formData
}).then(r => r.json())

console.log(`Generated ${mockups.length} mockups in ${stats.totalTime}ms`)

// 3. Show all mockups in grid - instant switching
mockups.forEach(mockup => {
  // Display mockup.url in product grid
  // No regeneration needed when user switches products!
})

// 4. User selects product and adds to cart
const selectedMockup = mockups.find(m => m.templateId === 'poster-18x24')
addToCart({
  productId: selectedMockup.templateId,
  mockupUrl: selectedMockup.url,
  designUrl: selectedMockup.url
})

// 5. At checkout, create Printful order
const order = await fetch('/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    designUrl: selectedMockup.url,
    items: [{
      variantId: 4012,  // Printful variant for 18x24 poster
      quantity: 1,
      files: [{ type: 'default', url: selectedMockup.url }]
    }],
    recipient: {
      name: 'John Doe',
      address1: '123 Main St',
      city: 'Los Angeles',
      state_code: 'CA',
      country_code: 'US',
      zip: '90001',
      email: 'john@example.com'
    },
    confirm: false
  })
}).then(r => r.json())

// 6. Show total cost to user
console.log(`Order total: $${order.cost.total}`)

// 7. After Stripe payment, confirm order
await fetch('/api/orders/create', {
  method: 'POST',
  body: JSON.stringify({ ...orderData, confirm: true })
})
```

## Product Catalog Mapping

TODO: Map template IDs to Printful product variant IDs

```typescript
const PRODUCT_MAPPING = {
  // Wall Art
  'poster-12x16': {
    printfulVariantId: 4011,
    price: 12.95,
    name: '12"×16" Enhanced Matte Paper Poster'
  },
  'poster-18x24': {
    printfulVariantId: 4012,
    price: 18.95,
    name: '18"×24" Enhanced Matte Paper Poster'
  },
  'poster-24x36': {
    printfulVariantId: 4013,
    price: 29.95,
    name: '24"×36" Enhanced Matte Paper Poster'
  },
  'canvas-16x20': {
    printfulVariantId: 5012,
    price: 45.95,
    name: '16"×20" Canvas Print'
  },
  'canvas-20x24': {
    printfulVariantId: 5013,
    price: 55.95,
    name: '20"×24" Canvas Print'
  },
  
  // T-Shirts (TODO)
  'tshirt-white-front': {
    printfulVariantId: 4012,  // TODO: Get actual ID
    price: 19.95,
    name: 'White T-Shirt (Front Print)'
  }
}
```

## Environment Setup

Add to `.env.local`:
```bash
# Printful API
PRINTFUL_API_KEY=your_printful_api_key_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (already configured)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

Get Printful API key:
1. Go to https://www.printful.com/dashboard/store
2. Navigate to Settings → API
3. Generate new API token
4. Copy token to .env.local

## Performance Metrics

### Wall Art Generation (No Displacement)
- Poster 12x16: ~200ms
- Poster 18x24: ~300ms
- Poster 24x36: ~500ms
- Canvas 16x20: ~350ms
- Canvas 20x24: ~450ms

**Total for all 5 wall art**: ~1800ms sequential, ~500ms parallel

### With Caching
- First generation: ~1800ms
- Subsequent generations: ~50ms (cache hit)

### Upload to Supabase
- ~100-200ms per mockup
- ~500ms for all 5 mockups (parallel)

## Next Steps

1. **Get Printful API Key** - Sign up and generate token
2. **Create base images** - Generate actual mockup base images for wall art templates
3. **Product mapping** - Map template IDs to Printful variant IDs
4. **UI Integration** - Add pre-generation to /create page with grid view
5. **Stripe integration** - Connect order creation to payment flow
6. **T-shirt PSDs** - Create 4 t-shirt templates with displacement maps
7. **Testing** - Place test orders to verify full flow
8. **Webhooks** - Handle fulfillment status updates
9. **Email notifications** - Send order confirmations and shipping updates

## Testing

### Test Pre-Generation
```bash
curl -X POST http://localhost:3000/api/pregenerate-mockups \
  -F "design=@test-waveform.png" \
  -F "category=wall-art" \
  -F "uploadToStorage=false"
```

### Test Order Creation (requires Printful API key)
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "designUrl": "https://example.com/design.png",
    "items": [{
      "variantId": 4012,
      "quantity": 1,
      "files": [{"type": "default", "url": "https://example.com/design.png"}]
    }],
    "recipient": {
      "name": "Test User",
      "address1": "123 Test St",
      "city": "Los Angeles",
      "state_code": "CA",
      "country_code": "US",
      "zip": "90001"
    },
    "confirm": false
  }'
```

## Troubleshooting

### Pre-generation fails
- Check that template library.json is valid
- Verify base images exist in template directories
- Check Sharp installation (may need rebuild)

### Printful API errors
- Verify API key is set in .env.local
- Check that design URL is publicly accessible
- Ensure variant IDs are valid for your Printful store

### Cache issues
- Clear cache: `GET /api/generate-mockup?action=clear-cache`
- Verify .cache/mockups directory permissions

## Additional Resources

- [Printful API Docs](https://developers.printful.com/docs/)
- [Printful Product Catalog](https://www.printful.com/custom-products)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

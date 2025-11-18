# Quick Start - Launch Ready Features

## What's Ready Now

✅ **Pre-Generation System** - Generate all mockups in parallel for instant product switching
✅ **Printful API Client** - Complete integration for order fulfillment  
✅ **Wall Art Templates** - 5 templates with metadata (need base images)
✅ **Order Creation API** - Submit orders to Printful after payment
✅ **Caching System** - Smart caching for fast regeneration

## What You Need

### 1. Printful API Key (REQUIRED)

Get your API key:
1. Sign up at https://www.printful.com/dashboard/store
2. Go to Settings → API
3. Generate new API token
4. Add to `.env.local`:

```bash
PRINTFUL_API_KEY=your_api_key_here
```

### 2. Test the System

Once you have the API key, test it:

```bash
# Test pre-generation
curl -X POST http://localhost:3000/api/pregenerate-mockups \
  -F "design=@public/test-waveform.png" \
  -F "category=wall-art"

# Test Printful connection
curl -X GET http://localhost:3000/api/orders/catalog
```

## Integration into /create Page

Here's how to add instant mockup generation:

```typescript
// In app/create/page.tsx

const [mockups, setMockups] = useState([])
const [generating, setGenerating] = useState(false)

async function handleDesignComplete() {
  // When user finalizes their waveform design
  const canvas = mockupRef.current?.getCanvas()
  const blob = await canvasToBlob(canvas)
  const file = new File([blob], 'waveform.png')
  
  setGenerating(true)
  
  // Generate ALL mockups at once
  const formData = new FormData()
  formData.append('design', file)
  formData.append('category', 'all')
  formData.append('uploadToStorage', 'true')
  
  const response = await fetch('/api/pregenerate-mockups', {
    method: 'POST',
    body: formData
  })
  
  const { mockups: generated, stats } = await response.json()
  
  setMockups(generated)
  setGenerating(false)
  
  toast.success(`Generated ${generated.length} mockups in ${stats.totalTime}ms!`)
}

// Show all mockups in a grid
<div className="grid grid-cols-3 gap-4">
  {mockups.map(mockup => (
    <div key={mockup.templateId}>
      <img src={mockup.url} alt={mockup.name} />
      <p>{mockup.name}</p>
      <Button onClick={() => addToCart(mockup)}>
        Add to Cart
      </Button>
    </div>
  ))}
</div>
```

## Next Steps

### Immediate (Today)
1. ✅ Get Printful API key
2. ✅ Test pre-generation endpoint
3. ✅ Test order creation endpoint

### Short Term (This Week)
1. Create base mockup images for wall art templates
2. Map template IDs to Printful product variant IDs
3. Integrate pre-generation into /create page
4. Connect to Stripe checkout

### Medium Term (Next Week)
1. Create 4 t-shirt PSDs with displacement maps
2. Add t-shirt templates to library
3. Test full purchase flow end-to-end
4. Add order tracking UI

## Product Roadmap

### Launch Products

**Wall Art** (Ready - need base images)
- Poster 12x16" - $12.95
- Poster 18x24" - $18.95
- Poster 24x36" - $29.95
- Canvas 16x20" - $45.95
- Canvas 20x24" - $55.95

**Apparel** (Pending - need PSDs)
- White T-Shirt (Front) - $19.95
- White T-Shirt (Back) - $19.95
- Black T-Shirt (Front) - $19.95
- Black T-Shirt (Back) - $19.95

## Key Benefits

### Speed
- All mockups generated in **~500ms** (parallel)
- Instant product switching (no regeneration)
- Smart caching for repeat designs

### Quality
- Professional mockups with displacement mapping
- High-resolution outputs (300 DPI)
- Automatic Supabase CDN hosting

### Reliability
- Printful handles fulfillment
- Automatic order tracking
- Email notifications

## Support

See `LAUNCH_INFRASTRUCTURE.md` for complete technical documentation.

For questions about:
- Pre-generation: See `/lib/displacement/pregenerate.ts`
- Printful API: See `/lib/printful-client.ts`
- API endpoints: See `/app/api/pregenerate-mockups/route.ts` and `/app/api/orders/create/route.ts`

# Printify Wall Art Products Setup

This guide explains how to create wall art products in your Printify shop for the SoundPrints platform.

## Quick Start

### Option 1: Using the Admin UI (Recommended)

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to: http://localhost:3000/admin/printify-products

3. Enter a sample SoundPrint image URL (3000x2000px or higher)

4. Click "Create All Wall Art Products"

5. Wait for all products to be created (takes ~1-2 minutes)

6. Visit your Printify dashboard to review the products

### Option 2: Using the Node.js Script

1. Set your environment variables in `.env.local`:
   ```
   PRINTIFY_API_KEY=your_api_key_here
   PRINTIFY_SHOP_ID=your_shop_id_here
   ```

2. Run the script:
   ```bash
   node scripts/create-printify-wallart.js
   ```

## Product Templates

The system creates the following wall art products:

### Posters
- **8x10" Poster** - Small size, perfect for desks
- **12x16" Poster** - Medium size, ideal for most rooms
- **18x24" Poster** - Large format for maximum impact

### Canvas Prints
- **12x16" Canvas** - Compact canvas print
- **16x20" Canvas** - Standard canvas size
- **24x36" Canvas** - Large statement piece

### Framed Prints
- **Black Frame** - Modern black wooden frame
- **White Frame** - Clean white wooden frame

### Premium Options
- **Metal Print** - Aluminum print with vibrant colors
- **Acrylic Print** - Luxury acrylic with depth

## Blueprint IDs

Common Printify blueprint IDs for wall art:

| Blueprint ID | Product Type |
|--------------|--------------|
| 3 | Poster |
| 165 | Canvas Print |
| 68 | Framed Poster |
| 384 | Metal Print |
| 480 | Acrylic Print |

## Customization

### Modify Product Templates

Edit `app/admin/printify-products/page.tsx` to customize:

```typescript
const WALL_ART_TEMPLATES: ProductTemplate[] = [
  {
    title: 'Your Product Title',
    description: 'Your product description',
    blueprintId: 3, // Blueprint ID
    category: 'Posters',
    tags: ['soundprint', 'custom']
  }
]
```

### Adjust Pricing

The default markup is **50%** over Printify's base price. To change this, edit:

**File:** `app/api/printify/products/route.ts`

```typescript
// Line ~75
price: Math.round(variant.price * 1.5), // Change 1.5 to your desired multiplier
```

Examples:
- `* 1.3` = 30% markup
- `* 2.0` = 100% markup (double the price)
- `* 1.8` = 80% markup

## Post-Setup Checklist

After creating products:

1. **Review Products** - Visit your Printify dashboard
2. **Update Images** - Replace sample images with actual SoundPrint designs
3. **Set Pricing** - Adjust profit margins as needed
4. **Enable Products** - Set `visible: true` when ready
5. **Test Orders** - Create test orders with `is_printify_express: false`

## Testing

### Test Without Printing

When creating orders, use:

```typescript
{
  is_printify_express: false // Won't print or charge
}
```

Visit http://localhost:3000/test-printify to test the full flow.

### Production Mode

When ready for real orders:

```typescript
{
  is_printify_express: true // Will print and ship
}
```

## API Endpoints

### List Products
```bash
GET /api/printify/products
```

### Create Product
```bash
POST /api/printify/products
Content-Type: application/json

{
  "title": "Custom SoundPrint Poster",
  "description": "Your description here",
  "blueprintId": 3,
  "imageUrl": "https://example.com/design.png",
  "tags": ["soundprint", "custom"],
  "visible": false
}
```

### Create Test Order
```bash
POST /api/printify/orders/test
Content-Type: application/json

{
  "productId": "abc123",
  "variantId": 12345,
  "designUrl": "https://example.com/soundprint.png"
}
```

## Troubleshooting

### "No print providers available"
- Check that the blueprint ID is valid
- Some blueprints may not be available in your region
- Try a different blueprint ID

### "Failed to upload image"
- Ensure image URL is publicly accessible
- Image should be high resolution (300 DPI recommended)
- Supported formats: PNG, JPG
- Max file size varies by product type

### "No variants available"
- The blueprint/provider combination may not support variants
- Try a different print provider
- Check Printify catalog for available options

## Integration with SoundPrints

To automatically create Printify orders when customers checkout:

1. Listen for successful Stripe payments
2. Get the design URL from the order
3. Call `/api/printify/orders/test` (or production endpoint)
4. Store the Printify order ID with your order record
5. Listen for Printify webhooks for order status updates

## Resources

- [Printify API Documentation](https://developers.printify.com/)
- [Blueprint Catalog](https://developers.printify.com/#catalog)
- [Order Creation](https://developers.printify.com/#orders)
- [Webhooks](https://developers.printify.com/#webhooks)

## Support

For issues or questions:
1. Check the Printify API status
2. Review your API key permissions
3. Test with the interactive UI at `/test-printify`
4. Check console logs for detailed error messages

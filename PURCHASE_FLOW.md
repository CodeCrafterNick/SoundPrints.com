# Purchase Flow Implementation

Complete e-commerce purchase flow for SoundPrints.com with Stripe payment and Printful fulfillment.

## Overview

The purchase flow handles the complete customer journey from cart to order confirmation:

1. **Cart Management** - Client-side cart with server validation
2. **Checkout** - Shipping information collection
3. **Payment** - Stripe Checkout session
4. **Order Creation** - Store order in database
5. **Fulfillment** - Submit to Printful for production
6. **Tracking** - Webhook updates for order status

## Architecture

### API Endpoints

#### Cart Management
- **POST /api/cart/validate** - Validate cart items and calculate totals
  - Input: `{ items: CartItem[] }`
  - Output: `{ valid, itemCount, subtotal, tax, shipping, total }`
  - Tax: 8% of subtotal
  - Shipping: Free over $50, otherwise $5.99

#### Checkout
- **POST /api/checkout/session** - Create Stripe checkout session
  - Input: `{ items, shippingInfo, designUrls }`
  - Output: `{ sessionId, url, orderId }`
  - Creates order record with `pending` status
  - Redirects to Stripe hosted checkout

#### Webhooks
- **POST /api/webhooks/stripe** - Handle Stripe payment events
  - Event: `checkout.session.completed` → Update order to `paid`, submit to Printful
  - Event: `payment_intent.payment_failed` → Update order to `payment_failed`
  - Requires: `STRIPE_WEBHOOK_SECRET` env var

- **POST /api/webhooks/printful** - Handle Printful fulfillment events
  - Event: `package_shipped` → Update order to `shipped`, save tracking info
  - Event: `order_failed` → Update order to `failed`
  - Event: `order_canceled` → Update order to `canceled`
  - Event: `package_returned` → Update order to `returned`

#### Orders
- **GET /api/orders** - List orders (with optional email filter)
  - Query params: `email`, `limit`, `offset`
  - Output: `{ orders: Order[], total, limit, offset }`

- **GET /api/orders/[id]** - Get single order details
  - Output: `{ order: Order }`

### Database Schema

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Customer info
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Order data
  items JSONB NOT NULL,
  design_urls JSONB,
  
  -- Pricing
  cost_subtotal DECIMAL(10, 2) NOT NULL,
  cost_tax DECIMAL(10, 2) NOT NULL,
  cost_shipping DECIMAL(10, 2) NOT NULL,
  cost_total DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  stripe_session_id VARCHAR(255),
  stripe_payment_intent VARCHAR(255),
  
  -- Fulfillment
  printful_order_id INTEGER,
  tracking_number VARCHAR(255),
  tracking_url TEXT,
  
  -- Metadata
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Order Status Flow

```
pending → paid → submitted → processing → shipped → delivered
           ↓
     payment_failed
     
submitted → failed
         → canceled
         
shipped → returned
```

- **pending**: Order created, awaiting payment
- **paid**: Payment confirmed via Stripe
- **submitted**: Order sent to Printful for production
- **processing**: Printful is producing the order
- **shipped**: Package has been shipped (has tracking info)
- **delivered**: Package delivered to customer
- **payment_failed**: Payment failed or declined
- **failed**: Fulfillment failed
- **canceled**: Order was canceled
- **returned**: Package was returned

## Setup

### 1. Database Setup

Run the orders table migration:

```bash
# Connect to Supabase
psql YOUR_SUPABASE_CONNECTION_STRING

# Run migration
\i supabase/orders-table.sql
```

Or use Supabase dashboard:
1. Go to SQL Editor
2. Paste contents of `supabase/orders-table.sql`
3. Run the query

### 2. Environment Variables

Add to `.env.local`:

```bash
# Stripe (already configured)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Printful
PRINTFUL_API_KEY=your_printful_api_key

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Stripe Webhook Setup

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Printful Webhook Setup

1. Go to https://www.printful.com/dashboard/webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/printful`
3. Select events:
   - Package shipped
   - Order failed
   - Order canceled
   - Package returned

### 5. Printful Product Mapping

Update `lib/product-catalog.ts` with Printful variant IDs:

```typescript
{
  templateId: 'poster-12x16',
  printfulVariantId: 1234, // Get from Printful API
  // ... rest of product info
}
```

To get variant IDs:
```bash
curl -X GET "https://api.printful.com/products" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## User Flow

### 1. Create Design
- User uploads audio on `/create` page
- Customizes waveform (color, style, background)
- Clicks "Generate All Products"
- Pre-generation creates 5 mockups (~500ms)

### 2. Add to Cart
- User views products in grid
- Clicks "Add to Cart" for desired products
- Cart stored in Zustand (client-side)
- Cart badge updates with item count

### 3. View Cart
- Click cart icon to open cart dialog
- Shows all items with thumbnails
- Edit quantities or remove items
- "Proceed to Checkout" button

### 4. Checkout
- Fill shipping form (name, email, address)
- Click "Complete Order"
- POST to `/api/checkout/session`
  - Creates order record in database
  - Creates Stripe checkout session
  - Redirects to Stripe hosted checkout

### 5. Payment
- User enters payment details on Stripe
- Stripe processes payment
- On success: redirects to order confirmation
- On cancel: redirects back to checkout

### 6. Order Confirmation
- Stripe webhook fires `checkout.session.completed`
- Webhook updates order to `paid`
- Webhook submits order to Printful
- Order status updated to `submitted`
- User sees confirmation page with order details

### 7. Fulfillment
- Printful produces the order
- Status updates via webhooks
- When shipped: tracking info added to order
- Customer receives email with tracking (future: email integration)

### 8. Tracking
- User can view order status on confirmation page
- Tracking link provided when available
- Status updates automatically via webhooks

## Testing

### Test Cart Validation

```bash
curl -X POST http://localhost:3000/api/cart/validate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "templateId": "poster-12x16",
        "productType": "poster",
        "size": "12x16",
        "price": 12.95,
        "quantity": 1
      }
    ]
  }'
```

Expected output:
```json
{
  "valid": true,
  "itemCount": 1,
  "subtotal": "12.95",
  "tax": "1.04",
  "shipping": "5.99",
  "total": "19.98"
}
```

### Test Stripe Webhook Locally

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

### Test Full Flow (Manual)

1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/create
3. Upload audio file
4. Customize waveform
5. Click "Generate All Products"
6. Add products to cart
7. Click cart icon, verify items
8. Click "Proceed to Checkout"
9. Fill shipping form
10. Use Stripe test card: `4242 4242 4242 4242`
11. Complete payment
12. Verify redirect to order confirmation
13. Check database for order record
14. Check Printful for submitted order

## Stripe Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

Any future expiry date, any 3-digit CVC, any ZIP code.

## Files Created

### API Routes
- `/app/api/cart/route.ts` - Cart validation
- `/app/api/checkout/session/route.ts` - Create Stripe session
- `/app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `/app/api/webhooks/printful/route.ts` - Printful webhook handler
- `/app/api/orders/route.ts` - List orders
- `/app/api/orders/[id]/route.ts` - Get single order

### Pages
- `/app/order-confirmation/page.tsx` - Enhanced confirmation page with order details

### Database
- `/supabase/orders-table.sql` - Orders table schema and RLS policies

### Documentation
- `/PURCHASE_FLOW.md` - This file

## Integration Checklist

- [ ] Run database migration (`orders-table.sql`)
- [ ] Add environment variables to `.env.local`
- [ ] Set up Stripe webhook endpoint
- [ ] Set up Printful webhook endpoint
- [ ] Map Printful variant IDs in product catalog
- [ ] Test cart validation endpoint
- [ ] Test checkout session creation
- [ ] Test Stripe webhook with test events
- [ ] Test full purchase flow with test card
- [ ] Verify order creation in database
- [ ] Verify Printful order submission (requires API key)
- [ ] Test webhook updates (shipping, tracking)
- [ ] Set up email notifications (future)

## Next Steps

1. **Get Printful API Key**
   - Sign up at https://www.printful.com/
   - Go to Settings → API Access
   - Generate API key
   - Add to `.env.local`

2. **Map Product Variants**
   - Use Printful API to get variant IDs for each product
   - Update `lib/product-catalog.ts`

3. **Test End-to-End**
   - Complete full purchase flow
   - Verify order in database
   - Verify order in Printful dashboard

4. **Email Notifications** (Future)
   - Integrate SendGrid or Resend
   - Send order confirmation email
   - Send shipping notification email
   - Send delivery confirmation email

5. **Admin Dashboard** (Future)
   - View all orders
   - Filter by status
   - Manual order management
   - Customer support tools

## Troubleshooting

### Order not created in database
- Check Supabase connection
- Verify `orders` table exists
- Check RLS policies allow inserts

### Stripe webhook not firing
- Verify webhook secret in `.env.local`
- Check webhook endpoint is accessible
- Use Stripe CLI for local testing
- Check Stripe dashboard webhook logs

### Printful order not submitted
- Verify Printful API key is set
- Check variant IDs are correct
- Look for errors in webhook handler logs
- Test API key with Printful API directly

### Order status not updating
- Check webhook endpoints are accessible
- Verify webhook signatures are valid
- Check database update permissions
- Look for errors in server logs

## Support

For issues or questions:
1. Check server logs for errors
2. Verify all environment variables are set
3. Test webhooks with CLI tools
4. Check Stripe/Printful dashboard logs
5. Review database for order records

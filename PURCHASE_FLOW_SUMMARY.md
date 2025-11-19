# Purchase Flow Routes - Implementation Summary

## Created Files

### API Routes (6 files)

1. **`/app/api/cart/route.ts`** (60 lines)
   - GET /api/cart - Returns info about client-side cart storage
   - POST /api/cart/validate - Validates cart items and calculates totals
   - Pricing: 8% tax, $5.99 shipping (free over $50)

2. **`/app/api/checkout/session/route.ts`** (140 lines)
   - POST /api/checkout/session - Creates Stripe checkout session
   - Accepts: items, shippingInfo, designUrls
   - Creates order record in database with 'pending' status
   - Returns: sessionId, url (Stripe checkout URL), orderId

3. **`/app/api/webhooks/stripe/route.ts`** (175 lines)
   - POST /api/webhooks/stripe - Handles Stripe webhook events
   - `checkout.session.completed`: Updates order to 'paid', submits to Printful
   - `payment_intent.payment_failed`: Updates order to 'payment_failed'
   - Automatically submits orders to Printful when payment succeeds

4. **`/app/api/webhooks/printful/route.ts`** (135 lines)
   - POST /api/webhooks/printful - Handles Printful webhook events
   - `package_shipped`: Updates order to 'shipped', saves tracking info
   - `order_failed`: Updates order to 'failed'
   - `order_canceled`: Updates order to 'canceled'
   - `package_returned`: Updates order to 'returned'

5. **`/app/api/orders/route.ts`** (MODIFIED - 70 lines)
   - GET /api/orders - Lists orders with optional email filter
   - Query params: email, limit (default 50), offset (default 0)
   - Returns: orders array, total count, pagination info

6. **`/app/api/orders/[id]/route.ts`** (64 lines)
   - GET /api/orders/[id] - Gets single order details by ID
   - Parses JSON fields (shipping_address, items, design_urls)
   - Returns formatted order object

### Pages

7. **`/app/order-confirmation/page.tsx`** (MODIFIED - ~250 lines)
   - Enhanced with order details fetching
   - Shows order status with dynamic icons
   - Displays order items, pricing breakdown, shipping info
   - Shows tracking information when available
   - Loading and error states
   - Responsive design with animations

### Database

8. **`/supabase/orders-table.sql`** (73 lines)
   - Complete orders table schema
   - Fields: id, status, recipient info, items, pricing, payment IDs, fulfillment IDs
   - Indexes on email, status, created_at, payment_intent, printful_order_id
   - Auto-update timestamp trigger
   - Row Level Security (RLS) policies

### Documentation

9. **`/PURCHASE_FLOW.md`** (430 lines)
   - Complete purchase flow documentation
   - Architecture overview with all endpoints
   - Database schema details
   - Order status flow diagram
   - Setup instructions (database, env vars, webhooks)
   - User flow walkthrough (8 steps)
   - Testing instructions with curl examples
   - Stripe test cards
   - Integration checklist
   - Troubleshooting guide

## Complete Purchase Flow

### User Journey

```
1. Create Design
   ↓ Upload audio, customize waveform, generate mockups
   
2. Add to Cart
   ↓ Select products, add to cart (client-side Zustand store)
   
3. View Cart
   ↓ Review items, quantities, pricing
   
4. Checkout
   ↓ Fill shipping form
   ↓ POST /api/checkout/session
   ↓ Creates order record (status: pending)
   ↓ Creates Stripe session
   
5. Payment (Stripe)
   ↓ Enter card details on Stripe hosted page
   ↓ Stripe processes payment
   ↓ Webhook: checkout.session.completed
   
6. Order Processing
   ↓ Webhook updates order (status: paid)
   ↓ Webhook submits to Printful (status: submitted)
   
7. Fulfillment (Printful)
   ↓ Printful produces order
   ↓ Webhook: package_shipped (status: shipped)
   ↓ Tracking info saved
   
8. Confirmation
   ↓ User redirected to /order-confirmation
   ↓ View order details, tracking info
```

### Backend Flow

```
POST /api/checkout/session
  ↓ Calculate totals
  ↓ Create Stripe line items
  ↓ Insert order in database (pending)
  ↓ Create Stripe checkout session
  ↓ Return session URL
  
Stripe Webhook: checkout.session.completed
  ↓ Verify webhook signature
  ↓ Update order (paid)
  ↓ Upload design to Printful CDN
  ↓ Build Printful order object
  ↓ Submit order to Printful
  ↓ Update order (submitted, printful_order_id)
  
Printful Webhook: package_shipped
  ↓ Find order by printful_order_id
  ↓ Update order (shipped, tracking_number, tracking_url)
  
GET /api/orders/[id]
  ↓ Fetch order from database
  ↓ Parse JSON fields
  ↓ Return order details
```

## Order Status Flow

```
pending → paid → submitted → processing → shipped → delivered
           ↓
     payment_failed
     
submitted → failed
         → canceled
         
shipped → returned
```

## Environment Variables Required

```bash
# Existing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# New (need to add)
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe webhook setup
PRINTFUL_API_KEY=...             # From Printful dashboard
```

## Setup Checklist

- [ ] Run database migration: `supabase/orders-table.sql`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.local`
- [ ] Add `PRINTFUL_API_KEY` to `.env.local`
- [ ] Set up Stripe webhook endpoint
  - URL: `https://your-domain.com/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `payment_intent.payment_failed`
- [ ] Set up Printful webhook endpoint
  - URL: `https://your-domain.com/api/webhooks/printful`
  - Events: package_shipped, order_failed, order_canceled, package_returned
- [ ] Map Printful variant IDs in `lib/product-catalog.ts`
- [ ] Test cart validation endpoint
- [ ] Test checkout session creation
- [ ] Test Stripe webhook (use Stripe CLI)
- [ ] Test full purchase flow with test card (4242 4242 4242 4242)
- [ ] Verify order creation in database
- [ ] Verify Printful order submission

## Testing Commands

### Test Cart Validation
```bash
curl -X POST http://localhost:3000/api/cart/validate \
  -H "Content-Type: application/json" \
  -d '{"items":[{"templateId":"poster-12x16","productType":"poster","size":"12x16","price":12.95,"quantity":1}]}'
```

### Test Stripe Webhook Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

## Integration Points

### Existing Code
- Cart store: `lib/stores/cart-store.ts` (already exists)
- Checkout page: `app/checkout/page.tsx` (needs update to use new session endpoint)
- Stripe client: `lib/stripe.ts` (already configured)
- Supabase client: `lib/supabase.ts` (already configured)
- Printful client: `lib/printful-client.ts` (already exists)

### New Code
- All API routes for cart, checkout, webhooks, orders
- Enhanced order confirmation page with live order details
- Database schema for orders table

## Next Steps

1. **Database Setup**
   - Run the migration in Supabase SQL editor
   - Verify table and indexes are created

2. **Get Printful API Key**
   - Sign up at printful.com
   - Generate API token in dashboard
   - Add to `.env.local`

3. **Set Up Webhooks**
   - Configure Stripe webhook endpoint
   - Configure Printful webhook endpoint
   - Test with CLI tools

4. **Map Product Variants**
   - Get Printful variant IDs for wall art products
   - Update `lib/product-catalog.ts`

5. **Update Checkout Page**
   - Modify to use new `/api/checkout/session` endpoint
   - Remove old order creation logic
   - Test complete flow

6. **Test End-to-End**
   - Upload audio → customize → generate mockups
   - Add to cart → checkout → payment
   - Verify order in database
   - Verify order in Printful (if API key is set)

## Files Modified

- `/app/api/orders/route.ts` - Replaced with GET endpoint for listing orders
- `/app/order-confirmation/page.tsx` - Enhanced with live order fetching and details

## API Documentation

### POST /api/cart/validate
**Request:**
```json
{
  "items": [
    {
      "templateId": "poster-12x16",
      "productType": "poster",
      "size": "12x16",
      "price": 12.95,
      "quantity": 1
    }
  ]
}
```

**Response:**
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

### POST /api/checkout/session
**Request:**
```json
{
  "items": [...],
  "shippingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "designUrls": {
    "poster-12x16": "https://..."
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "orderId": 1
}
```

### GET /api/orders
**Query Params:**
- `email` (optional): Filter by customer email
- `limit` (optional): Number of results (default 50)
- `offset` (optional): Pagination offset (default 0)

**Response:**
```json
{
  "orders": [...],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

### GET /api/orders/[id]
**Response:**
```json
{
  "order": {
    "id": 1,
    "status": "paid",
    "recipient_name": "John Doe",
    "recipient_email": "john@example.com",
    "shipping_address": {...},
    "items": [...],
    "cost_subtotal": 12.95,
    "cost_tax": 1.04,
    "cost_shipping": 5.99,
    "cost_total": 19.98,
    "tracking_number": null,
    "tracking_url": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## Summary

Complete purchase flow implemented with:
- ✅ Cart validation with pricing calculation
- ✅ Stripe checkout session creation
- ✅ Order creation in database
- ✅ Stripe webhook handling (payment confirmation)
- ✅ Printful webhook handling (fulfillment updates)
- ✅ Order listing and detail endpoints
- ✅ Enhanced order confirmation page
- ✅ Complete database schema with RLS
- ✅ Comprehensive documentation

**Ready for:** Database setup, webhook configuration, and end-to-end testing

**Pending:** Printful API key, webhook endpoints configuration, product variant mapping

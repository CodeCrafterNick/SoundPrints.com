# SoundPrints

Transform your favorite audio moments into beautiful custom prints on posters, apparel, and more.

## Features

- 🎵 **Audio Upload** - Support for MP3, WAV, FLAC, M4A, and OGG files
- 🎨 **Waveform Customization** - Choose colors, select audio regions, and personalize your design
- 🖼️ **Product Selection** - Print on posters, t-shirts, mugs, canvas, and hoodies
- 🛒 **Shopping Cart** - Full e-commerce functionality with cart management
- 💳 **Stripe Integration** - Secure payment processing
- 📦 **Order Management** - Database-backed order tracking
- 🎯 **Real-time Preview** - See your design update as you customize
- 📱 **Mobile Responsive** - Works beautifully on all devices

## Tech Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Audio Visualization**: WaveSurfer.js v7
- **State Management**: Zustand with localStorage persistence
- **Animation**: Framer Motion
- **Payments**: Stripe with React Stripe.js
- **Database**: PostgreSQL with Drizzle ORM (Supabase)
- **Storage**: Supabase Storage for audio and print files
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works)
- Stripe account (test mode)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SoundPrints.com
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Database Setup

1. Run database migrations:
```bash
pnpm drizzle-kit push
```

2. Set up Supabase Storage buckets:
   - Create `audio-files` bucket (public)
   - Create `print-files` bucket (public)

### Development

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── create-payment-intent/  # Stripe payment intent
│   │   └── orders/             # Order creation
│   ├── checkout/               # Checkout page
│   ├── create/                 # Product customizer
│   ├── order-confirmation/     # Success page
│   └── page.tsx                # Homepage
├── components/
│   ├── cart/                   # Shopping cart dialog
│   ├── checkout/               # Stripe payment form
│   ├── customizer/             # Audio upload, waveform editor, colors
│   ├── products/               # Product selector, mockup, showcase
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── db/                     # Database schema and client
│   ├── stores/                 # Zustand state stores
│   ├── stripe.ts               # Stripe utilities
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Helper functions
└── drizzle.config.ts           # Drizzle ORM configuration
```

## User Workflow

1. **Upload Audio** - Drag and drop or select an audio file (up to 50MB)
2. **Edit Waveform** - Select a specific region of the audio to visualize
3. **Customize Colors** - Choose waveform and background colors with color picker
4. **Choose Product** - Select from 5 products (poster, t-shirt, mug, canvas, hoodie)
5. **Add to Cart** - Review your design and add to shopping cart
6. **Checkout** - Enter shipping information
7. **Payment** - Complete secure payment via Stripe
8. **Confirmation** - Receive order confirmation

## Database Schema

- **users** - User accounts
- **orders** - Order records with status tracking
- **order_items** - Individual items in each order
- **audio_files** - Uploaded audio file metadata

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Migrations

Run migrations in production:
```bash
pnpm drizzle-kit push
```

### Stripe Webhooks

Set up webhook endpoint in Stripe Dashboard:
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Roadmap

- [x] Audio upload and waveform visualization
- [x] Color customization with picker
- [x] Product selection (5 products, multiple sizes)
- [x] Shopping cart with persistence
- [x] Stripe payment integration
- [x] Database schema and order management
- [x] Real-time product preview with canvas
- [x] Toast notifications
- [x] Checkout flow
- [ ] User authentication (Clerk/NextAuth)
- [ ] High-resolution waveform export (300 DPI)
- [ ] Print fulfillment integration (Printful/Gelato)
- [ ] User dashboard with order history
- [ ] Email notifications (SendGrid/Resend)
- [ ] Admin panel for order management

## License

MIT License - feel free to use this project for your own purposes.

#!/bin/bash

# SoundPrints.com Purchase Flow - Quick Setup Guide
# Run this after deploying to check your setup

echo "🎨 SoundPrints.com Purchase Flow Setup Checklist"
echo "================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    echo "   Create it with: cp .env.example .env.local"
    exit 1
fi

echo "✅ .env.local file exists"
echo ""

# Check required environment variables
echo "📋 Checking Environment Variables:"
echo "-----------------------------------"

check_env() {
    if grep -q "^$1=" .env.local; then
        value=$(grep "^$1=" .env.local | cut -d '=' -f2)
        if [ -z "$value" ] || [ "$value" = "your_key_here" ] || [ "$value" = "..." ]; then
            echo "⚠️  $1 - Set but needs value"
            return 1
        else
            echo "✅ $1 - Configured"
            return 0
        fi
    else
        echo "❌ $1 - Missing"
        return 1
    fi
}

# Required variables
check_env "STRIPE_SECRET_KEY"
check_env "STRIPE_PUBLISHABLE_KEY"
check_env "STRIPE_WEBHOOK_SECRET"
check_env "PRINTFUL_API_KEY"
check_env "NEXT_PUBLIC_SUPABASE_URL"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo "📊 Database Setup:"
echo "------------------"
echo "⏳ Run supabase/orders-table.sql in Supabase SQL Editor"
echo "   https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
echo ""

echo "🔗 Webhook Setup:"
echo "-----------------"
echo "Stripe Webhooks:"
echo "  1. Go to https://dashboard.stripe.com/webhooks"
echo "  2. Add endpoint: https://your-domain.com/api/webhooks/stripe"
echo "  3. Select events:"
echo "     - checkout.session.completed"
echo "     - payment_intent.payment_failed"
echo "  4. Copy webhook secret to STRIPE_WEBHOOK_SECRET in .env.local"
echo ""
echo "Printful Webhooks:"
echo "  1. Go to https://www.printful.com/dashboard/webhooks"
echo "  2. Add webhook: https://your-domain.com/api/webhooks/printful"
echo "  3. Select events:"
echo "     - Package shipped"
echo "     - Order failed"
echo "     - Order canceled"
echo "     - Package returned"
echo ""

echo "🧪 Testing:"
echo "----------"
echo "Local Testing:"
echo "  # Test cart validation"
echo '  curl -X POST http://localhost:3000/api/cart/validate \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '"'"'{"items":[{"templateId":"poster-12x16","productType":"poster","size":"12x16","price":12.95,"quantity":1}]}'"'"
echo ""
echo "  # Test Stripe webhooks locally"
echo "  brew install stripe/stripe-cli/stripe"
echo "  stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo "  stripe trigger checkout.session.completed"
echo ""

echo "🎯 Product Setup:"
echo "-----------------"
echo "⏳ Map Printful variant IDs in lib/product-catalog.ts"
echo "   Get variant IDs from Printful API or dashboard"
echo ""

echo "🚀 Next Steps:"
echo "--------------"
echo "1. Run database migration (supabase/orders-table.sql)"
echo "2. Configure webhook endpoints in Stripe and Printful"
echo "3. Map Printful variant IDs to products"
echo "4. Test cart validation endpoint"
echo "5. Test checkout session creation"
echo "6. Test full purchase flow with Stripe test card: 4242 4242 4242 4242"
echo "7. Verify order creation in database"
echo "8. Verify order submission to Printful"
echo ""

echo "📚 Documentation:"
echo "-----------------"
echo "- PURCHASE_FLOW.md - Complete technical documentation"
echo "- PURCHASE_FLOW_SUMMARY.md - Quick reference guide"
echo ""

echo "✨ Setup checklist complete!"
echo ""

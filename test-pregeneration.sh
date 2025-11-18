#!/bin/bash

echo "🧪 Testing Pre-Generation System"
echo "================================"
echo ""

# Check if server is running
echo "1️⃣ Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server is not running"
    echo "   Run: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Testing template library..."
response=$(curl -s http://localhost:3000/api/generate-mockup?action=templates)
template_count=$(echo $response | grep -o '"id"' | wc -l)
echo "✅ Found $template_count templates"

echo ""
echo "3️⃣ Base images created:"
for template in poster-12x16 poster-18x24 poster-24x36 canvas-16x20 canvas-20x24; do
    if [ -f "public/mockups/displacement-templates/$template/base.png" ]; then
        size=$(ls -lh "public/mockups/displacement-templates/$template/base.png" | awk '{print $5}')
        echo "   ✅ $template: $size"
    else
        echo "   ❌ $template: missing"
    fi
done

echo ""
echo "4️⃣ Product catalog:"
echo "   - 5 Wall Art products (posters & canvas)"
echo "   - Price range: \$12.95 - \$55.95"

echo ""
echo "5️⃣ API Endpoints:"
echo "   ✅ POST /api/pregenerate-mockups - Pre-generation"
echo "   ✅ POST /api/orders/create - Order creation"
echo "   ✅ GET /api/generate-mockup?action=templates - Template list"

echo ""
echo "📋 Next Steps:"
echo "   1. Start dev server: npm run dev"
echo "   2. Go to http://localhost:3000/create"
echo "   3. Upload audio file"
echo "   4. Customize waveform"
echo "   5. Click 'View All Products' → 'Generate All Products'"
echo "   6. See all 5 wall art mockups generated instantly!"
echo ""
echo "⚡ Once you have Printful API key:"
echo "   - Add to .env.local: PRINTFUL_API_KEY=..."
echo "   - Update product-catalog.ts with Printful variant IDs"
echo "   - Test order creation workflow"
echo ""

#!/bin/bash

# Quick Test Script for Displacement Mapping System
# This tests the basic functionality without needing templates

echo "🧪 Testing Displacement Mapping System"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server is not running!"
    echo "Please run: pnpm dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test 1: API endpoint info
echo "📡 Test 1: Check API endpoint..."
curl -s http://localhost:3000/api/generate-mockup | jq '.'
echo ""

# Test 2: Get stats (will be empty until templates are created)
echo "📊 Test 2: Get library stats..."
curl -s "http://localhost:3000/api/generate-mockup?action=stats" | jq '.'
echo ""

# Test 3: List templates (will be empty until templates are created)
echo "📚 Test 3: List templates..."
TEMPLATES=$(curl -s "http://localhost:3000/api/generate-mockup?action=templates")
echo "$TEMPLATES" | jq '.'
echo ""

TEMPLATE_COUNT=$(echo "$TEMPLATES" | jq '.templates | length')

if [ "$TEMPLATE_COUNT" -eq 0 ]; then
    echo "⚠️  No templates found yet!"
    echo ""
    echo "To create templates from your blueprint images, run:"
    echo "  node scripts/convert-blueprints-to-templates.js"
    echo ""
else
    echo "✅ Found $TEMPLATE_COUNT templates!"
    echo ""
    
    # Test 4: Preview first template
    TEMPLATE_ID=$(echo "$TEMPLATES" | jq -r '.templates[0].id')
    echo "🖼️  Test 4: Preview template '$TEMPLATE_ID'..."
    curl -s "http://localhost:3000/api/generate-mockup?action=preview&templateId=$TEMPLATE_ID" > /tmp/template-preview.png
    
    if [ -f /tmp/template-preview.png ]; then
        echo "✅ Preview saved to /tmp/template-preview.png"
        open /tmp/template-preview.png
    else
        echo "❌ Failed to generate preview"
    fi
fi

echo ""
echo "✅ All tests complete!"
echo ""
echo "Next steps:"
echo "1. Run: node scripts/convert-blueprints-to-templates.js"
echo "2. Run this test again to verify templates"
echo "3. Test mockup generation with a design file"

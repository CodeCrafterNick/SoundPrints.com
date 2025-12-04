'use client'

import { useState, useMemo } from 'react'
import { Calculator, Package, Truck, Clock, BadgePercent, ShoppingCart } from 'lucide-react'

interface ProductOption {
  id: string
  name: string
  basePrice: number
}

const products: ProductOption[] = [
  { id: 'tshirt', name: 'Premium T-Shirt', basePrice: 29.99 },
  { id: 'hoodie', name: 'Pullover Hoodie', basePrice: 54.99 },
  { id: 'poster', name: 'Art Print (18x24)', basePrice: 39.99 },
  { id: 'canvas', name: 'Canvas Print', basePrice: 79.99 },
  { id: 'mug', name: 'Ceramic Mug', basePrice: 19.99 },
  { id: 'tote', name: 'Canvas Tote Bag', basePrice: 24.99 }
]

const discountTiers = [
  { min: 1, max: 9, discount: 0 },
  { min: 10, max: 49, discount: 10 },
  { min: 50, max: 199, discount: 20 },
  { min: 200, max: 499, discount: 30 },
  { min: 500, max: Infinity, discount: 40 }
]

export function BulkCalculator() {
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [quantity, setQuantity] = useState(50)

  const calculation = useMemo(() => {
    const tier = discountTiers.find(t => quantity >= t.min && quantity <= t.max) || discountTiers[0]
    const discountedPrice = selectedProduct.basePrice * (1 - tier.discount / 100)
    const subtotal = discountedPrice * quantity
    const retailTotal = selectedProduct.basePrice * quantity
    const savings = retailTotal - subtotal

    return {
      tier,
      discountedPrice,
      subtotal,
      retailTotal,
      savings
    }
  }, [selectedProduct, quantity])

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-300 mb-4">
            <Calculator className="h-4 w-4" />
            <span className="text-sm font-medium">Bulk Order Calculator</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Calculate Your Savings</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            See how much you save with our volume discounts. The more you order, the more you save.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calculator Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Product
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedProduct.id === product.id
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className={`text-xs ${selectedProduct.id === product.id ? 'text-rose-200' : 'text-gray-400'}`}>
                        ${product.basePrice.toFixed(2)} retail
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity: <span className="text-rose-400 font-bold">{quantity}</span> units
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>250</span>
                  <span>500</span>
                  <span>750</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Quick Quantity Buttons */}
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50, 100, 250, 500].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setQuantity(qty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      quantity === qty
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>

              {/* Discount Tier Indicator */}
              <div className="p-4 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <div className="flex items-center gap-3">
                  <BadgePercent className="h-8 w-8 text-rose-400" />
                  <div>
                    <div className="text-sm text-rose-300">Your Discount Tier</div>
                    <div className="text-2xl font-bold text-white">{calculation.tier.discount}% OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl p-8 text-gray-900">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-rose-500" />
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Product</span>
                  <span className="font-medium">{selectedProduct.name}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Retail Price</span>
                  <span className="font-medium">${selectedProduct.basePrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Your Price</span>
                  <span className="font-medium text-rose-500">${calculation.discountedPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{quantity} units</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Retail Total</span>
                  <span className="text-gray-400 line-through">${calculation.retailTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-lg pt-2">
                  <span className="font-semibold">Your Total</span>
                  <span className="font-bold text-gray-900">${calculation.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-green-600">Total Savings</div>
                  <div className="text-3xl font-bold text-green-600">${calculation.savings.toFixed(2)}</div>
                </div>
              </div>

              <button className="w-full mt-6 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
                Request Quote
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Package className="h-5 w-5" />, label: 'Free packaging' },
                { icon: <Truck className="h-5 w-5" />, label: 'Bulk shipping' },
                { icon: <Clock className="h-5 w-5" />, label: 'Fast production' }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="inline-flex p-2 bg-rose-500/20 rounded-lg text-rose-400 mb-2">
                    {benefit.icon}
                  </div>
                  <div className="text-sm text-gray-400">{benefit.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function BulkCalculatorCompact() {
  const [quantity, setQuantity] = useState(100)
  
  const discount = useMemo(() => {
    if (quantity >= 500) return 40
    if (quantity >= 200) return 30
    if (quantity >= 50) return 20
    if (quantity >= 10) return 10
    return 0
  }, [quantity])

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Quote Calculator</h3>
      <div className="flex items-center gap-4">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          placeholder="Enter quantity"
        />
        <div className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold">
          {discount}% OFF
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Order {quantity < 10 ? '10+' : quantity < 50 ? '50+' : quantity < 200 ? '200+' : '500+'} units for {quantity < 10 ? '10%' : quantity < 50 ? '20%' : quantity < 200 ? '30%' : '40%'} savings
      </p>
    </div>
  )
}

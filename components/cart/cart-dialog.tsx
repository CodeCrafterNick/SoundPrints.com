'use client'

import { ShoppingCart, X, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function CartDialog() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const getTotal = useCartStore((state) => state.getTotal)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const hasHydrated = useCartStore((state) => state._hasHydrated)
  const isOpen = useCartStore((state) => state.isOpen)
  const setCartOpen = useCartStore((state) => state.setCartOpen)

  const itemCount = getItemCount()
  const total = getTotal()

  return (
    <Dialog open={isOpen} onOpenChange={setCartOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          {hasHydrated && itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
          <DialogDescription>
            {itemCount === 0
              ? 'Your cart is empty'
              : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add some custom SoundPrints to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {/* Product Preview */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No preview
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">
                      {item.productType.replace('-', ' ').toUpperCase()} - {item.size}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.audioFileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                </div>
                <Link href="/checkout" className="block" onClick={() => setCartOpen(false)}>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductType } from './customizer-store'

export interface CartItem {
  id: string
  audioFileName: string
  audioFileUrl?: string
  audioSelectionStart?: number // Start time of selected region in seconds
  audioSelectionEnd?: number   // End time of selected region in seconds
  waveformColor: string
  backgroundColor: string
  productType: ProductType
  size: string
  customText?: string
  price: number
  quantity: number
  thumbnailUrl?: string
  designUrl?: string
  // Printify-specific fields for order fulfillment
  printifyBlueprintId?: string
  printifyVariantId?: string
  waveformStyle?: string
  designPreset?: string
  productColor?: string
  mockupUrl?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  _hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  openCart: () => void
  closeCart: () => void
  setCartOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      setCartOpen: (open) => {
        set({ isOpen: open })
      },

      addItem: (item) => {
        const newItem: CartItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          quantity: 1,
        }
        set((state) => ({
          items: [...state.items, newItem],
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'soundprints-cart',
      // Only persist essential data, exclude large image data URLs and UI state
      partialize: (state) => ({
        items: state.items.map(item => ({
          ...item,
          // Don't persist large image data - use compressed thumbnail only
          designUrl: undefined,
          // Keep thumbnail but ensure it's compressed
          thumbnailUrl: item.thumbnailUrl,
        })),
        // Don't persist modal open state
        isOpen: undefined,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true)
      },
    }
  )
)

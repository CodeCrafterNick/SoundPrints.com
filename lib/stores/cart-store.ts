import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductType } from './customizer-store'

export interface CartItem {
  id: string
  audioFileName: string
  audioFileUrl: string
  waveformColor: string
  backgroundColor: string
  productType: ProductType
  size: string
  customText?: string
  price: number
  quantity: number
  thumbnailUrl?: string
}

interface CartState {
  items: CartItem[]
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
    }
  )
)

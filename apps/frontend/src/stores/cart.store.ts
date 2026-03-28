// src/stores/cart.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  designId: string
  productId: string
  title: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (designId: string) => void
  updateQuantity: (designId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.designId === item.designId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.designId === item.designId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),

      removeItem: (designId) =>
        set((state) => ({
          items: state.items.filter((i) => i.designId !== designId),
        })),

      updateQuantity: (designId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.designId === designId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

// src/app/cart/page.tsx
'use client'

import { useCartStore } from '@/stores/cart.store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <Link
            href="/discover"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const cartTotal = total()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.designId} className="bg-white rounded-lg border border-gray-200 p-6 flex gap-6">
              <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded" />
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">₺{item.price.toLocaleString()}</p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.designId, item.quantity - 1)}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.designId, item.quantity + 1)}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-gray-900 mb-4">
                  ₺{(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  onClick={() => removeItem(item.designId)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₺{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>₺{(cartTotal * 0.1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>₺{(cartTotal * 0.08).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              ₺{(cartTotal * 1.18).toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-3"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={() => router.push('/discover')}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

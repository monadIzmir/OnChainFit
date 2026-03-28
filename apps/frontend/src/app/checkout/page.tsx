// src/app/checkout/page.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart.store'
import { useAuth } from '@/hooks'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '')

interface CheckoutFormProps {
  onSubmit?: (data: any) => void
  loading?: boolean
}

function CheckoutForm({ onSubmit, loading }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { user } = useAuth()
  const { items, total, clearCart } = useCartStore()

  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingZip: '',
    paymentMethod: 'stripe' as 'stripe' | 'monad',
  })

  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    if (formData.paymentMethod === 'stripe' && stripe && elements) {
      try {
        // Create payment intent
        const response = await fetch('/api/payments/stripe/intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            amount: Math.round(total() * 100),
            items: items.map(item => ({
              designId: item.designId,
              quantity: item.quantity,
            })),
            shippingAddress: formData.shippingAddress,
            shippingCity: formData.shippingCity,
            shippingZip: formData.shippingZip,
          }),
        })

        const { clientSecret, orderId } = await response.json()

        // Confirm payment
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: formData.fullName,
              email: formData.email,
            },
          },
        })

        if (paymentResult.paymentIntent?.status === 'succeeded') {
          clearCart()
          router.push(`/order-confirmation/${orderId}`)
        }
      } catch (error) {
        alert(`Payment error: ${(error as Error).message}`)
      }
    }

    setProcessing(false)
  }

  const cartTotal = total()
  const finalTotal = cartTotal * 1.18 // Including tax and shipping

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              required
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.shippingCity}
                onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={formData.shippingZip}
                onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
        <div className="space-y-3">
          <label className="flex items-center p-3 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50">
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={formData.paymentMethod === 'stripe'}
              onChange={(e) => setFormData({ ...formData, paymentMethod: 'stripe' })}
              className="h-4 w-4"
            />
            <span className="ml-3">Credit Card (Stripe)</span>
          </label>

          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
            <input
              type="radio"
              name="payment"
              value="monad"
              onChange={(e) => setFormData({ ...formData, paymentMethod: 'monad' })}
              className="h-4 w-4"
            />
            <span className="ml-3">MONAD Token (Blockchain)</span>
          </label>
        </div>
      </div>

      {/* Card Form */}
      {formData.paymentMethod === 'stripe' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h2>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4 pb-4 border-b border-blue-200">
          <div className="flex justify-between text-gray-700">
            <span>Items ({items.length})</span>
            <span>₺{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping & Tax</span>
            <span>₺{((finalTotal - cartTotal).toFixed(2)).toString()}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">₺{finalTotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
      >
        {processing ? 'Processing...' : `Pay ₺${finalTotal.toLocaleString()}`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { items } = useCartStore()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}

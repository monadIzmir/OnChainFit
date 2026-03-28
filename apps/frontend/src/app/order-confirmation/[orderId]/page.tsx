// src/app/order-confirmation/[orderId]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params?.orderId as string

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your purchase</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono text-lg font-semibold text-gray-900">{orderId?.slice(0, 8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-lg font-semibold text-blue-600">Processing</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
            <p className="text-lg font-semibold text-gray-900">5-7 business days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tracking</p>
            <p className="text-gray-900">Available in 24 hours</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            You&apos;ll receive an email confirmation with tracking details shortly.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Link
          href="/discover"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
        <Link
          href="/dashboard/customer/orders"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View My Orders
        </Link>
      </div>
    </div>
  )
}

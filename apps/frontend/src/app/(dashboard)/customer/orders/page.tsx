// src/app/(dashboard)/customer/orders/page.tsx
'use client'

import { useAuth, useMyOrders } from '@/hooks'
import Link from 'next/link'

export default function OrdersPage() {
  const { isCustomer } = useAuth()
  const { data, isLoading } = useMyOrders()

  if (!isCustomer) {
    return <div className="text-center py-8">Access denied</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : data?.data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet</p>
          <Link href="/discover" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Explore Designs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">{order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-lg text-gray-900">₺{order.totalAmount.toString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

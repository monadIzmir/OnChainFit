// src/app/(dashboard)/designer/earnings/page.tsx
'use client'

import { useAuth } from '@/hooks'

export default function EarningsPage() {
  const { isDesigner } = useAuth()

  if (!isDesigner) {
    return <div className="text-center py-8 text-red-600">Access denied</div>
  }

  const earningsData = [
    { month: 'January', amount: 1200, orders: 8 },
    { month: 'February', amount: 1500, orders: 10 },
    { month: 'March', amount: 800, orders: 5 },
  ]

  const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0)
  const totalOrders = earningsData.reduce((sum, item) => sum + item.orders, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900">₺{totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Payout Balance</p>
          <p className="text-3xl font-bold text-green-600">₺{totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Earnings</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Month</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Orders</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {earningsData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{row.month}</td>
                <td className="px-6 py-4 text-gray-900">{row.orders}</td>
                <td className="px-6 py-4 font-medium text-gray-900">₺{row.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h3>
        <p className="text-gray-600 mb-4">
          Your earnings are automatically paid out on the 1st of each month to your registered bank account.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Update Bank Details
        </button>
      </div>
    </div>
  )
}

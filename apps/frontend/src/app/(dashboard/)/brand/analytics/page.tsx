// src/app/(dashboard)/brand/analytics/page.tsx
'use client'

import { useAuth } from '@/hooks'

export default function AnalyticsPage() {
  const { isBrand } = useAuth()

  if (!isBrand) {
    return <div className="text-center py-8 text-red-600">Access denied</div>
  }

  const analyticsData = [
    { designName: 'Classic T-Shirt', sales: 45, revenue: 3600, designers: 3 },
    { designName: 'Summer Collection', sales: 32, revenue: 2560, designers: 2 },
    { designName: 'Sport Hoodie', sales: 28, revenue: 2800, designers: 4 },
  ]

  const totalSales = analyticsData.reduce((sum, row) => sum + row.sales, 0)
  const totalRevenue = analyticsData.reduce((sum, row) => sum + row.revenue, 0)
  const uniqueDesigners = new Set(analyticsData.flatMap(row => 
    Array(row.designers).fill(0)
  )).size

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">{totalSales}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₺{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Active Designers</p>
          <p className="text-3xl font-bold text-gray-900">9+</p>
        </div>
      </div>

      {/* Sales by Design */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sales by Design</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Design</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Sales</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Revenue</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Designers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {analyticsData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900 font-medium">{row.designName}</td>
                <td className="px-6 py-4 text-gray-900">{row.sales}</td>
                <td className="px-6 py-4 font-medium text-gray-900">₺{row.revenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-900">{row.designers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// src/app/(dashboard)/designer/dashboard/page.tsx
'use client'

import { useApi, useAuth } from '@/hooks'
import Link from 'next/link'

export default function DesignerDashboard() {
  const { isDesigner } = useAuth()
  const { fetchMyDesigns } = useApi()
  const { data, isLoading } = fetchMyDesigns()

  if (!isDesigner) {
    return <div className="text-center py-8">Access denied</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
        <Link
          href="/designer/studio"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Design
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Designs</p>
          <p className="text-3xl font-bold text-gray-900">{data?.data.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-3xl font-bold text-gray-900">
            {data?.data.filter((d: any) => d.status === 'PUBLISHED').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900">₺0.00</p>
        </div>
      </div>

      {/* Designs List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Designs</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : data?.data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No designs yet. Create your first design!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data?.data.map((design: any) => (
              <div key={design.id} className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={design.previewUrl} alt={design.title} className="w-12 h-12 object-cover rounded" />
                  <div>
                    <h3 className="font-medium text-gray-900">{design.title}</h3>
                    <p className="text-sm text-gray-500">
                      {design.product.name} • {design.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₺{design.salePrice}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

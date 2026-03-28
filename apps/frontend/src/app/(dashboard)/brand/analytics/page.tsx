'use client'

import { useAuth, useProducts } from '@/hooks'
import Link from 'next/link'

export default function AnalyticsPage() {
  const { isBrand } = useAuth()
  const { data, isLoading } = useProducts(0, 50)

  if (!isBrand) return <div className="text-center py-20 text-red-600">Erişim reddedildi</div>

  const products = data?.data || []
  const totalDesigns = products.reduce((s: number, p: any) => s + (p._count?.designs ?? p.designs?.length ?? 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Analitik</h1>
      <p className="text-gray-500 mb-8">Platformdaki ürün ve satış performansı</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Ürün Şablonu', value: isLoading ? '...' : products.length, icon: '📦' },
          { label: 'Toplam Tasarım', value: isLoading ? '...' : totalDesigns, icon: '🎨' },
          { label: 'Toplam Satış', value: '0', icon: '🛍️' },
          { label: 'Toplam Gelir', value: '₺0', icon: '💰' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Ürün Bazında Tasarım Sayısı</h2>
          <Link href="/brand/products" className="text-sm text-red-500 hover:underline">Ürünleri Yönet →</Link>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500">Henüz ürün şablonu eklenmemiş</p>
            <Link href="/brand/products" className="inline-block mt-4 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600">
              Ürün Ekle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product: any) => {
              const designCount = product._count?.designs ?? product.designs?.length ?? 0
              return (
                <div key={product.id} className="px-6 py-4 flex items-center gap-4">
                  <img src={product.templateUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-400">{product.category} · ₺{Number(product.basePrice).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{designCount}</p>
                    <p className="text-xs text-gray-400">tasarım</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

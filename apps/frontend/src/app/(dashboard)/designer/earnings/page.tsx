'use client'

import { useAuth } from '@/hooks'
import Link from 'next/link'

export default function EarningsPage() {
  const { isDesigner, user } = useAuth()

  if (!isDesigner) return <div className="text-center py-20 text-red-600">Erişim reddedildi</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Kazançlarım</h1>
      <p className="text-gray-500 mb-8">Satış gelirleri ve ödeme geçmişi</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Bu Ay', value: '₺0', icon: '📅', sub: 'Mart 2026' },
          { label: 'Toplam Kazanç', value: '₺0', icon: '💰', sub: 'Tüm zamanlar' },
          { label: 'Toplam Satış', value: '0', icon: '🛍️', sub: 'Adet' },
          { label: 'Bekleyen Ödeme', value: '₺0', icon: '⏳', sub: 'Onay bekliyor' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Payout info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ödeme Ayarları</h2>
        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
          <span className="text-3xl">🦊</span>
          <div>
            <p className="font-semibold text-gray-900">Monad Testnet Cüzdanı</p>
            <p className="text-sm text-gray-600 mt-1">
              Satışlardan kazandığın tutar otomatik olarak MetaMask cüzdanına transfer edilir.
              Kargo ve vergi düşüldükten sonra kalan net tutar sana yatar.
            </p>
            <p className="text-xs text-gray-400 mt-2">Bağlı hesap: {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Earnings table - empty state */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">İşlem Geçmişi</h2>
        </div>
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500">Henüz satış yok</p>
          <p className="text-sm text-gray-400 mt-1">İlk satışın gerçekleşince burada görünecek</p>
          <Link href="/designer/studio" className="inline-block mt-4 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600">
            Tasarım Yükle
          </Link>
        </div>
      </div>
    </div>
  )
}

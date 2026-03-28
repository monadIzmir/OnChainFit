'use client'

import { useAuth, useMyDesigns } from '@/hooks'
import { apiCall } from '@/lib/api'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Taslak', color: 'bg-gray-100 text-gray-600' },
  PUBLISHED: { label: 'Yayında', color: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-700' },
  REMOVED: { label: 'Kaldırıldı', color: 'bg-red-100 text-red-700' },
}

export default function DesignerDashboard() {
  const { isDesigner, token } = useAuth()
  const { data, isLoading } = useMyDesigns()
  const queryClient = useQueryClient()

  if (!isDesigner) return <div className="text-center py-20 text-red-600">Erişim reddedildi</div>

  const designs = data?.data || []
  const published = designs.filter((d: any) => d.status === 'PUBLISHED').length
  const drafts = designs.filter((d: any) => d.status === 'DRAFT').length

  const handlePublish = async (id: string) => {
    try {
      await apiCall(`/designs/${id}/publish`, { method: 'PUT', token: token ?? undefined })
      await queryClient.invalidateQueries({ queryKey: ['myDesigns'] })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu tasarımı silmek istediğinize emin misiniz?')) return
    try {
      await apiCall(`/designs/${id}`, { method: 'DELETE', token: token ?? undefined })
      await queryClient.invalidateQueries({ queryKey: ['myDesigns'] })
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasarımlarım</h1>
          <p className="text-gray-500 mt-1">Yüklediğin tüm tasarımları yönet</p>
        </div>
        <Link href="/designer/studio" className="px-5 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition">
          + Yeni Tasarım
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Toplam', value: designs.length, icon: '🎨' },
          { label: 'Yayında', value: published, icon: '✅' },
          { label: 'Taslak', value: drafts, icon: '📝' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Designs */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl">
          <p className="text-5xl mb-4">🎨</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">Henüz tasarım yok</p>
          <p className="text-gray-500 mb-6">İlk tasarımını yükle ve satmaya başla</p>
          <Link href="/designer/studio" className="inline-block px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600">
            Tasarım Yükle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designs.map((design: any) => {
            const st = STATUS_LABELS[design.status] || STATUS_LABELS.DRAFT
            return (
              <div key={design.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                <div className="relative overflow-hidden">
                  <img src={design.previewUrl} alt={design.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{design.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{design.product?.name}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">₺{Number(design.salePrice).toLocaleString()}</p>

                  <div className="flex gap-2 mt-3">
                    {design.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(design.id)}
                        className="flex-1 py-1.5 text-xs font-medium bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                      >
                        Yayınla
                      </button>
                    )}
                    {design.status === 'PUBLISHED' && (
                      <span className="flex-1 py-1.5 text-xs font-medium text-center text-green-600">✓ Yayında</span>
                    )}
                    <button
                      onClick={() => handleDelete(design.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

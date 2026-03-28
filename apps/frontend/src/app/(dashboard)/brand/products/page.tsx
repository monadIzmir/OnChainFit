'use client'

import { useState } from 'react'
import { useAuth, useProducts } from '@/hooks'
import { apiCall } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

const CATEGORIES = ['T-Shirt', 'Hoodie', 'Kupa', 'Aksesuar', 'Çanta', 'Kap', 'Diğer']

export default function BrandProductsPage() {
  const { isBrand, token } = useAuth()
  const { data, isLoading } = useProducts(0, 50)
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'T-Shirt',
    basePrice: '',
    templateUrl: '',
  })

  if (!isBrand) return <div className="text-center py-20 text-red-600 font-medium">Erişim reddedildi — Marka hesabı gerekli</div>

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          basePrice: parseFloat(form.basePrice),
          templateUrl: form.templateUrl || `https://picsum.photos/seed/${Date.now()}/600/600`,
          printZones: { x: 100, y: 100, width: 300, height: 300 },
        }),
        token: token ?? undefined,
      })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowForm(false)
      setForm({ name: '', description: '', category: 'T-Shirt', basePrice: '', templateUrl: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      await apiCall(`/products/${id}`, { method: 'DELETE', token: token ?? undefined })
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Şablonlarım</h1>
          <p className="text-gray-500 mt-1">Tasarımcıların üzerine çalışabileceği boş ürünleri ekleyin</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition"
        >
          + Ürün Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Yeni Ürün Şablonu</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
                <input
                  required type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ör. Unisex T-Shirt Beyaz"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select
                  required value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taban Fiyat (₺) *</label>
                <input
                  required type="number" step="0.01" min="1"
                  value={form.basePrice}
                  onChange={e => setForm({ ...form, basePrice: e.target.value })}
                  placeholder="150.00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                />
                <p className="text-xs text-gray-400 mt-1">Tasarımcılar bu fiyatın üzerinde satış yapar</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Görseli URL</label>
                <input
                  type="url"
                  value={form.templateUrl}
                  onChange={e => setForm({ ...form, templateUrl: e.target.value })}
                  placeholder="https://... (boş bırakılırsa örnek görsel eklenir)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Ürün hakkında kısa bilgi..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : 'Ürün Ekle'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl animate-pulse h-64" />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-semibold text-gray-700 mb-2">Henüz ürün yok</p>
          <p className="text-gray-500 mb-6">Tasarımcıların üzerine çalışabileceği ilk ürünü ekleyin</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600">
            İlk Ürünü Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.data.map((product: any) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group">
              <div className="relative overflow-hidden">
                <img src={product.templateUrl} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                  {product.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                {product.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Taban Fiyat</p>
                    <p className="font-bold text-lg text-gray-900">₺{Number(product.basePrice).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Tasarım sayısı</p>
                    <p className="font-semibold text-gray-700">{product._count?.designs ?? product.designs?.length ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 py-2 text-sm text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

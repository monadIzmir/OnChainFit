'use client'

import { useState } from 'react'
import { useDesigns } from '@/hooks'
import { useCartStore } from '@/stores/cart.store'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = ['Tümü', 'T-Shirt', 'Hoodie', 'Aksesuar', 'Kupa', 'Çanta']
const SORT_OPTIONS = [
  { value: 'new', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
]

export default function DiscoverPage() {
  const { data, isLoading } = useDesigns(0, 100)
  const { addItem, items } = useCartStore()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [sort, setSort] = useState('new')
  const [addedId, setAddedId] = useState<string | null>(null)

  const designs = data?.data || []

  const filtered = designs
    .filter((d: any) => {
      const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.designer?.email?.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === 'Tümü' || d.product?.category === activeCategory
      return matchSearch && matchCat
    })
    .sort((a: any, b: any) => {
      if (sort === 'price_asc') return Number(a.salePrice) - Number(b.salePrice)
      if (sort === 'price_desc') return Number(b.salePrice) - Number(a.salePrice)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const handleAddToCart = (design: any) => {
    addItem({
      designId: design.id,
      productId: design.productId,
      title: design.title,
      price: Number(design.salePrice),
      image: design.previewUrl,
      quantity: 1,
    })
    setAddedId(design.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  const inCart = (id: string) => items.some(i => i.designId === id)

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasarımları Keşfet</h1>
            <p className="text-gray-500 mt-1">{isLoading ? '...' : `${filtered.length} tasarım bulundu`}</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tasarım veya tasarımcı ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent w-64"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-red-400"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🎨</p>
            <p className="text-xl font-semibold text-gray-700">Tasarım bulunamadı</p>
            <p className="text-gray-500 mt-2">Arama teriminizi değiştirmeyi deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((design: any) => (
              <div key={design.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/designs/${design.id}`} className="block relative overflow-hidden">
                  <img
                    src={design.previewUrl}
                    alt={design.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                    {design.product?.category || 'Ürün'}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/designs/${design.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate hover:text-red-600 transition">{design.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-1">{design.product?.name}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    <span className="font-medium text-gray-600">{design.product?.brand?.name}</span>
                    {design.designer?.profile?.firstName && (
                      <span className="ml-1">· {design.designer.profile.firstName}</span>
                    )}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg text-gray-900">₺{Number(design.salePrice).toLocaleString()}</p>
                    <button
                      onClick={() => handleAddToCart(design)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        addedId === design.id
                          ? 'bg-green-500 text-white'
                          : inCart(design.id)
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {addedId === design.id ? '✓ Eklendi' : inCart(design.id) ? 'Sepette' : '+ Sepet'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

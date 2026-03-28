'use client'

import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/lib/api'
import { useCartStore } from '@/stores/cart.store'
import { Header } from '@/components/Header'
import Link from 'next/link'

export default function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addItem, items } = useCartStore()
  const [added, setAdded] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['design', id],
    queryFn: () => apiCall<{ success: boolean; data: any }>(`/designs/${id}`),
  })

  const design = data?.data

  const handleAddToCart = () => {
    if (!design) return
    addItem({
      designId: design.id,
      productId: design.productId,
      title: design.title,
      price: Number(design.salePrice),
      image: design.previewUrl,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const inCart = items.some(i => i.designId === id)

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-12 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !design) {
    return (
      <>
        <Header />
        <div className="text-center py-24">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-xl font-semibold text-gray-700">Tasarım bulunamadı</p>
          <Link href="/discover" className="inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600">
            Keşfete Dön
          </Link>
        </div>
      </>
    )
  }

  const monAmount = (Number(design.salePrice) / 1000).toFixed(6)

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-900">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/discover" className="hover:text-gray-900">Keşfet</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{design.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={design.previewUrl}
                alt={design.title}
                className="w-full h-full object-cover"
              />
              {design.product?.templateUrl && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <img src={design.product.templateUrl} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                  <img src={design.previewUrl} alt="design" className="absolute inset-0 w-full h-full object-contain" />
                </div>
              )}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">Üzerine gelerek ürün üstündeki görünümü incele</p>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {design.product?.category || 'Ürün'}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Yayında
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{design.title}</h1>

            {design.description && (
              <p className="text-gray-600 mb-4">{design.description}</p>
            )}

            {/* Designer & Brand */}
            <div className="flex items-center gap-4 py-4 border-y border-gray-100 mb-6">
              <div>
                <p className="text-xs text-gray-400">Tasarımcı</p>
                <p className="text-sm font-semibold text-gray-900">
                  {design.designer?.profile?.firstName
                    ? `${design.designer.profile.firstName} ${design.designer.profile.lastName || ''}`
                    : design.designer?.email}
                </p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400">Marka</p>
                <p className="text-sm font-semibold text-gray-900">{design.product?.brand?.name || '—'}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400">Ürün</p>
                <p className="text-sm font-semibold text-gray-900">{design.product?.name || '—'}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">₺{Number(design.salePrice).toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">≈ {monAmount} MON (Monad Testnet)</p>
              <p className="text-xs text-gray-400 mt-1">KDV ve kargo dahil değil</p>
            </div>

            {/* Add to cart */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-full font-semibold text-lg transition ${
                  added ? 'bg-green-500 text-white' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {added ? '✓ Sepete Eklendi!' : inCart ? '✓ Sepette' : '🛒 Sepete Ekle'}
              </button>

              {inCart && (
                <Link href="/checkout" className="block text-center w-full py-4 border-2 border-red-500 text-red-500 rounded-full font-semibold hover:bg-red-50 transition">
                  🦊 Hemen Satın Al
                </Link>
              )}
            </div>

            {/* Blockchain info */}
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm font-semibold text-purple-900 mb-1">🔗 Blockchain ile Güvence Altında</p>
              <p className="text-xs text-purple-700">Bu tasarım Monad Testnet üzerinde kayıtlıdır. IPFS ile merkezsiz depolanır.</p>
              {design.ipfsHash && (
                <p className="text-xs text-purple-500 mt-1 font-mono truncate">IPFS: {design.ipfsHash}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

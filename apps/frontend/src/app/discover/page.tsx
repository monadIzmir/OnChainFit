// src/app/discover/page.tsx
'use client'

import { useState } from 'react'
import { useAuth, useDesigns } from '@/hooks'
import { useCartStore } from '@/stores/cart.store'
import Link from 'next/link'
import { Header } from '@/components/Header'

export default function DiscoverPage() {
  const { isAuthenticated } = useAuth()
  const { data, isLoading } = useDesigns(0, 20)
  const { addItem } = useCartStore()
  const [searchTerm, setSearchTerm] = useState('')

  const designs = data?.data || []
  const filteredDesigns = designs.filter((d: any) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (design: any) => {
    addItem({
      designId: design.id,
      productId: design.productId,
      title: design.title,
      price: design.salePrice,
      image: design.previewUrl,
      quantity: 1,
    })
    alert('Added to cart!')
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Designs</h1>
          {isAuthenticated && (
            <Link href="/cart" className="relative inline-flex items-center gap-2">
              <span className="text-blue-600 hover:text-blue-700 font-medium">🛒 View Cart</span>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Designs Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading designs...</div>
        ) : filteredDesigns.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">No designs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design: any) => (
              <div key={design.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <img src={design.previewUrl} alt={design.title} className="w-full h-48 object-cover" />
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{design.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{design.product?.name}</p>
                  <p className="text-sm text-gray-500 mb-4">by {design.designer?.email}</p>
                  
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg text-gray-900">₺{design.salePrice.toLocaleString()}</p>
                    <button
                      onClick={() => handleAddToCart(design)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Add to Cart
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

// src/app/(dashboard)/brand/products/page.tsx
'use client'

import { useState } from 'react'
import { useApi, useAuth } from '@/hooks'
import Link from 'next/link'

export default function BrandProductsPage() {
  const { isBrand } = useAuth()
  const { fetchProducts } = useApi()
  const { data, isLoading } = fetchProducts()
  
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: 0,
    areaWidth: 400,
    areaHeight: 300,
  })
  const [uploading, setUploading] = useState(false)

  if (!isBrand) {
    return <div className="text-center py-8 text-red-600">Access denied</div>
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Get form element to extract file input
      const form = e.currentTarget as HTMLFormElement
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
      
      if (!fileInput?.files?.[0]) {
        alert('Please select an image')
        return
      }

      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('category', formData.category)
      formDataObj.append('basePrice', formData.basePrice.toString())
      formDataObj.append('areaWidth', formData.areaWidth.toString())
      formDataObj.append('areaHeight', formData.areaHeight.toString())
      formDataObj.append('image', fileInput.files[0])

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      alert('Product created successfully!')
      setShowForm(false)
      setFormData({
        name: '',
        category: '',
        basePrice: 0,
        areaWidth: 400,
        areaHeight: 300,
      })
      // Reload products
      window.location.reload()
    } catch (err) {
      alert(`Error: ${(err as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Templates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Create Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Product</h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., T-Shirt White XL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Select category</option>
                  <option>T-Shirt</option>
                  <option>Hoodie</option>
                  <option>Mug</option>
                  <option>Hat</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₺)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Area Width (px)
                </label>
                <input
                  type="number"
                  value={formData.areaWidth}
                  onChange={(e) => setFormData({ ...formData, areaWidth: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Area Height (px)
                </label>
                <input
                  type="number"
                  value={formData.areaHeight}
                  onChange={(e) => setFormData({ ...formData, areaHeight: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Creating...' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : !data?.data?.length ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">No product templates yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((product: any) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
              <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="font-bold text-lg text-gray-900 mb-4">₺{product.basePrice}</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                    Delete
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

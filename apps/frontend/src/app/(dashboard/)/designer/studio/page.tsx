// src/app/(dashboard)/designer/studio/page.tsx
'use client'

import { useState } from 'react'
import { useApi, useAuth } from '@/hooks'
import { DesignCanvas } from '@/components/DesignCanvas'

export default function DesignerStudio() {
  const { isDesigner, user } = useAuth()
  const { fetchProducts } = useApi()
  const { data: productsData, isLoading } = fetchProducts()
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [designTitle, setDesignTitle] = useState('')
  const [salePrice, setSalePrice] = useState(0)
  const [saving, setSaving] = useState(false)

  if (!isDesigner) {
    return <div className="text-center py-8 text-red-600">Access denied</div>
  }

  const handleSaveDesign = async (designData: any) => {
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }

    if (!designTitle.trim()) {
      alert('Please enter a design title')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      
      // Convert canvas to blob and add to form
      const blob = await fetch(designData.image).then(r => r.blob())
      formData.append('image', blob, 'design.png')
      formData.append('title', designTitle)
      formData.append('productId', selectedProduct.id)
      formData.append('salePrice', salePrice.toString())
      formData.append('canvasData', JSON.stringify(designData.canvas))

      const response = await fetch('/api/designs', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to save design')
      }

      alert('Design saved successfully!')
      setDesignTitle('')
      setSalePrice(0)
      setSelectedProduct(null)
    } catch (err) {
      alert(`Error: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Design Studio</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Product Selection & Design Properties */}
        <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Product</h2>

          {isLoading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : !productsData?.data?.length ? (
            <p className="text-gray-500">No products available. Ask a brand to create templates.</p>
          ) : (
            <div className="space-y-3">
              {productsData.data.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full text-left p-3 rounded border-2 transition ${
                    selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </button>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Title
                </label>
                <input
                  type="text"
                  value={designTitle}
                  onChange={(e) => setDesignTitle(e.target.value)}
                  placeholder="My awesome design"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (₺)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  placeholder="0.00"
                  min={selectedProduct.basePrice || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: ₺{selectedProduct.basePrice || 0}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                <p className="font-medium mb-2">Product Info</p>
                <p>Size: {selectedProduct.printZone?.width}x{selectedProduct.printZone?.height}px</p>
                <p>Category: {selectedProduct.category}</p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="col-span-9">
          {selectedProduct ? (
            <DesignCanvas
              productTemplate={selectedProduct}
              onSave={handleSaveDesign}
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">Select a product to start designing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

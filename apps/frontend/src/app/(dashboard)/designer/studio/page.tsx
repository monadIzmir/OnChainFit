'use client'

import { useState, useRef } from 'react'
import { useAuth, useProducts } from '@/hooks'
import { useRouter } from 'next/navigation'

export default function DesignerStudio() {
  const { isDesigner, token } = useAuth()
  const router = useRouter()
  const { data: productsData, isLoading } = useProducts(0, 100)
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', salePrice: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  if (!isDesigner) return <div className="text-center py-20 text-red-600 font-medium">Erişim reddedildi — Tasarımcı hesabı gerekli</div>

  const products = (productsData?.data || []).filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !previewFile || !form.title || !form.salePrice) {
      setError('Lütfen tüm alanları doldurun')
      return
    }
    const price = parseFloat(form.salePrice)
    if (price < Number(selectedProduct.basePrice)) {
      setError(`Satış fiyatı taban fiyattan (₺${selectedProduct.basePrice}) düşük olamaz`)
      return
    }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', previewFile)
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('productId', selectedProduct.id)
      fd.append('salePrice', price.toString())

      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
      const res = await fetch(`${API}/designs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Yükleme başarısız')
      }
      router.push('/designer/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasarım Yükle</h1>
        <p className="text-gray-500 mt-1">Seçtiğin marka ürününe tasarımını yükle, fiyatını belirle</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { n: 1, label: 'Ürün Seç' },
          { n: 2, label: 'Tasarım Yükle' },
          { n: 3, label: 'Fiyat & Yayınla' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s.n ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>{s.n}</div>
            <span className={`text-sm font-medium ${step >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
            {i < 2 && <div className={`h-px w-12 ${step > s.n ? 'bg-red-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Product */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hangi ürüne tasarım yapmak istiyorsun?</h2>
          <input
            type="text"
            placeholder="Ürün veya marka ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-5 focus:ring-2 focus:ring-red-400 focus:border-transparent"
          />
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center py-12 text-gray-500">Henüz ürün şablonu yok. Markalar ekleyince burada görünecek.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => { setSelectedProduct(product); setStep(2) }}
                  className={`text-left rounded-xl border-2 overflow-hidden transition ${
                    selectedProduct?.id === product.id ? 'border-red-500' : 'border-gray-100 hover:border-red-300'
                  }`}
                >
                  <img src={product.templateUrl} alt={product.name} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.brand?.name} · {product.category}</p>
                    <p className="text-sm font-bold text-gray-700 mt-1">Taban: ₺{Number(product.basePrice).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Upload Design */}
      {step === 2 && selectedProduct && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Tasarımını Yükle</h2>
            <p className="text-sm text-gray-500 mb-5">PNG, JPG veya SVG — max 10 MB</p>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="font-medium text-gray-700">Dosya seçmek için tıklayın</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {previewUrl && (
              <button onClick={() => { setPreviewFile(null); setPreviewUrl(null) }} className="mt-3 text-sm text-red-500 hover:underline">
                Dosyayı değiştir
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Önizleme</h2>
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img src={selectedProduct.templateUrl} alt="product" className="w-full h-56 object-cover" />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="design"
                  className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80"
                />
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">{selectedProduct.name}</p>
              <p className="text-xs text-gray-400">{selectedProduct.brand?.name} · Taban: ₺{Number(selectedProduct.basePrice).toLocaleString()}</p>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50">
              ← Geri
            </button>
            <button
              onClick={() => previewFile ? setStep(3) : setError('Lütfen bir tasarım dosyası yükleyin')}
              className="px-8 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600"
            >
              Devam Et →
            </button>
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Step 3: Price & Publish */}
      {step === 3 && selectedProduct && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Detaylar & Fiyat</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tasarım Başlığı *</label>
              <input
                type="text" required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="ör. Minimalist Ay Baskılı T-Shirt"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Tasarımın hakkında kısa bir açıklama..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı (₺) *</label>
              <input
                type="number" step="0.01"
                min={Number(selectedProduct.basePrice)}
                value={form.salePrice}
                onChange={e => setForm({ ...form, salePrice: e.target.value })}
                placeholder={`Min. ₺${Number(selectedProduct.basePrice)}`}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Taban fiyat: ₺{Number(selectedProduct.basePrice).toLocaleString()} ·
                {form.salePrice && parseFloat(form.salePrice) > Number(selectedProduct.basePrice)
                  ? ` Kazancın: ₺${(parseFloat(form.salePrice) - Number(selectedProduct.basePrice)).toFixed(2)}`
                  : ' Taban fiyatın üzerinde fiyat belirle'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Özet</h2>
            <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img src={selectedProduct.templateUrl} alt="product" className="w-full h-40 object-cover" />
              {previewUrl && (
                <img src={previewUrl} alt="design" className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-80" />
              )}
            </div>
            <p className="font-semibold text-gray-900">{form.title || '—'}</p>
            <p className="text-sm text-gray-500">{selectedProduct.name} · {selectedProduct.brand?.name}</p>
            {form.salePrice && <p className="text-xl font-bold text-red-600 mt-2">₺{parseFloat(form.salePrice).toLocaleString()}</p>}

            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
              <p className="font-medium">ℹ️ Yayınlama Süreci</p>
              <p className="mt-1">Tasarımın IPFS&apos;e yüklenip blockchain&apos;e kaydedilecek, ardından yayına alınabilecek.</p>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-4 flex-wrap">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50">
              ← Geri
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-2.5 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {saving ? 'Yükleniyor...' : '🚀 Tasarımı Yükle'}
            </button>
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
        </div>
      )}
    </div>
  )
}

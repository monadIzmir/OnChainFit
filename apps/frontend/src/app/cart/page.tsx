'use client'

import { useCartStore } from '@/stores/cart.store'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { items, removeItem, updateQuantity, total } = useCartStore()

  const cartTotal = total()
  const shipping = 49.9
  const tax = cartTotal * 0.18
  const finalTotal = cartTotal + shipping + tax

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="text-6xl mb-6">🛒</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sepetiniz boş</h2>
          <p className="text-gray-500 mb-8">Beğendiğiniz tasarımları sepete ekleyin</p>
          <Link href="/discover" className="inline-block px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600">
            Tasarımları Keşfet
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sepetim ({items.length} ürün)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.designId} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">₺{item.price.toLocaleString()} / adet</p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.designId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.designId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <p className="font-bold text-gray-900">₺{(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeItem(item.designId)} className="text-sm text-red-500 hover:text-red-700">
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Sipariş Özeti</h2>

            <div className="space-y-3 pb-5 border-b border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ara toplam ({items.length} ürün)</span>
                <span>₺{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Kargo</span>
                <span>₺{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>KDV (%18)</span>
                <span>₺{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="font-bold text-gray-900">Toplam</span>
              <span className="text-2xl font-bold text-red-600">₺{finalTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => isAuthenticated ? router.push('/checkout') : router.push('/login?redirect=/checkout')}
                className="w-full py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
              >
                {isAuthenticated ? '🦊 MetaMask ile Öde' : 'Giriş Yap ve Öde'}
              </button>
              <Link href="/discover" className="block text-center text-sm text-gray-500 hover:text-gray-700 py-2">
                Alışverişe devam et
              </Link>
            </div>

            <div className="mt-4 p-3 bg-purple-50 rounded-xl text-xs text-purple-700 text-center">
              <p className="font-medium">🔗 Monad Testnet ile ödeme</p>
              <p className="mt-0.5 text-purple-500">MetaMask cüzdanınızla güvenli ödeme</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

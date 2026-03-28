'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart.store'
import { useAuth, useMetaMask } from '@/hooks'
import { apiCall } from '@/lib/api'

// 1 MON = 1000 TRY (testnet sembolik oran)
const TRY_PER_MON = 1000
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET || '0x0000000000000000000000000000000000000001'

function shortAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function CheckoutPage() {
  const { isAuthenticated, token } = useAuth()
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const {
    account,
    isInstalled,
    isConnecting,
    isOnMonadTestnet,
    error: metaMaskError,
    connect,
    switchToMonadTestnet,
    sendTransaction,
  } = useMetaMask()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'TR',
    paymentMethod: 'monad' as 'monad' | 'stripe',
  })
  const [processing, setProcessing] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [appError, setAppError] = useState('')

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }
  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const cartTotal = total()
  const shipping = 49.9
  const tax = cartTotal * 0.18
  const finalTotal = cartTotal + shipping + tax
  const monAmount = parseFloat((finalTotal / TRY_PER_MON).toFixed(6))

  const handleMonadPayment = async (e: FormEvent) => {
    e.preventDefault()
    setAppError('')
    setProcessing(true)

    try {
      // 1. Cüzdan bağla
      let walletAccount = account
      if (!walletAccount) {
        setStatusMsg('MetaMask bağlanıyor...')
        walletAccount = await connect()
        if (!walletAccount) {
          setAppError(metaMaskError || 'Cüzdan bağlanamadı.')
          return
        }
      }

      // 2. Monad Testnet'e geç
      if (!isOnMonadTestnet) {
        setStatusMsg('Monad Testnet ağına geçiliyor...')
        const switched = await switchToMonadTestnet()
        if (!switched) {
          setAppError('Monad Testnet ağına geçilemedi.')
          return
        }
      }

      // 3. Sipariş oluştur
      setStatusMsg('Sipariş oluşturuluyor...')
      const orderRes = await apiCall<{ success: boolean; data: { id: string } }>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: items.map(i => ({ designId: i.designId, quantity: i.quantity })),
            shippingAddress: {
              name: formData.fullName,
              phone: formData.phone,
              street: formData.street,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country,
            },
          }),
          token: token ?? undefined,
        }
      )
      const orderId = orderRes.data.id

      // 4. MetaMask ile ödeme gönder
      setStatusMsg(`MetaMask açılıyor — ${monAmount} MON gönderilecek...`)
      const txHash = await sendTransaction(PLATFORM_WALLET, monAmount)
      if (!txHash) {
        setAppError(metaMaskError || 'İşlem iptal edildi.')
        return
      }

      // 5. Backend'e doğrulat
      setStatusMsg('İşlem doğrulanıyor...')
      await apiCall('/payments/monad/verify', {
        method: 'POST',
        body: JSON.stringify({ orderId, txHash, amount: monAmount }),
        token: token ?? undefined,
      })

      clearCart()
      router.push(`/order-confirmation/${orderId}`)
    } catch (err: any) {
      setAppError(err.message || 'Bir hata oluştu.')
    } finally {
      setProcessing(false)
      setStatusMsg('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ödeme</h1>

      <form onSubmit={handleMonadPayment} className="space-y-6">

        {/* Kargo Adresi */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  type="text" required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel" required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input
                type="text" required
                value={formData.street}
                onChange={e => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                <input
                  type="text" required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                <input
                  type="text" required
                  value={formData.postalCode}
                  onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
                <input
                  type="text" required
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ödeme Yöntemi — MetaMask / Monad */}
        <div className="bg-white rounded-lg border-2 border-purple-400 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemi</h2>

          {/* MetaMask durumu */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦊</span>
              <div>
                <p className="font-semibold text-gray-900">MetaMask — Monad Testnet</p>
                <p className="text-sm text-gray-500">
                  {account
                    ? <span className="text-green-600 font-medium">✓ {shortAddress(account)}</span>
                    : 'Cüzdan bağlı değil'}
                  {account && !isOnMonadTestnet && (
                    <span className="text-orange-500 ml-2">⚠ Yanlış ağ</span>
                  )}
                  {account && isOnMonadTestnet && (
                    <span className="text-green-600 ml-2">· Monad Testnet ✓</span>
                  )}
                </p>
              </div>
            </div>

            {!isInstalled ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                MetaMask İndir
              </a>
            ) : !account ? (
              <button
                type="button"
                onClick={connect}
                disabled={isConnecting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {isConnecting ? 'Bağlanıyor...' : 'Bağlan'}
              </button>
            ) : !isOnMonadTestnet ? (
              <button
                type="button"
                onClick={switchToMonadTestnet}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                Ağı Değiştir
              </button>
            ) : null}
          </div>

          {/* Ağ bilgisi */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p>Ağ: <strong>Monad Testnet</strong> (Chain ID: 10143)</p>
            <p>RPC: https://testnet-rpc.monad.xyz</p>
            <p className="mt-1">
              Testnet MON almak için:{' '}
              <a href="https://faucet.monad.xyz" target="_blank" rel="noreferrer" className="text-purple-600 underline">
                faucet.monad.xyz
              </a>
            </p>
          </div>
        </div>

        {/* Sipariş Özeti */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 mb-4 pb-4 border-b border-purple-200">
            {items.map(item => (
              <div key={item.designId} className="flex justify-between text-sm text-gray-700">
                <span>{item.title} × {item.quantity}</span>
                <span>₺{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Kargo</span>
              <span>₺{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>KDV (%18)</span>
              <span>₺{tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-900">Toplam</span>
            <span className="text-2xl font-bold text-purple-600">₺{finalTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Blockchain tutarı</span>
            <span className="font-medium text-purple-700">{monAmount} MON</span>
          </div>
        </div>

        {/* Hata / Durum */}
        {appError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {appError}
          </div>
        )}
        {statusMsg && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
            <span className="animate-spin">⏳</span> {statusMsg}
          </div>
        )}

        {/* Ödeme Butonu */}
        <button
          type="submit"
          disabled={processing || !account || !isOnMonadTestnet}
          className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {processing
            ? statusMsg || 'İşleniyor...'
            : !account
              ? 'Önce MetaMask Bağlayın'
              : !isOnMonadTestnet
                ? 'Monad Testnet\'e Geçin'
                : `${monAmount} MON Öde`}
        </button>

      </form>
    </div>
  )
}

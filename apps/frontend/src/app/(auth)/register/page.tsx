'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks'
import Link from 'next/link'

type Role = 'BRAND' | 'DESIGNER' | 'CUSTOMER'

const ROLES = [
  {
    value: 'CUSTOMER' as Role,
    icon: '🛒',
    title: 'Müşteri',
    desc: 'Özgün tasarımları keşfet ve al',
  },
  {
    value: 'DESIGNER' as Role,
    icon: '🎨',
    title: 'Tasarımcı',
    desc: 'Tasarım yükle, marka ürünlerine uygula, kazan',
  },
  {
    value: 'BRAND' as Role,
    icon: '🏷️',
    title: 'Marka',
    desc: 'Ürün şablonları ekle, tasarımcılarla büyü',
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { registerUser, loginUser } = useAuth()

  const defaultRole = (searchParams.get('role') as Role) || 'CUSTOMER'
  const [role, setRole] = useState<Role>(defaultRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) return setError('Şifreler eşleşmiyor')
    if (password.length < 8) return setError('Şifre en az 8 karakter olmalı')

    setLoading(true)
    try {
      await registerUser(email, password, role)
      await loginUser(email, password)
      const paths: Record<Role, string> = {
        BRAND: '/brand/products',
        DESIGNER: '/designer/studio',
        CUSTOMER: '/discover',
      }
      router.push(paths[role])
    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-red-900 text-white flex-col justify-center px-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">P</div>
            <span className="text-xl font-bold">PrintChain</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Türkiye&apos;nin Web3<br />Print-on-Demand Platformu</h2>
          <p className="text-gray-400">Markalar, tasarımcılar ve müşterileri Monad Testnet üzerinde buluşturuyoruz.</p>
        </div>
        <div className="space-y-4">
          {['Ücretsiz tasarım yükle', 'Otomatik cüzdan ödemesi', 'Sınırsız marka ürünü', 'Blockchain güvencesi'].map(f => (
            <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
              <span className="text-green-400">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">P</div>
              <span className="text-xl font-bold text-gray-900">PrintChain</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h1>
            <p className="text-gray-500 mt-1">Hemen ücretsiz başla</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Hesap türü seçin</p>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border-2 text-center transition ${
                      role === r.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{r.icon}</span>
                    <span className={`text-xs font-semibold ${role === r.value ? 'text-red-600' : 'text-gray-700'}`}>{r.title}</span>
                    <span className="text-xs text-gray-400 block mt-0.5 leading-tight">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                type="password" required minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
              <input
                type="password" required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 disabled:opacity-50 transition"
            >
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Zaten hesabın var mı?{' '}
              <Link href="/login" className="font-medium text-red-500 hover:underline">Giriş Yap</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

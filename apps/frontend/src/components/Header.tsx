'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks'
import { useCartStore } from '@/stores/cart.store'
import { useState } from 'react'

export function Header() {
  const { isAuthenticated, user, logoutUser } = useAuth()
  const { items } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  const dashboardPath = () => {
    if (user?.role === 'BRAND') return '/brand/products'
    if (user?.role === 'DESIGNER') return '/designer/dashboard'
    return '/customer/orders'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-xl font-bold text-gray-900">PrintChain</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="text-gray-600 hover:text-gray-900 font-medium">Keşfet</Link>
            {isAuthenticated && (
              <Link href={dashboardPath()} className="text-gray-600 hover:text-gray-900 font-medium">
                {user?.role === 'BRAND' ? 'Ürünlerim' : user?.role === 'DESIGNER' ? 'Tasarımlarım' : 'Siparişlerim'}
              </Link>
            )}
            {user?.role === 'DESIGNER' && (
              <Link href="/designer/studio" className="px-4 py-1.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600">
                + Tasarım Yükle
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">{user?.role}</span>
                    </div>
                    <Link href={dashboardPath()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      Dashboard
                    </Link>
                    {user?.role === 'DESIGNER' && (
                      <>
                        <Link href="/designer/studio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Tasarım Yükle</Link>
                        <Link href="/designer/earnings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Kazançlarım</Link>
                      </>
                    )}
                    {user?.role === 'BRAND' && (
                      <>
                        <Link href="/brand/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Ürün Şablonlarım</Link>
                        <Link href="/brand/analytics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Analitik</Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { logoutUser(); setUserMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Giriş</Link>
                <Link href="/register" className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600">Üye Ol</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link href="/discover" className="block px-2 py-2 text-gray-700">Keşfet</Link>
            {isAuthenticated ? (
              <>
                <Link href={dashboardPath()} className="block px-2 py-2 text-gray-700">Dashboard</Link>
                {user?.role === 'DESIGNER' && <Link href="/designer/studio" className="block px-2 py-2 text-gray-700">Tasarım Yükle</Link>}
                <button onClick={logoutUser} className="block px-2 py-2 text-red-600">Çıkış</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-2 py-2 text-gray-700">Giriş</Link>
                <Link href="/register" className="block px-2 py-2 text-gray-700">Üye Ol</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

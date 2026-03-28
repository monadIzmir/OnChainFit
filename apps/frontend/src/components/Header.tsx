// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks'
import { useState } from 'react'

export function Header() {
  const { isAuthenticated, user, logoutUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'BRAND':
        return '/dashboard/brand'
      case 'DESIGNER':
        return '/dashboard/designer'
      case 'CUSTOMER':
        return '/dashboard/customer'
      default:
        return '/dashboard'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          PrintChain
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/discover" className="text-gray-600 hover:text-gray-900">
            Discover
          </Link>

          {isAuthenticated ? (
            <>
              <Link href={getDashboardLink()} className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <div className="relative group">
                <button className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block">
                  <button
                    onClick={logoutUser}
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-600 hover:text-gray-900"
        >
          ☰
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-4">
          <Link href="/" className="block text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/discover" className="block text-gray-600 hover:text-gray-900">
            Discover
          </Link>
          {isAuthenticated ? (
            <>
              <Link href={getDashboardLink()} className="block text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logoutUser()
                  setIsOpen(false)
                }}
                className="block w-full text-left text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

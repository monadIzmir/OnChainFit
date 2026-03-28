// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrintChain - Blockchain Print-on-Demand',
  description: 'Decentralized print-on-demand platform with automatic designer payouts',
  keywords: ['print-on-demand', 'blockchain', 'royalty', 'monad'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="text-2xl font-bold text-blue-600">PrintChain</div>
              <div className="space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </a>
                <a href="/discover" className="text-gray-600 hover:text-gray-900">
                  Discover
                </a>
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login
                </a>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-center text-gray-600">
                © 2024 PrintChain. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

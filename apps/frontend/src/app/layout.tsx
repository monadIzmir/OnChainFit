// src/app/layout.tsx
import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/query-provider'
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
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
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
        </QueryProvider>
      </body>
    </html>
  )
}

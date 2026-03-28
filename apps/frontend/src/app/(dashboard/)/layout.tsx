// src/app/(dashboard)/layout.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { useEffect } from 'react'
import { Header } from '@/components/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Header />
      {children}
    </>
  )
}

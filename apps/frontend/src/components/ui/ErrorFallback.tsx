// src/components/ui/ErrorFallback.tsx
'use client'

import React from 'react'
import { AlertCircle, X } from 'lucide-react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary?: () => void
  title?: string
  showDetails?: boolean
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  showDetails = false,
}: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="text-red-900 font-semibold">{title}</h3>
          <p className="text-red-800 text-sm mt-1">
            {error.message || 'An unexpected error occurred.'}
          </p>

          {showDetails && error.stack && (
            <details className="mt-3">
              <summary className="text-red-700 text-xs cursor-pointer">Technical details</summary>
              <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32 mt-2">
                {error.stack}
              </pre>
            </details>
          )}

          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton component for while data is loading
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  )
}

// Error toast notification
export function ErrorToast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <AlertCircle size={20} />
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Success toast notification
export function SuccessToast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
      <div>✓</div>
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80"
      >
        <X size={16} />
      </button>
    </div>
  )
}

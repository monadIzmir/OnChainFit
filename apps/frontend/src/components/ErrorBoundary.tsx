// src/components/ErrorBoundary.tsx
'use client'

import React, { ReactNode, ReactElement } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactElement
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.__SENTRY__) {
      window.__SENTRY__.captureException(error)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.reset) || (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="text-red-600 text-2xl font-bold mb-4">⚠️ Error</div>
              <p className="text-gray-700 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs text-gray-600 mb-4 overflow-auto max-h-32">
                {this.state.error?.stack}
              </pre>
              <button
                onClick={this.reset}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full mt-2 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
              >
                Go Home
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Async error boundary for server components
export class AsyncErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Async error caught:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-yellow-800 font-semibold">Something went wrong</h3>
          <p className="text-yellow-700 text-sm mt-1">{this.state.error?.message}</p>
          <button
            onClick={this.reset}
            className="mt-2 text-yellow-600 hover:text-yellow-700 underline text-sm"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

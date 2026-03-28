// src/hooks/useLoadingStates.ts
'use client'

import { useState, useCallback, useEffect } from 'react'

interface LoadingState {
  isLoading: boolean
  error: Error | null
  success: boolean
}

export function useLoadingStates(initialState: Partial<LoadingState> = {}) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    success: false,
    ...initialState,
  })

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, success }))
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false })
  }, [])

  const execute = useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const result = await asyncFn()
      setSuccess(true)
      setLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setLoading(false)
      return null
    }
  }, [setLoading, setError, setSuccess])

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    reset,
    execute,
  }
}

// Hook for async operations with timeout
export function useAsync<T, E extends Error = Error>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true,
  timeout: number = 10000
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)

    try {
      const race = Promise.race<T>([
        asyncFunction(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ])
      const result = await race
      setData(result)
      setStatus('success')
      return result
    } catch (err) {
      const error = err as E
      setError(error)
      setStatus('error')
      throw error
    }
  }, [asyncFunction, timeout])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, data, error }
}

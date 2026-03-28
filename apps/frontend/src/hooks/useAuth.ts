// src/hooks/useAuth.ts
import { useCallback } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { apiCall } from '../lib/api'

export function useAuth() {
  const { user, token, login, logout, setUser } = useAuthStore()

  const loginUser = useCallback(
    async (email: string, password: string) => {
      const response = await apiCall<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      login(response.data.user, response.data.accessToken)
      return response.data
    },
    [login]
  )

  const registerUser = useCallback(
    async (
      email: string,
      password: string,
      role: 'BRAND' | 'DESIGNER' | 'CUSTOMER',
      firstName: string,
      lastName: string
    ) => {
      const response = await apiCall<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, firstName, lastName }),
      })
      return response.data
    },
    []
  )

  const logoutUser = useCallback(() => {
    logout()
  }, [logout])

  const isAuthenticated = !!user && !!token
  const isBrand = user?.role === 'BRAND'
  const isDesigner = user?.role === 'DESIGNER'
  const isCustomer = user?.role === 'CUSTOMER'

  return {
    user,
    token,
    isAuthenticated,
    isBrand,
    isDesigner,
    isCustomer,
    loginUser,
    registerUser,
    logoutUser,
    setUser,
  }
}

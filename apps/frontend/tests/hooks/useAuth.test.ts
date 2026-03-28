// tests/hooks/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../../src/hooks/useAuth'

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should restore user from localStorage', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
    }
    
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    localStorage.setItem('auth_token', 'test-token')

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should login user with email and password', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeDefined()
    })

    expect(localStorage.getItem('auth_token')).toBeTruthy()
  })

  it('should logout user', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
    }
    
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    localStorage.setItem('auth_token', 'test-token')

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('should handle register for different roles', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.register('newuser@example.com', 'password123', 'BRAND')
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.role).toBe('BRAND')
    })
  })

  it('should handle logout', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
    }
    localStorage.setItem('auth_user', JSON.stringify(mockUser))
    localStorage.setItem('auth_token', 'test-token')

    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})

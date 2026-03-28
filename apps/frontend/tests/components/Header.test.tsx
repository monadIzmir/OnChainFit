// tests/components/__tests__/Header.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Header } from '../../../src/components/Header'
import { useAuth } from '../../../src/hooks/useAuth'

jest.mock('../../../src/hooks/useAuth')

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render header with logo', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any)

    render(<Header />)
    expect(screen.getByRole('heading', { name: /printchain/i })).toBeInTheDocument()
  })

  it('should show login button when not authenticated', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any)

    render(<Header />)
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })

  it('should show user menu when authenticated', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any)

    render(<Header />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should call logout when logout button clicked', async () => {
    const mockLogout = jest.fn()
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
      isAuthenticated: true,
      login: jest.fn(),
      logout: mockLogout,
      register: jest.fn(),
    } as any)

    render(<Header />)
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    
    fireEvent.click(logoutButton)
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('should display role badge for authenticated users', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'DESIGNER' },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any)

    render(<Header />)
    expect(screen.getByText(/designer/i)).toBeInTheDocument()
  })
})

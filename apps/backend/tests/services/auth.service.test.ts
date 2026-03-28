// tests/services/auth.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as bcrypt from 'bcrypt'
import { AuthService } from '../../src/services/auth.service'
import { createMockPrismaClient, mockUserData } from '../mocks/prisma'

vi.mock('bcrypt')

describe('AuthService', () => {
  let authService: AuthService
  let mockPrisma: any
  let mockEnv: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    mockEnv = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRY: '7d',
    }
    authService = new AuthService(mockPrisma, mockEnv)
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should create a new user with hashed password', async () => {
      const email = 'newuser@example.com'
      const password = 'password123'
      const role = 'BRAND' as const

      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed_password' as any)
      mockPrisma.user.create.mockResolvedValueOnce({
        ...mockUserData,
        email,
        id: 'new-user-1',
      })

      const result = await authService.registerUser(email, password, role)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(mockPrisma.user.create).toHaveBeenCalled()
      expect(result.email).toBe(email)
    })

    it('should throw error if user already exists', async () => {
      const email = 'existing@example.com'
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData)

      await expect(
        authService.registerUser(email, 'password123', 'BRAND')
      ).rejects.toThrow('USER_ALREADY_EXISTS')
    })

    it('should create user profile on registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)
      vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed_password' as any)
      mockPrisma.user.create.mockResolvedValueOnce(mockUserData)

      await authService.registerUser('test@example.com', 'password123', 'DESIGNER')

      const createCall = mockPrisma.user.create.mock.calls[0]
      expect(createCall[0].data.profile).toBeDefined()
    })
  })

  describe('loginUser', () => {
    it('should return user and access token on successful login', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData)
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as any)

      const result = await authService.loginUser(email, password)

      expect(result.user).toBeDefined()
      expect(result.accessToken).toBeDefined()
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { brand: true },
      })
    })

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)

      await expect(
        authService.loginUser('notfound@example.com', 'password123')
      ).rejects.toThrow('USER_NOT_FOUND')
    })

    it('should throw error if password is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData)
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as any)

      await expect(
        authService.loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('INVALID_PASSWORD')
    })

    it('should throw error if user has no password', async () => {
      const userWithoutPassword = { ...mockUserData, passwordHash: null }
      mockPrisma.user.findUnique.mockResolvedValueOnce(userWithoutPassword)

      await expect(
        authService.loginUser('test@example.com', 'password123')
      ).rejects.toThrow('USER_NO_PASSWORD')
    })
  })

  describe('verifyWeb3Nonce', () => {
    it('should generate and return a nonce', async () => {
      const result = await authService.verifyWeb3Nonce('user-1')

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})

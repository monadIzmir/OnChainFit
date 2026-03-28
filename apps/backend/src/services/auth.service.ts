// src/services/auth.service.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { generateAccessToken } from '../middleware/auth'
import type { Env } from '../config/env'

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private env: Env
  ) {}

  async registerUser(email: string, password: string, role: string, firstName?: string, lastName?: string) {
    // Check if user exists
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('USER_ALREADY_EXISTS')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
      include: { brand: true, profile: true },
    })

    return user
  }

  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { brand: true, profile: true },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    if (!user.passwordHash) {
      throw new Error('USER_NO_PASSWORD')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      throw new Error('INVALID_PASSWORD')
    }

    // Generate tokens
    const accessToken = generateAccessToken(
      {
        sub: user.id,
        role: user.role as any,
        walletAddress: user.walletAddress || undefined,
      },
      this.env.JWT_SECRET,
      this.env.JWT_EXPIRY
    )

    return { user, accessToken }
  }

  async verifyWeb3Nonce(userId: string): Promise<string> {
    // Generate random nonce
    const nonce = Math.random().toString(36).substring(7)
    
    // Store in cache (Redis) with 5 min TTL
    // For now, just return
    return nonce
  }

  async bindWallet(userId: string, walletAddress: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
    })
  }
}

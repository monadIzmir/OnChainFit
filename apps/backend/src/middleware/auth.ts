// src/middleware/auth.ts
import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import type { Env } from '../config/env'

export interface AuthPayload {
  sub: string
  role: 'ADMIN' | 'BRAND' | 'DESIGNER' | 'CUSTOMER'
  walletAddress?: string
  iat: number
  exp: number
}

export async function verifyToken(token: string, secret: string): Promise<AuthPayload> {
  return jwt.verify(token, secret) as AuthPayload
}

export function generateAccessToken(payload: Omit<AuthPayload, 'iat' | 'exp'>, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any })
}

// Soft auth: populates req.user if valid token present, does not block if no token.
// Routes that require auth must check req.user themselves.
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply, env: Env) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return // No token – continue, protected routes handle 401/403
  }

  try {
    const token = authHeader.slice(7)
    const decoded = await verifyToken(token, env.JWT_SECRET)
    request.user = decoded
  } catch (error) {
    return reply.code(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token verification failed',
      },
    })
  }
}

// Use in route handlers to enforce authentication
export function requireAuth(request: FastifyRequest, reply: FastifyReply): boolean {
  if (!request.user) {
    reply.code(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
    return false
  }
  return true
}

// Extend FastifyRequest
declare global {
  namespace FastifyInstance {
    interface FastifyRequest {
      user?: AuthPayload
    }
  }
}

// src/routes/auth.routes.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AuthService } from '../services/auth.service'
import { successResponse, errorResponse } from '../lib/responses'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['BRAND', 'DESIGNER', 'CUSTOMER']),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app.prisma, app.env)

  app.post<{ Body: z.infer<typeof registerSchema> }>('/register', async (req, reply) => {
    try {
      const data = registerSchema.parse(req.body)
      const user = await authService.registerUser(
        data.email,
        data.password,
        data.role,
        data.firstName,
        data.lastName
      )

      return reply.code(201).send(
        successResponse({
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
        })
      )
    } catch (error: any) {
      if (error.message === 'USER_ALREADY_EXISTS') {
        return reply.code(409).send(errorResponse('USER_ALREADY_EXISTS', 'Email already registered'))
      }
      return reply.code(400).send(errorResponse('VALIDATION_ERROR', error.message))
    }
  })

  app.post<{ Body: z.infer<typeof loginSchema> }>('/login', async (req, reply) => {
    try {
      const data = loginSchema.parse(req.body)
      const { user, accessToken } = await authService.loginUser(data.email, data.password)

      return reply.send(
        successResponse({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
          },
          accessToken,
        })
      )
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
        return reply.code(401).send(errorResponse('INVALID_CREDENTIALS', 'Invalid email or password'))
      }

      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  app.post('/web3/nonce', async (req, reply) => {
    const nonce = await authService.verifyWeb3Nonce(req.user?.sub || 'anonymous')
    return reply.send(successResponse({ nonce }))
  })
}

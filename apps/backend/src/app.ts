// src/app.ts
import Fastify, { FastifyInstance } from 'fastify'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'
import type { Env } from './config/env'
import { createLogger } from './lib/logger'
import { authRoutes } from './routes/auth.routes'
import { productRoutes } from './routes/product.routes'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    env: Env
  }
  interface FastifyRequest {
    user?: {
      sub: string
      role: 'ADMIN' | 'BRAND' | 'DESIGNER' | 'CUSTOMER'
      walletAddress?: string
    }
  }
}

export async function createApp(env: Env): Promise<FastifyInstance> {
  const logger = createLogger(env)
  const prisma = new PrismaClient()

  const app = Fastify({
    logger: logger as any,
  })

  // Decorators
  app.decorate('prisma', prisma)
  app.decorate('env', env)

  // Plugins
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
  })

  await app.register(fastifyCors, {
    origin: env.APP_URL,
    credentials: true,
  })

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  })

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  // API Routes
  app.register(
    async (app) => {
      app.register(authRoutes, { prefix: '/auth' })
      app.register(productRoutes, { prefix: '/products' })
    },
    { prefix: '/api/v1' }
  )

  // Error handler
  app.setErrorHandler(async (error, request, reply) => {
    logger.error(error)
    return reply.code(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    })
  })

  // Graceful shutdown
  const shutdown = async () => {
    await app.close()
    await prisma.$disconnect()
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  return app
}

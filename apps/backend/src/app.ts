// src/app.ts
import Fastify, { FastifyInstance } from 'fastify'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { PrismaClient } from '@prisma/client'
import type { Env } from './config/env'
import { createLogger } from './lib/logger'
import { authMiddleware } from './middleware/auth'
import { authRoutes } from './routes/auth.routes'
import { brandRoutes } from './routes/brand.routes'
import { productRoutes } from './routes/product.routes'
import { designRoutes } from './routes/design.routes'
import { orderRoutes } from './routes/order.routes'
import { paymentRoutes } from './routes/payment.routes'

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
    origin: env.NODE_ENV === 'development'
      ? /^http:\/\/localhost:\d+$/
      : env.APP_URL,
    credentials: true,
  })

  await app.register(fastifyMultipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  })

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' }
  })

  // API root endpoint
  app.get('/api/v1', async () => {
    return {
      status: 'ok',
      message: 'PrintChain API v1',
      endpoints: {
        health: '/health',
        auth: '/api/v1/auth',
        products: '/api/v1/products',
        designs: '/api/v1/designs',
        orders: '/api/v1/orders',
        payments: '/api/v1/payments',
        brands: '/api/v1/brands',
      }
    }
  })

  // Public auth routes (no token required)
  app.register(authRoutes, { prefix: '/api/v1/auth' })

  // All other routes — soft auth populates req.user when token present
  app.register(
    async (api) => {
      api.addHook('preHandler', async (request, reply) => {
        await authMiddleware(request, reply, env)
      })

      api.register(brandRoutes, { prefix: '/brands' })
      api.register(productRoutes, { prefix: '/products' })
      api.register(designRoutes, { prefix: '/designs' })
      api.register(orderRoutes, { prefix: '/orders' })
      api.register(paymentRoutes, { prefix: '/payments' })
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

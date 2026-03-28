// src/routes/brand.routes.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { successResponse, errorResponse } from '../lib/responses'

const createBrandSchema = z.object({
  name: z.string().min(2),
  logoUrl: z.string().url(),
})

const updateBrandSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().url().optional(),
})

export async function brandRoutes(app: FastifyInstance) {
  // POST /brands - Create brand profile (BRAND users only)
  app.post<{ Body: z.infer<typeof createBrandSchema> }>('/', async (req, reply) => {
    try {
      if (!req.user) {
        return reply.code(401).send(errorResponse('UNAUTHORIZED', 'Authentication required'))
      }
      if (req.user.role !== 'BRAND') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only brand accounts can create a brand profile'))
      }

      const existing = await app.prisma.brand.findUnique({ where: { userId: req.user.sub } })
      if (existing) {
        return reply.code(409).send(errorResponse('ALREADY_EXISTS', 'Brand profile already exists'))
      }

      const data = createBrandSchema.parse(req.body)
      const brand = await app.prisma.brand.create({
        data: {
          userId: req.user.sub,
          name: data.name,
          logoUrl: data.logoUrl,
        },
      })

      return reply.code(201).send(successResponse(brand))
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid request data'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /brands/me - Get current user's brand
  app.get('/me', async (req, reply) => {
    try {
      if (!req.user) {
        return reply.code(401).send(errorResponse('UNAUTHORIZED', 'Authentication required'))
      }

      const brand = await app.prisma.brand.findUnique({
        where: { userId: req.user.sub },
        include: {
          products: {
            where: { isActive: true },
            select: { id: true, name: true, category: true, basePrice: true },
          },
        },
      })

      if (!brand) {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Brand profile not found'))
      }

      return reply.send(successResponse(brand))
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // PUT /brands/me - Update brand profile
  app.put<{ Body: z.infer<typeof updateBrandSchema> }>('/me', async (req, reply) => {
    try {
      if (!req.user) {
        return reply.code(401).send(errorResponse('UNAUTHORIZED', 'Authentication required'))
      }
      if (req.user.role !== 'BRAND') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only brand accounts can update brand profile'))
      }

      const data = updateBrandSchema.parse(req.body)
      const brand = await app.prisma.brand.update({
        where: { userId: req.user.sub },
        data,
      })

      return reply.send(successResponse(brand))
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid request data'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /brands/:id - Public brand profile
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      const brand = await app.prisma.brand.findUnique({
        where: { id: req.params.id },
        include: {
          products: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              category: true,
              basePrice: true,
              designs: { where: { status: 'PUBLISHED' }, take: 3, select: { id: true, previewUrl: true } },
            },
          },
        },
      })

      if (!brand) {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Brand not found'))
      }

      return reply.send(successResponse(brand))
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })
}

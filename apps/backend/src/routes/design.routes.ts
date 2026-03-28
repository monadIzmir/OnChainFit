// src/routes/design.routes.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { DesignService } from '../services/design.service'
import { successResponse, errorResponse } from '../lib/responses'

export async function designRoutes(app: FastifyInstance) {
  const designService = new DesignService(app.prisma, app.env)

  // POST /designs - Create design
  app.post<{
    Body: FormData
  }>('/', async (req, reply) => {
    try {
      if (req.user?.role !== 'DESIGNER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only designers can create designs'))
      }

      // Parse multipart form data
      const data = await req.file()
      if (!data) {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'File is required'))
      }

      const buffer = await data.toBuffer()

      // Extract form fields
      const f = data.fields as Record<string, any>
      const fields = {
        productId: f['productId']?.value as string,
        title: f['title']?.value as string,
        description: f['description']?.value as string,
        salePrice: parseInt(f['salePrice']?.value as string),
      }

      if (!fields.productId || !fields.title || !fields.salePrice) {
        return reply.code(400).send(
          errorResponse('VALIDATION_ERROR', 'Missing required fields', {
            productId: !fields.productId ? ['Required'] : [],
            title: !fields.title ? ['Required'] : [],
            salePrice: !fields.salePrice ? ['Required'] : [],
          })
        )
      }

      const design = await designService.createDesign(req.user.sub, fields.productId, {
        title: fields.title,
        description: fields.description,
        fileBuffer: buffer,
        salePrice: fields.salePrice,
      })

      return reply.code(201).send(successResponse(design))
    } catch (error: any) {
      if (error.message === 'PRODUCT_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Product not found'))
      }
      if (error.message === 'PRICE_BELOW_BASE') {
        return reply.code(409).send(
          errorResponse('VALIDATION_ERROR', 'Sale price must be greater than or equal to base price')
        )
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /designs - List published designs
  app.get<{
    Querystring: { skip?: string; take?: string }
  }>('/', async (req, reply) => {
    try {
      const skip = parseInt(req.query.skip || '0', 10)
      const take = parseInt(req.query.take || '20', 10)

      const designs = await designService.getPublishedDesigns(skip, take)
      const total = await app.prisma.design.count({ where: { status: 'PUBLISHED' } })

      return reply.send(
        successResponse(designs, { skip, take, total })
      )
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /designs/mine - Designer's designs
  app.get<{
    Querystring: { skip?: string; take?: string }
  }>('/mine', async (req, reply) => {
    try {
      if (req.user?.role !== 'DESIGNER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only designers can view their designs'))
      }

      const skip = parseInt(req.query.skip || '0', 10)
      const take = parseInt(req.query.take || '20', 10)

      const designs = await designService.getDesignerDesigns(req.user.sub, skip, take)
      const total = await app.prisma.design.count({ where: { designerId: req.user.sub } })

      return reply.send(
        successResponse(designs, { skip, take, total })
      )
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /designs/:id - Design detail
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      const design = await designService.getDesignById(req.params.id)

      if (!design) {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Design not found'))
      }

      return reply.send(successResponse(design))
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // PUT /designs/:id/price - Update design price
  app.put<{
    Params: { id: string }
    Body: { salePrice: number }
  }>('/:id/price', async (req, reply) => {
    try {
      if (req.user?.role !== 'DESIGNER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only designers can update prices'))
      }

      const updated = await designService.updateDesignPrice(req.params.id, req.user.sub, req.body.salePrice)

      return reply.send(successResponse(updated))
    } catch (error: any) {
      if (error.message === 'DESIGN_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Design not found'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      if (error.message === 'PRICE_BELOW_BASE') {
        return reply.code(409).send(
          errorResponse('VALIDATION_ERROR', 'Sale price must be greater than or equal to base price')
        )
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // PUT /designs/:id/publish - Publish design
  app.put<{ Params: { id: string } }>('/:id/publish', async (req, reply) => {
    try {
      if (req.user?.role !== 'DESIGNER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only designers can publish designs'))
      }

      const updated = await designService.publishDesign(req.params.id, req.user.sub)

      return reply.send(successResponse(updated))
    } catch (error: any) {
      if (error.message === 'DESIGN_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Design not found'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // DELETE /designs/:id - Delete design
  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      if (req.user?.role !== 'DESIGNER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only designers can delete designs'))
      }

      await designService.deleteDesign(req.params.id, req.user.sub)

      return reply.code(204).send()
    } catch (error: any) {
      if (error.message === 'DESIGN_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Design not found'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      if (error.message === 'DESIGN_HAS_ACTIVE_ORDERS') {
        return reply.code(409).send(errorResponse('CONFLICT', 'Design has active orders'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })
}

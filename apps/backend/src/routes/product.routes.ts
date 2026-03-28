// src/routes/product.routes.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ProductService } from '../services/product.service'
import { successResponse, errorResponse } from '../lib/responses'

const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  templateUrl: z.string().url(),
  printZones: z.record(z.any()),
  category: z.string(),
})

export async function productRoutes(app: FastifyInstance) {
  const productService = new ProductService(app.prisma)

  // POST /products - Brand creates product
  app.post<{ Body: z.infer<typeof createProductSchema> }>('/', async (req, reply) => {
    try {
      if (req.user?.role !== 'BRAND') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only brands can create products'))
      }

      const brand = await app.prisma.brand.findUnique({
        where: { userId: req.user.sub },
      })

      if (!brand) {
        return reply.code(404).send(errorResponse('BRAND_NOT_FOUND', 'Brand profile not found'))
      }

      const data = createProductSchema.parse(req.body)
      const product = await productService.createProduct(brand.id, data)

      return reply.code(201).send(successResponse(product))
    } catch (error: any) {
      return reply.code(400).send(errorResponse('VALIDATION_ERROR', error.message))
    }
  })

  // GET /products - List products
  app.get<{
    Querystring: {
      brandId?: string
      category?: string
      skip?: string
      take?: string
    }
  }>('/', async (req, reply) => {
    try {
      const skip = parseInt(req.query.skip || '0', 10)
      const take = parseInt(req.query.take || '10', 10)

      let products
      if (req.query.brandId) {
        products = await productService.getProductsByBrand(req.query.brandId, skip, take)
      } else {
        products = await app.prisma.product.findMany({
          skip,
          take,
          where: { isActive: true },
          include: {
            brand: { select: { name: true } },
            designs: { where: { status: 'PUBLISHED' }, take: 3 },
          },
        })
      }

      const total = await app.prisma.product.count({ where: { isActive: true } })

      return reply.send(
        successResponse(products, {
          skip,
          take,
          total,
        })
      )
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /products/:id - Product detail
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      const product = await productService.getProductById(req.params.id)

      if (!product) {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Product not found'))
      }

      return reply.send(successResponse(product))
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // PUT /products/:id - Update product
  app.put<{
    Params: { id: string }
    Body: Partial<z.infer<typeof createProductSchema>>
  }>('/:id', async (req, reply) => {
    try {
      if (req.user?.role !== 'BRAND') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only brands can update products'))
      }

      const product = await app.prisma.product.findUnique({
        where: { id: req.params.id },
        include: { brand: true },
      })

      if (!product) {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Product not found'))
      }

      if (product.brand.userId !== req.user.sub) {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }

      const updated = await productService.updateProduct(req.params.id, req.body)
      return reply.send(successResponse(updated))
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // DELETE /products/:id - Delete product
  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      if (req.user?.role !== 'BRAND') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only brands can delete products'))
      }

      const product = await app.prisma.product.findUnique({
        where: { id: req.params.id },
        include: { brand: true },
      })

      if (!product) {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Product not found'))
      }

      if (product.brand.userId !== req.user.sub) {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }

      await productService.deleteProduct(req.params.id)
      return reply.code(204).send()
    } catch (error: any) {
      if (error.message === 'PRODUCT_HAS_ACTIVE_ORDERS') {
        return reply.code(409).send(errorResponse('CONFLICT', 'Product has active orders'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })
}

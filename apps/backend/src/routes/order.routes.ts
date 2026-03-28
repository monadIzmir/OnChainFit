// src/routes/order.routes.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { OrderService } from '../services/order.service'
import { successResponse, errorResponse } from '../lib/responses'

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      designId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
    name: z.string(),
    phone: z.string(),
  }),
})

export async function orderRoutes(app: FastifyInstance) {
  const orderService = new OrderService(app.prisma)

  // POST /orders - Create order
  app.post<{ Body: z.infer<typeof createOrderSchema> }>('/', async (req, reply) => {
    try {
      if (req.user?.role !== 'CUSTOMER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only customers can create orders'))
      }

      const data = createOrderSchema.parse(req.body)
      const order = await orderService.createOrder(req.user.sub, data)

      return reply.code(201).send(successResponse(order))
    } catch (error: any) {
      if (error.message === 'DESIGN_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'One or more designs not found'))
      }
      if (error instanceof z.ZodError) {
        return reply.code(400).send(
          errorResponse('VALIDATION_ERROR', 'Invalid request data', {
            items: error.flatten().fieldErrors.items || [],
            shippingAddress: error.flatten().fieldErrors.shippingAddress || [],
          })
        )
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /orders/mine - Customer's orders
  app.get<{
    Querystring: { skip?: string; take?: string }
  }>('/mine', async (req, reply) => {
    try {
      if (req.user?.role !== 'CUSTOMER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only customers can view their orders'))
      }

      const skip = parseInt(req.query.skip || '0', 10)
      const take = parseInt(req.query.take || '10', 10)

      const orders = await orderService.getCustomerOrders(req.user.sub, skip, take)
      const total = await app.prisma.order.count({ where: { customerId: req.user.sub } })

      return reply.send(successResponse(orders, { skip, take, total }))
    } catch (error: any) {
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /orders/:id - Order detail
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user?.role === 'CUSTOMER' ? req.user.sub : undefined
      )

      return reply.send(successResponse(order))
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Order not found'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // POST /orders/:id/cancel - Cancel order
  app.post<{ Params: { id: string } }>('/:id/cancel', async (req, reply) => {
    try {
      if (req.user?.role !== 'CUSTOMER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only customers can cancel orders'))
      }

      const updated = await orderService.cancelOrder(req.params.id, req.user.sub)

      return reply.send(successResponse(updated))
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Order not found'))
      }
      if (error.message === 'CANNOT_CANCEL_ORDER') {
        return reply.code(409).send(errorResponse('CONFLICT', 'Order cannot be cancelled in current state'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })
}

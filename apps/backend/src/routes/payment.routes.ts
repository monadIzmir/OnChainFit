// src/routes/payment.routes.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PaymentService } from '../services/payment.service'
import { OrderService } from '../services/order.service'
import { successResponse, errorResponse } from '../lib/responses'

const stripeIntentSchema = z.object({
  orderId: z.string(),
})

const monadPaymentSchema = z.object({
  orderId: z.string(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  amount: z.number().positive(),
})

export async function paymentRoutes(app: FastifyInstance) {
  const paymentService = new PaymentService(app.prisma, app.env)
  const orderService = new OrderService(app.prisma)

  // POST /payments/stripe/intent - Create Stripe payment intent
  app.post<{ Body: z.infer<typeof stripeIntentSchema> }>('/stripe/intent', async (req, reply) => {
    try {
      if (req.user?.role !== 'CUSTOMER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only customers can make payments'))
      }

      const data = stripeIntentSchema.parse(req.body)

      // Verify order belongs to customer
      const order = await orderService.getOrderById(data.orderId, req.user.sub)

      const intent = await paymentService.createStripePaymentIntent(
        data.orderId,
        order.totalAmount.toNumber(),
        'try'
      )

      return reply.send(successResponse(intent))
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Order not found'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid request'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // POST /payments/stripe/webhook - Stripe webhook
  app.post('/stripe/webhook', async (req, reply) => {
    try {
      const signature = req.headers['stripe-signature'] as string
      if (!signature) {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Missing signature'))
      }

      const event = await paymentService.handleStripeWebhook({
        type: 'payment_intent.succeeded',
        ...(req.body as Record<string, any>),
      })

      return reply.send(successResponse({ received: true }))
    } catch (error: any) {
      console.error('Webhook error:', error)
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', 'Webhook processing failed'))
    }
  })

  // POST /payments/monad/verify - Verify MONAD token payment
  app.post<{ Body: z.infer<typeof monadPaymentSchema> }>('/monad/verify', async (req, reply) => {
    try {
      if (req.user?.role !== 'CUSTOMER') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Only customers can make payments'))
      }

      const data = monadPaymentSchema.parse(req.body)

      // Verify order
      await orderService.getOrderById(data.orderId, req.user.sub)

      const payment = await paymentService.verifyMonadPayment(
        data.orderId,
        data.txHash,
        data.amount
      )

      return reply.send(successResponse(payment))
    } catch (error: any) {
      if (error.message === 'ORDER_NOT_FOUND') {
        return reply.code(404).send(errorResponse('NOT_FOUND', 'Order not found'))
      }
      if (error.message === 'INVALID_TX_HASH') {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid transaction hash'))
      }
      if (error.message === 'UNAUTHORIZED') {
        return reply.code(403).send(errorResponse('FORBIDDEN', 'Unauthorized'))
      }
      if (error instanceof z.ZodError) {
        return reply.code(400).send(errorResponse('VALIDATION_ERROR', 'Invalid request'))
      }
      return reply.code(500).send(errorResponse('INTERNAL_ERROR', error.message))
    }
  })

  // GET /payments/:orderId - Get payment status
  app.get<{ Params: { orderId: string } }>('/:orderId', async (req, reply) => {
    try {
      // Verify order access
      const order = await orderService.getOrderById(
        req.params.orderId,
        req.user?.role === 'CUSTOMER' ? req.user.sub : undefined
      )

      const payment = await paymentService.getPaymentByOrder(req.params.orderId)

      return reply.send(successResponse(payment))
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
}

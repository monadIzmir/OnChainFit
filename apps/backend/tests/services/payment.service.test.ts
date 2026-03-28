// tests/services/payment.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PaymentService } from '../../src/services/payment.service'
import { createMockPrismaClient, mockPaymentData, mockOrderData } from '../mocks/prisma'
import { Decimal } from '@prisma/client/runtime/library'

vi.mock('../../src/lib/payment/stripe')

describe('PaymentService', () => {
  let paymentService: PaymentService
  let mockPrisma: any
  let mockEnv: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    mockEnv = {
      STRIPE_SECRET_KEY: 'sk_test_123456',
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123456',
    }
    paymentService = new PaymentService(mockPrisma, mockEnv)
    vi.clearAllMocks()
  })

  describe('createStripePaymentIntent', () => {
    it('should create payment intent and save record', async () => {
      const orderId = 'order-1'
      const amount = 71.98
      const currency = 'USD'

      const mockPaymentIntent = {
        id: 'pi_1234567890',
        client_secret: 'pi_1234567890_secret_abcd',
        amount: amount * 100, // Stripe uses cents
      }

      mockPrisma.payment.upsert.mockResolvedValueOnce({
        ...mockPaymentData,
        orderId,
        amount: new Decimal(amount),
        currency,
      })

      const result = await paymentService.createStripePaymentIntent(orderId, amount, currency)

      expect(result.clientSecret).toBeDefined()
      expect(result.publishableKey).toBeDefined()
      expect(mockPrisma.payment.upsert).toHaveBeenCalled()
    })

    it('should use TRY as default currency', async () => {
      const orderId = 'order-1'
      const amount = 100

      mockPrisma.payment.upsert.mockResolvedValueOnce({
        ...mockPaymentData,
        currency: 'try',
      })

      await paymentService.createStripePaymentIntent(orderId, amount)

      const upsertCall = mockPrisma.payment.upsert.mock.calls[0][0]
      expect(upsertCall.create.currency).toBe('try')
    })

    it('should store client secret in metadata', async () => {
      mockPrisma.payment.upsert.mockResolvedValueOnce(mockPaymentData)

      await paymentService.createStripePaymentIntent('order-1', 100)

      const upsertCall = mockPrisma.payment.upsert.mock.calls[0][0]
      expect(upsertCall.create.metadata).toHaveProperty('clientSecret')
    })
  })

  describe('handleStripeWebhook', () => {
    it('should handle payment_intent.succeeded event', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_1234567890',
            metadata: { orderId: 'order-1' },
          },
        },
      }

      mockPrisma.payment.update.mockResolvedValueOnce({
        ...mockPaymentData,
        status: 'COMPLETED',
      })
      mockPrisma.order.update.mockResolvedValueOnce(mockOrderData)

      await paymentService.handleStripeWebhook(event)

      expect(mockPrisma.payment.update).toHaveBeenCalled()
    })

    it('should handle payment_intent.payment_failed event', async () => {
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_1234567890',
            metadata: { orderId: 'order-1' },
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      }

      mockPrisma.payment.update.mockResolvedValueOnce({
        ...mockPaymentData,
        status: 'FAILED',
      })

      await paymentService.handleStripeWebhook(event)

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
          }),
        })
      )
    })

    it('should log unknown event types', async () => {
      const logSpy = vi.spyOn(console, 'log')
      const event = {
        type: 'unknown.event',
        data: {},
      }

      await paymentService.handleStripeWebhook(event)

      expect(logSpy).toHaveBeenCalledWith('Unhandled event type: unknown.event')
      logSpy.mockRestore()
    })
  })

  describe('refundPayment', () => {
    it('should create refund and update payment status', async () => {
      const paymentId = 'payment-1'

      mockPrisma.payment.findUnique.mockResolvedValueOnce({
        ...mockPaymentData,
        metadata: { stripePiId: 'pi_1234567890' },
      })
      mockPrisma.payment.update.mockResolvedValueOnce({
        ...mockPaymentData,
        status: 'REFUNDED',
      })

      const result = await paymentService.refundPayment(paymentId)

      expect(result.status).toBe('REFUNDED')
    })
  })

  describe('getPaymentStatus', () => {
    it('should return payment details', async () => {
      const paymentId = 'payment-1'
      mockPrisma.payment.findUnique.mockResolvedValueOnce(mockPaymentData)

      const result = await paymentService.getPaymentStatus(paymentId)

      expect(result).toBeDefined()
      expect(result.status).toBe(mockPaymentData.status)
    })

    it('should throw error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValueOnce(null)

      await expect(
        paymentService.getPaymentStatus('nonexistent')
      ).rejects.toThrow()
    })
  })
})

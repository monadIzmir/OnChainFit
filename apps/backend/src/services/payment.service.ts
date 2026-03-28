// src/services/payment.service.ts
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { StripeClient } from '../lib/payment/stripe'
import type { Env } from '../config/env'

export class PaymentService {
  private stripe: StripeClient

  constructor(
    private prisma: PrismaClient,
    env: Env
  ) {
    this.stripe = new StripeClient(env)
  }

  // Create Stripe payment intent
  async createStripePaymentIntent(
    orderId: string,
    amount: number,
    currency: string = 'try'
  ) {
    const paymentIntent = await this.stripe.createPaymentIntent(
      amount,
      currency.toLowerCase(),
      { orderId }
    )

    // Save payment record
    await this.prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        method: 'STRIPE',
        amount: new Decimal(amount),
        currency,
        status: 'PENDING',
        metadata: JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          stripePiId: paymentIntent.id,
        }),
      },
      update: {
        metadata: JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          stripePiId: paymentIntent.id,
        }),
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY, // Frontend needs this
    }
  }

  // Handle Stripe webhook
  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await this.handlePaymentSucceeded(event.data.object)
      case 'payment_intent.payment_failed':
        return await this.handlePaymentFailed(event.data.object)
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId
    
    const payment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: 'COMPLETED',
        txHash: paymentIntent.id,
      },
      include: { order: true },
    })

    // Update order to CONFIRMED
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    })

    return payment
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId

    return await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: 'FAILED',
      },
    })
  }

  // Verify MONAD token payment
  async verifyMonadPayment(
    orderId: string,
    txHash: string,
    amount: number
  ) {
    // In production, verify tx on Monad testnet via RPC
    // For now, accept with validation
    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      throw new Error('INVALID_TX_HASH')
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method: 'MONAD_TOKEN',
        amount: new Decimal(amount),
        currency: 'MONAD',
        status: 'COMPLETED',
        txHash,
      },
      include: { order: true },
    })

    // Update order to CONFIRMED
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    })

    return payment
  }

  // Get payment by order
  async getPaymentByOrder(orderId: string) {
    return await this.prisma.payment.findUnique({
      where: { orderId },
    })
  }

  // Process refund
  async processRefund(orderId: string) {
    const payment = await this.getPaymentByOrder(orderId)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    if (payment.method === 'STRIPE' && payment.txHash) {
      // Refund via Stripe
      await this.stripe.refund(payment.txHash, payment.amount.toNumber())
    }

    return await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    })
  }
}

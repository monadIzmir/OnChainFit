// src/lib/payment/stripe.ts
import Stripe from 'stripe'
import type { Env } from '../../config/env'

export class StripeClient {
  private stripe: Stripe

  constructor(env: Env) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'try',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        ...metadata,
      },
    })
  }

  async retrievePaymentIntent(clientSecret: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(clientSecret)
  }

  async verifyWebhook(body: string, signature: string, secret: string): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(body, signature, secret)
  }

  async refund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    })
  }
}

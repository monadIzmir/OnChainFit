// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  ELASTICSEARCH_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Blockchain
  MONAD_TESTNET_RPC: z.string().url(),
  BACKEND_SIGNER_PRIVATE_KEY: z.string().startsWith('0x'),
  REGISTRY_CONTRACT_ADDRESS: z.string().startsWith('0x'),
  DISTRIBUTOR_CONTRACT_ADDRESS: z.string().startsWith('0x'),
  PLATFORM_WALLET_ADDRESS: z.string().startsWith('0x'),

  // Storage
  CLOUDFLARE_R2_ACCOUNT_ID: z.string(),
  CLOUDFLARE_R2_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_SECRET_KEY: z.string(),
  CLOUDFLARE_R2_BUCKET: z.string(),
  PINATA_API_KEY: z.string(),
  PINATA_SECRET_KEY: z.string(),

  // Payment
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string(),

  // Email
  RESEND_API_KEY: z.string(),

  // Optional
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(): Env {
  const env = envSchema.parse(process.env)
  return env
}

// tests/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Setup environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-only'
process.env.JWT_EXPIRY = '7d'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/printchain_test'
process.env.REDIS_URL = 'redis://localhost:6379/1'
process.env.STRIPE_SECRET_KEY = 'sk_test_123456'
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_S3_BUCKET = 'test-bucket'
process.env.PINATA_JWT = 'test-pinata-jwt'
process.env.MONAD_RPC_URL = 'http://localhost:8545'

// Global test hooks
beforeAll(() => {
  console.log('Starting test suite...')
})

afterAll(() => {
  console.log('Test suite completed')
})

beforeEach(() => {
  // Reset mocks before each test
})

afterEach(() => {
  // Cleanup after each test
})

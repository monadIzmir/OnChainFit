// tests/setup.ts
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock fetch globally
globalThis.fetch = jest.fn()

// Setup Mock Service Worker
export const mswServer = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      user: {
        id: 'test-user',
        email: 'test@example.com',
        role: 'CUSTOMER',
      },
      accessToken: 'test-token',
    }))
  }),
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json({
      products: [],
    }))
  }),
  rest.get('/api/designs', (req, res, ctx) => {
    return res(ctx.json({
      designs: [],
    }))
  })
)

beforeAll(() => {
  mswServer.listen()
})

afterEach(() => {
  mswServer.resetHandlers()
  jest.clearAllMocks()
})

afterAll(() => {
  mswServer.close()
})

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

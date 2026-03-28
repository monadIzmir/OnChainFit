// tests/mocks/prisma.ts
import { vi } from 'vitest'

export const mockPrismaClient = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  design: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  payment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  payout: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

export const createMockPrismaClient = () => {
  return {
    ...mockPrismaClient,
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }
}

// Mock data factories
export const mockUserData = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$2b$12$...',
  role: 'BRAND' as const,
  walletAddress: '0x1234567890123456789012345678901234567890',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockProductData = {
  id: 'product-1',
  brandId: 'user-1',
  name: 'T-Shirt',
  description: 'Comfortable cotton t-shirt',
  basePrice: 25.99,
  templateUrl: 'https://example.com/template.png',
  printZones: { chest: { x: 100, y: 100, width: 200, height: 200 } },
  category: 'APPAREL',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockDesignData = {
  id: 'design-1',
  creatorId: 'user-2',
  productId: 'product-1',
  title: 'Cool Logo Design',
  description: 'A cool logo for the t-shirt',
  designData: { layers: [], version: '6.0' },
  previewUrl: 'https://example.com/preview.png',
  salePrice: 35.99,
  royaltyPercentage: 15,
  status: 'PUBLISHED' as const,
  blockchainHash: '0xabcd1234',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockOrderData = {
  id: 'order-1',
  customerId: 'user-3',
  designId: 'design-1',
  productId: 'product-1',
  quantity: 2,
  totalPrice: 71.98,
  status: 'PENDING' as const,
  shippingAddress: '123 Main St, New York, NY 10001',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockPaymentData = {
  id: 'payment-1',
  orderId: 'order-1',
  amount: 71.98,
  currency: 'USD',
  method: 'STRIPE' as const,
  status: 'COMPLETED' as const,
  stripePaymentIntentId: 'pi_1234567890',
  transactionHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

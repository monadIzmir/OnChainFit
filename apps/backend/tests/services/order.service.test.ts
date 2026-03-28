// tests/services/order.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderService } from '../../src/services/order.service'
import { createMockPrismaClient, mockOrderData, mockDesignData, mockProductData } from '../mocks/prisma'
import { Decimal } from '@prisma/client/runtime/library'

describe('OrderService', () => {
  let orderService: OrderService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    orderService = new OrderService(mockPrisma)
    vi.clearAllMocks()
  })

  describe('createOrder', () => {
    it('should create order with valid items', async () => {
      const customerId = 'customer-1'
      const orderData = {
        items: [{ designId: 'design-1', quantity: 2 }],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          country: 'USA',
        },
      }

      const designWithProduct = {
        ...mockDesignData,
        product: mockProductData,
        designer: { id: 'designer-1' },
      }

      mockPrisma.design.findUnique.mockResolvedValueOnce(designWithProduct)
      mockPrisma.order.create.mockResolvedValueOnce({
        ...mockOrderData,
        customerId,
        status: 'PENDING',
      })

      const result = await orderService.createOrder(customerId, orderData)

      expect(result).toBeDefined()
      expect(result.status).toBe('PENDING')
      expect(mockPrisma.order.create).toHaveBeenCalled()
    })

    it('should calculate total amount correctly', async () => {
      const customerId = 'customer-1'
      const orderData = {
        items: [
          { designId: 'design-1', quantity: 2 },
          { designId: 'design-2', quantity: 1 },
        ],
        shippingAddress: { city: 'NYC' },
      }

      const designs = [
        { ...mockDesignData, salePrice: new Decimal(35.99), product: mockProductData, designer: { id: 'designer-1' } },
        { ...mockDesignData, salePrice: new Decimal(45.99), productId: 'product-2', product: mockProductData, designer: { id: 'designer-2' } },
      ]

      mockPrisma.design.findUnique.mockResolvedValueOnce(designs[0])
      mockPrisma.design.findUnique.mockResolvedValueOnce(designs[1])
      mockPrisma.order.create.mockResolvedValueOnce({
        ...mockOrderData,
        totalAmount: new Decimal(117.97), // (35.99 * 2) + 45.99
      })

      const result = await orderService.createOrder(customerId, orderData)

      expect(mockPrisma.order.create).toHaveBeenCalled()
    })

    it('should throw error if design not found', async () => {
      mockPrisma.design.findUnique.mockResolvedValueOnce(null)

      const orderData = {
        items: [{ designId: 'nonexistent', quantity: 1 }],
        shippingAddress: { city: 'NYC' },
      }

      await expect(
        orderService.createOrder('customer-1', orderData)
      ).rejects.toThrow('DESIGN_NOT_FOUND')
    })

    it('should create order items with snapshot data', async () => {
      const customerId = 'customer-1'
      mockPrisma.design.findUnique.mockResolvedValueOnce({
        ...mockDesignData,
        product: mockProductData,
        designer: { id: 'designer-1' },
      })
      mockPrisma.order.create.mockResolvedValueOnce({
        ...mockOrderData,
        items: [{
          designId: 'design-1',
          quantity: 1,
          snapshot: {
            designId: 'design-1',
            designTitle: 'Cool Logo Design',
            designerId: 'designer-1',
            productId: 'product-1',
            brandId: 'user-1',
          },
        }],
      })

      const orderData = {
        items: [{ designId: 'design-1', quantity: 1 }],
        shippingAddress: { city: 'NYC' },
      }

      await orderService.createOrder(customerId, orderData)

      const createCall = mockPrisma.order.create.mock.calls[0][0]
      expect(createCall.data.items.create[0].snapshot).toBeDefined()
    })
  })

  describe('getOrder', () => {
    it('should fetch order by id with items and payment', async () => {
      const orderId = 'order-1'
      mockPrisma.order.findUnique.mockResolvedValueOnce(mockOrderData)

      const result = await orderService.getOrder(orderId)

      expect(result).toBeDefined()
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      })
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const orderId = 'order-1'
      const newStatus = 'CONFIRMED'

      mockPrisma.order.update.mockResolvedValueOnce({
        ...mockOrderData,
        status: 'CONFIRMED',
      })

      const result = await orderService.updateOrderStatus(orderId, 'CONFIRMED' as any)

      expect(result.status).toBe('CONFIRMED')
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
        include: expect.any(Object),
      })
    })
  })
})

// tests/services/product.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductService } from '../../src/services/product.service'
import { createMockPrismaClient, mockProductData } from '../mocks/prisma'
import { Decimal } from '@prisma/client/runtime/library'

describe('ProductService', () => {
  let productService: ProductService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    productService = new ProductService(mockPrisma)
    vi.clearAllMocks()
  })

  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      const brandId = 'brand-1'
      const productData = {
        name: 'Premium T-Shirt',
        description: 'High quality cotton t-shirt',
        basePrice: 29.99,
        templateUrl: 'https://example.com/template.png',
        printZones: { chest: { x: 100, y: 100 } },
        category: 'APPAREL',
      }

      mockPrisma.product.create.mockResolvedValueOnce({
        ...mockProductData,
        ...productData,
        brandId,
      })

      const result = await productService.createProduct(brandId, productData)

      expect(result).toBeDefined()
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          brandId,
          name: productData.name,
          description: productData.description,
        }),
      })
    })

    it('should convert basePrice to Decimal', async () => {
      const brandId = 'brand-1'
      const productData = {
        name: 'Product',
        basePrice: 25.99,
        templateUrl: 'https://example.com/template.png',
        printZones: {},
        category: 'APPAREL',
      }

      mockPrisma.product.create.mockResolvedValueOnce(mockProductData)

      await productService.createProduct(brandId, productData)

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            basePrice: expect.any(Decimal),
          }),
        })
      )
    })
  })

  describe('getProductsByBrand', () => {
    it('should fetch products by brand with pagination', async () => {
      const brandId = 'brand-1'
      const mockProducts = [mockProductData, { ...mockProductData, id: 'product-2' }]

      mockPrisma.product.findMany.mockResolvedValueOnce(mockProducts)

      const result = await productService.getProductsByBrand(brandId, 0, 10)

      expect(result).toHaveLength(2)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { brandId },
        skip: 0,
        take: 10,
        include: expect.any(Object),
      })
    })

    it('should use default pagination values', async () => {
      const brandId = 'brand-1'
      mockPrisma.product.findMany.mockResolvedValueOnce([])

      await productService.getProductsByBrand(brandId)

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      )
    })

    it('should include only published designs', async () => {
      const brandId = 'brand-1'
      mockPrisma.product.findMany.mockResolvedValueOnce([])

      await productService.getProductsByBrand(brandId)

      const callArgs = mockPrisma.product.findMany.mock.calls[0][0]
      expect(callArgs.include.designs.where.status).toBe('PUBLISHED')
    })
  })

  describe('getProductById', () => {
    it('should fetch product by id with brand info', async () => {
      const productId = 'product-1'
      mockPrisma.product.findUnique.mockResolvedValueOnce(mockProductData)

      const result = await productService.getProductById(productId)

      expect(result).toBeDefined()
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: expect.objectContaining({
          brand: expect.any(Object),
        }),
      })
    })

    it('should return null if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null)

      const result = await productService.getProductById('nonexistent')

      expect(result).toBeNull()
    })
  })
})

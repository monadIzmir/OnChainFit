// tests/services/design.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DesignService } from '../../src/services/design.service'
import { createMockPrismaClient, mockDesignData, mockProductData } from '../mocks/prisma'
import { Decimal } from '@prisma/client/runtime/library'

vi.mock('../../src/lib/storage/ipfs')
vi.mock('../../src/lib/storage/r2')
vi.mock('../../src/lib/blockchain/registry')

describe('DesignService', () => {
  let designService: DesignService
  let mockPrisma: any
  let mockEnv: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    mockEnv = {
      PINATA_JWT: 'test-jwt',
      AWS_REGION: 'us-east-1',
      AWS_S3_BUCKET: 'test-bucket',
      MONAD_RPC_URL: 'http://localhost:8545',
      REGISTRY_CONTRACT_ADDRESS: '0x1234',
    }
    designService = new DesignService(mockPrisma, mockEnv)
    vi.clearAllMocks()
  })

  describe('createDesign', () => {
    it('should create design with valid data', async () => {
      const designerId = 'designer-1'
      const productId = 'product-1'
      const designData = {
        title: 'Cool Logo',
        description: 'A cool design',
        fileBuffer: Buffer.from('fake-image-data'),
        salePrice: 35.99,
      }

      mockPrisma.product.findUnique.mockResolvedValueOnce(mockProductData)
      mockPrisma.design.create.mockResolvedValueOnce({
        ...mockDesignData,
        designerId,
        productId,
      })

      const result = await designService.createDesign(designerId, productId, designData)

      expect(result).toBeDefined()
      expect(result.title).toBe(designData.title)
      expect(mockPrisma.design.create).toHaveBeenCalled()
    })

    it('should validate product exists', async () => {
      const designData = {
        title: 'Design',
        fileBuffer: Buffer.from('data'),
        salePrice: 35.99,
      }

      mockPrisma.product.findUnique.mockResolvedValueOnce(null)

      await expect(
        designService.createDesign('designer-1', 'nonexistent', designData)
      ).rejects.toThrow('PRODUCT_NOT_FOUND')
    })

    it('should validate sale price is not below base price', async () => {
      const designData = {
        title: 'Design',
        fileBuffer: Buffer.from('data'),
        salePrice: 15.99, // Below mockProductData basePrice of 25.99
      }

      mockPrisma.product.findUnique.mockResolvedValueOnce(mockProductData)

      await expect(
        designService.createDesign('designer-1', 'product-1', designData)
      ).rejects.toThrow('PRICE_BELOW_BASE')
    })

    it('should create design with status DRAFT', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(mockProductData)
      mockPrisma.design.create.mockResolvedValueOnce({
        ...mockDesignData,
        status: 'DRAFT',
      })

      const designData = {
        title: 'New Design',
        fileBuffer: Buffer.from('data'),
        salePrice: 35.99,
      }

      await designService.createDesign('designer-1', 'product-1', designData)

      const createCall = mockPrisma.design.create.mock.calls[0][0]
      expect(createCall.data.status).toBe('DRAFT')
    })
  })

  describe('publishDesign', () => {
    it('should publish design for authorized designer', async () => {
      const designId = 'design-1'
      const designerId = 'designer-1'

      mockPrisma.design.findUnique.mockResolvedValueOnce({
        ...mockDesignData,
        designerId,
      })
      mockPrisma.design.update.mockResolvedValueOnce({
        ...mockDesignData,
        status: 'PUBLISHED',
      })

      const result = await designService.publishDesign(designId, designerId)

      expect(result.status).toBe('PUBLISHED')
      expect(mockPrisma.design.update).toHaveBeenCalledWith({
        where: { id: designId },
        data: { status: 'PUBLISHED' },
      })
    })

    it('should reject if design not found', async () => {
      mockPrisma.design.findUnique.mockResolvedValueOnce(null)

      await expect(
        designService.publishDesign('nonexistent', 'designer-1')
      ).rejects.toThrow('DESIGN_NOT_FOUND')
    })

    it('should reject if unauthorized designer', async () => {
      mockPrisma.design.findUnique.mockResolvedValueOnce({
        ...mockDesignData,
        designerId: 'designer-2',
      })

      await expect(
        designService.publishDesign('design-1', 'designer-1')
      ).rejects.toThrow('UNAUTHORIZED')
    })
  })

  describe('getDesignsByCreator', () => {
    it('should fetch designs for a creator', async () => {
      const creatorId = 'designer-1'
      const mockDesigns = [mockDesignData, { ...mockDesignData, id: 'design-2' }]

      mockPrisma.design.findMany.mockResolvedValueOnce(mockDesigns)

      const result = await designService.getDesignsByCreator(creatorId, 0, 10)

      expect(result).toHaveLength(2)
      expect(mockPrisma.design.findMany).toHaveBeenCalled()
    })
  })

  describe('getPublishedDesigns', () => {
    it('should fetch only published designs', async () => {
      const publishedDesigns = [{ ...mockDesignData, status: 'PUBLISHED' }]

      mockPrisma.design.findMany.mockResolvedValueOnce(publishedDesigns)

      const result = await designService.getPublishedDesigns('product-1')

      expect(result[0].status).toBe('PUBLISHED')
    })
  })
})

// src/services/design.service.ts
import { PrismaClient, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { IPFSClient } from '../lib/storage/ipfs'
import { R2Client } from '../lib/storage/r2'
import { PrintChainRegistryClient } from '../lib/blockchain/registry'
import type { Env } from '../config/env'

export class DesignService {
  private prisma: PrismaClient
  private ipfs: IPFSClient
  private r2: R2Client
  private registry: PrintChainRegistryClient

  constructor(
    prisma: PrismaClient,
    env: Env
  ) {
    this.prisma = prisma
    this.ipfs = new IPFSClient(env)
    this.r2 = new R2Client(env)
    this.registry = new PrintChainRegistryClient(env)
  }

  async createDesign(
    designerId: string,
    productId: string,
    data: {
      title: string
      description?: string
      fileBuffer: Buffer
      salePrice: number
      canvasData?: Record<string, any>
    }
  ) {
    // Validate price
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND')
    }

    if (new Decimal(data.salePrice) < product.basePrice) {
      throw new Error('PRICE_BELOW_BASE')
    }

    // 1. Upload preview to R2
    const designId = `${designerId}-${Date.now()}`
    const previewUrl = await this.r2.uploadDesignPreview(data.fileBuffer, designId)

    // 2. Pin design file to IPFS
    const ipfsHash = await this.ipfs.uploadFile(data.fileBuffer, `${data.title}.png`)

    // 3. Register on blockchain
    let onChainId = null
    try {
      onChainId = await this.registry.registerDesign(ipfsHash, designerId)
    } catch (error) {
      console.error('Blockchain registration failed:', error)
      // Continue even if blockchain fails for now
    }

    // 4. Save to database
    const design = await this.prisma.design.create({
      data: {
        designerId,
        productId,
        title: data.title,
        description: data.description,
        ipfsHash,
        previewUrl,
        salePrice: new Decimal(data.salePrice),
        status: 'DRAFT',
        onChainId: onChainId ? BigInt(onChainId) : undefined,
      },
      include: {
        designer: { select: { id: true, profile: { select: { firstName: true } } } },
        product: { select: { id: true, name: true, basePrice: true } },
      },
    })

    return design
  }

  async publishDesign(designId: string, designerId: string) {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { designer: true },
    })

    if (!design) {
      throw new Error('DESIGN_NOT_FOUND')
    }

    if (design.designerId !== designerId) {
      throw new Error('UNAUTHORIZED')
    }

    return await this.prisma.design.update({
      where: { id: designId },
      data: { status: 'PUBLISHED' },
    })
  }

  async updateDesignPrice(designId: string, designerId: string, newPrice: number) {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { product: true },
    })

    if (!design) {
      throw new Error('DESIGN_NOT_FOUND')
    }

    if (design.designerId !== designerId) {
      throw new Error('UNAUTHORIZED')
    }

    if (new Decimal(newPrice) < design.product.basePrice) {
      throw new Error('PRICE_BELOW_BASE')
    }

    return await this.prisma.design.update({
      where: { id: designId },
      data: { salePrice: new Decimal(newPrice) },
    })
  }

  async getDesignById(designId: string) {
    return await this.prisma.design.findUnique({
      where: { id: designId },
      include: {
        designer: { select: { id: true, profile: { select: { firstName: true, lastName: true, avatar: true } } } },
        product: { select: { id: true, name: true, basePrice: true, brandId: true } },
      },
    })
  }

  async getDesignerDesigns(designerId: string, skip: number = 0, take: number = 10) {
    return await this.prisma.design.findMany({
      where: { designerId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, brand: { select: { name: true } } } },
      },
    })
  }

  async getPublishedDesigns(skip: number = 0, take: number = 20) {
    return await this.prisma.design.findMany({
      where: { status: 'PUBLISHED' },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        designer: { select: { profile: { select: { firstName: true } } } },
        product: { select: { name: true, brand: { select: { name: true } } } },
      },
    })
  }

  async deleteDesign(designId: string, designerId: string) {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
    })

    if (!design) {
      throw new Error('DESIGN_NOT_FOUND')
    }

    if (design.designerId !== designerId) {
      throw new Error('UNAUTHORIZED')
    }

    // Check if design has active orders
    const activeOrder = await this.prisma.orderItem.findFirst({
      where: {
        designId,
        order: { status: { notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'] } },
      },
    })

    if (activeOrder) {
      throw new Error('DESIGN_HAS_ACTIVE_ORDERS')
    }

    return await this.prisma.design.delete({
      where: { id: designId },
    })
  }
}

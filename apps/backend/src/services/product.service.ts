// src/services/product.service.ts
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async createProduct(
    brandId: string,
    data: {
      name: string
      description?: string
      basePrice: number
      templateUrl: string
      printZones: Record<string, any>
      category: string
    }
  ) {
    return await this.prisma.product.create({
      data: {
        brandId,
        name: data.name,
        description: data.description,
        basePrice: new Decimal(data.basePrice),
        templateUrl: data.templateUrl,
        printZones: JSON.stringify(data.printZones),
        category: data.category,
      },
    })
  }

  async getProductsByBrand(brandId: string, skip: number = 0, take: number = 10) {
    return await this.prisma.product.findMany({
      where: { brandId },
      skip,
      take,
      include: {
        designs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, salePrice: true, previewUrl: true },
        },
      },
    })
  }

  async getProductById(productId: string) {
    return await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: { select: { userId: true, name: true } },
        designs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, salePrice: true, previewUrl: true, designer: { select: { id: true, profile: { select: { firstName: true } } } } },
        },
      },
    })
  }

  async updateProduct(
    productId: string,
    data: Partial<{
      name: string
      description: string
      basePrice: number
      category: string
    }>
  ) {
    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.description) updateData.description = data.description
    if (data.basePrice) updateData.basePrice = new Decimal(data.basePrice)
    if (data.category) updateData.category = data.category

    return await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    })
  }

  async deleteProduct(productId: string) {
    // Check if product has active orders
    const activeOrders = await this.prisma.orderItem.findFirst({
      where: {
        design: { productId },
        order: { status: { notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED'] } },
      },
    })

    if (activeOrders) {
      throw new Error('PRODUCT_HAS_ACTIVE_ORDERS')
    }

    return await this.prisma.product.delete({
      where: { id: productId },
    })
  }
}

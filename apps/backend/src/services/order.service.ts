// src/services/order.service.ts
import { PrismaClient } from '@prisma/client'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
import { Decimal } from '@prisma/client/runtime/library'

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  // Create order from cart items
  async createOrder(
    customerId: string,
    data: {
      items: Array<{ designId: string; quantity: number }>
      shippingAddress: Record<string, any>
    }
  ) {
    // Fetch design details and prices
    const designDetails = await Promise.all(
      data.items.map(item =>
        this.prisma.design.findUnique({
          where: { id: item.designId },
          include: {
            product: { select: { basePrice: true, brandId: true } },
            designer: { select: { id: true } },
          },
        })
      )
    )

    // Check all designs exist
    if (designDetails.some(d => !d)) {
      throw new Error('DESIGN_NOT_FOUND')
    }

    // Calculate total and create order items
    let totalAmount = new Decimal(0)
    const orderItems = data.items.map((item, idx) => {
      const design = designDetails[idx]!
      const itemTotal = new Decimal(design.salePrice).mul(item.quantity)
      totalAmount = totalAmount.plus(itemTotal)

      return {
        designId: item.designId,
        quantity: item.quantity,
        unitPrice: design.salePrice,
        snapshot: {
          designId: design.id,
          designTitle: design.title,
          designerId: design.designer.id,
          productId: design.productId,
          brandId: design.product.brandId,
          salePrice: design.salePrice.toString(),
          basePrice: design.product.basePrice.toString(),
        },
      }
    })

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        customerId,
        status: 'PENDING',
        totalAmount,
        shippingAddress: JSON.stringify(data.shippingAddress),
        items: {
          create: orderItems.map(item => ({
            ...item,
            snapshot: JSON.stringify(item.snapshot),
          })),
        },
      },
      include: {
        items: {
          include: {
            design: { select: { title: true, previewUrl: true } },
          },
        },
        payment: true,
      },
    })

    return order
  }

  // Get order by ID
  async getOrderById(orderId: string, customerId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            design: { select: { id: true, title: true, previewUrl: true, salePrice: true } },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            amount: true,
            currency: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error('ORDER_NOT_FOUND')
    }

    // Validate customer if provided
    if (customerId && order.customerId !== customerId) {
      throw new Error('UNAUTHORIZED')
    }

    return order
  }

  // List customer orders
  async getCustomerOrders(customerId: string, skip: number = 0, take: number = 10) {
    return await this.prisma.order.findMany({
      where: { customerId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { take: 1 },
        payment: { select: { status: true } },
      },
    })
  }

  // Update order status (FSM)
  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('ORDER_NOT_FOUND')
    }

    // Validate status transition
    const validTransitions: Record<string, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    }

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new Error('INVALID_STATUS_TRANSITION')
    }

    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    })
  }

  // Cancel order
  async cancelOrder(orderId: string, customerId: string) {
    const order = await this.getOrderById(orderId, customerId)

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new Error('CANNOT_CANCEL_ORDER')
    }

    return await this.updateOrderStatus(orderId, 'CANCELLED')
  }

  // Mark order as paid
  async markOrderAsPaid(orderId: string) {
    return await this.updateOrderStatus(orderId, 'CONFIRMED')
  }
}

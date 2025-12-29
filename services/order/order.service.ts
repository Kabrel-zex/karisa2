/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { inventoryService } from "../inventory/inventory.service";
import type { OrderStatus } from "@prisma/client";

export interface CreateOrderData {
  userId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod: string;
  paymentMethod: string;
  couponCode?: string;
}

export class OrderService {
  /**
   * Crée une nouvelle commande
   */
  async createOrder(data: CreateOrderData) {
    // Générer le numéro de commande
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Calculer les totaux
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Appliquer coupon si fourni
    let discount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode },
      });
      if (coupon && coupon.isActive) {
        // Calculer la réduction
        if (coupon.discountType === "percentage") {
          discount = (subtotal * Number(coupon.discountValue)) / 100;
        } else {
          discount = Number(coupon.discountValue);
        }
      }
    }

    // Calculer les frais de livraison (simplifié)
    const shippingCost = 5.99; // À calculer via ShippingService

    // Calculer les taxes (simplifié)
    const tax = (subtotal - discount) * 0.2; // 20% TVA

    const total = subtotal - discount + shippingCost + tax;

    // Réserver le stock pour chaque item
    for (const item of data.items) {
      await inventoryService.reserveStock({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        orderId: "", // Sera mis à jour après création
        reservedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId,
        status: "pending",
        paymentStatus: "pending",
        subtotal,
        tax,
        shippingCost,
        discount,
        total,
        currency: "EUR",
        shippingMethod: data.shippingMethod as any,
        paymentMethod: data.paymentMethod as any,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        customerEmail: "", // À récupérer de l'utilisateur
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            productName: "", // À récupérer du produit
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            vendor: true,
          },
        },
        user: true,
      },
    });

    // Publier événement
    // await eventBus.publish("order.created", { orderId: order.id });

    return order;
  }

  /**
   * Met à jour le statut d'une commande
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Enregistrer dans l'historique
    await prisma.orderHistory.create({
      data: {
        orderId,
        status,
        note,
      },
    });

    // Publier événement
    // await eventBus.publish("order.status_updated", { orderId, status });

    return order;
  }

  /**
   * Récupère les commandes d'un utilisateur
   */
  async getUserOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère une commande par ID
   */
  async getOrderById(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
            vendor: true,
          },
        },
        user: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
        payments: true,
        shipments: {
          include: {
            events: {
              orderBy: { timestamp: "desc" },
            },
          },
        },
      },
    });
  }
}

export const orderService = new OrderService();


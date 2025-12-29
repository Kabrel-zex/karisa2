import { prisma } from "@/lib/prisma";

export interface ReserveStockData {
  productId: string;
  variantId?: string;
  quantity: number;
  orderId: string;
  reservedUntil: Date;
}

export class InventoryService {
  /**
   * Vérifie la disponibilité du stock
   */
  async checkAvailability(productId: string, variantId?: string, quantity = 1): Promise<boolean> {
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });
      return variant ? variant.stockQuantity >= quantity : false;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    return product ? product.stockQuantity >= quantity : false;
  }

  /**
   * Réserve du stock pour une commande
   */
  async reserveStock(data: ReserveStockData): Promise<void> {
    // Vérifier la disponibilité
    const available = await this.checkAvailability(
      data.productId,
      data.variantId,
      data.quantity
    );

    if (!available) {
      throw new Error("Insufficient stock");
    }

    // Mettre à jour le stock (dans un vrai système, utiliser des transactions)
    if (data.variantId) {
      await prisma.productVariant.update({
        where: { id: data.variantId },
        data: {
          stockQuantity: {
            decrement: data.quantity,
          },
        },
      });
    } else {
      await prisma.product.update({
        where: { id: data.productId },
        data: {
          stockQuantity: {
            decrement: data.quantity,
          },
        },
      });
    }

    // Enregistrer la réservation (à créer dans le schéma si nécessaire)
    // await prisma.reservation.create({ ... });
  }

  /**
   * Libère du stock réservé
   */
  async releaseStock(productId: string, variantId: string | undefined, quantity: number): Promise<void> {
    if (variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          stockQuantity: {
            increment: quantity,
          },
        },
      });
    } else {
      await prisma.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            increment: quantity,
          },
        },
      });
    }
  }

  /**
   * Met à jour le stock après réception
   */
  async updateStock(productId: string, variantId: string | undefined, quantity: number): Promise<void> {
    if (variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: quantity },
      });
    } else {
      await prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: quantity },
      });
    }

    // Vérifier le seuil d'alerte
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (product && product.stockQuantity <= product.lowStockThreshold) {
      // Publier événement pour notification
      // await eventBus.publish("inventory.low_stock", { productId, quantity: product.stockQuantity });
    }
  }

  /**
   * Récupère les produits en rupture de stock
   */
  async getLowStockProducts(threshold?: number) {
    return await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: threshold || 10,
        },
        status: "active",
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
    });
  }
}

export const inventoryService = new InventoryService();


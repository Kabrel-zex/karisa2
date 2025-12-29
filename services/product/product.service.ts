/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import type { ProductStatus } from "@prisma/client";

export interface CreateProductData {
  vendorId: string;
  categoryId?: string;
  sku?: string;
  nameFr: string;
  nameEn: string;
  descriptionFr?: string;
  descriptionEn?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  status?: ProductStatus;
}

export interface ProductFilters {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductService {
  /**
   * Crée un nouveau produit
   */
  async createProduct(data: CreateProductData) {
    const product = await prisma.product.create({
      data: {
        vendorId: data.vendorId,
        categoryId: data.categoryId,
        sku: data.sku,
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        stockQuantity: data.stockQuantity,
        status: data.status || "pending_review",
      },
      include: {
        vendor: true,
        category: true,
        images: true,
      },
    });

    // Publier événement pour indexation Elasticsearch
    // await eventBus.publish("product.created", { productId: product.id });

    return product;
  }

  /**
   * Recherche des produits avec filtres
   */
  async searchProducts(filters: ProductFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Recherche textuelle (à améliorer avec Elasticsearch)
    if (filters.search) {
      where.OR = [
        { nameFr: { contains: filters.search, mode: "insensitive" } },
        { nameEn: { contains: filters.search, mode: "insensitive" } },
        { descriptionFr: { contains: filters.search, mode: "insensitive" } },
        { descriptionEn: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              rating: true,
            },
          },
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un produit par ID
   */
  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        category: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Met à jour un produit
   */
  async updateProduct(id: string, data: Partial<CreateProductData>) {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        vendor: true,
        category: true,
        images: true,
      },
    });

    // Publier événement pour mise à jour Elasticsearch
    // await eventBus.publish("product.updated", { productId: product.id });

    return product;
  }

  /**
   * Supprime un produit (soft delete)
   */
  async deleteProduct(id: string) {
    const product = await prisma.product.update({
      where: { id },
      data: { status: "inactive" },
    });

    // Publier événement pour suppression Elasticsearch
    // await eventBus.publish("product.deleted", { productId: product.id });

    return product;
  }
}

export const productService = new ProductService();


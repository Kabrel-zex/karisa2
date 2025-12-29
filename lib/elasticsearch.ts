/* eslint-disable @typescript-eslint/no-explicit-any */
// Placeholder pour Elasticsearch - À implémenter avec @elastic/elasticsearch
import { prisma } from "@/lib/prisma";

interface SearchFilters {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  limit: number;
  offset: number;
}

export async function searchProducts(query: string, filters: SearchFilters) {
  // Fallback sur PostgreSQL si Elasticsearch n'est pas configuré
  const where: any = {
    OR: [
      { nameFr: { contains: query, mode: "insensitive" } },
      { nameEn: { contains: query, mode: "insensitive" } },
      { descriptionFr: { contains: query, mode: "insensitive" } },
      { descriptionEn: { contains: query, mode: "insensitive" } },
    ],
    status: "active",
  };

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
      take: filters.limit,
      skip: filters.offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
  };
}

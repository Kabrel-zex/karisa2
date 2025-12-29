import { prisma } from "./prisma";

export interface CreateReviewData {
  productId: string;
  userId: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export async function createReview(data: CreateReviewData) {
  // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
  const existing = await prisma.review.findFirst({
    where: {
      productId: data.productId,
      userId: data.userId,
      ...(data.orderItemId && { orderItemId: data.orderItemId }),
    },
  });

  if (existing) {
    throw new Error("Review already exists");
  }

  // Vérifier si l'utilisateur a acheté le produit (pour verified purchase)
  const hasPurchased = data.orderItemId
    ? await prisma.orderItem.findFirst({
        where: {
          id: data.orderItemId,
          order: {
            userId: data.userId,
            status: "delivered",
          },
        },
      })
    : false;

  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      userId: data.userId,
      orderItemId: data.orderItemId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images ? JSON.stringify(data.images) : null,
      isVerifiedPurchase: !!hasPurchased,
    },
  });

  // Mettre à jour la note moyenne du produit
  await updateProductRating(data.productId);

  return review;
}

export async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  if (reviews.length === 0) {
    return;
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
      totalReviews: reviews.length,
    },
  });
}

export async function addSellerResponse(
  reviewId: string,
  vendorId: string,
  content: string
) {
  return await prisma.sellerResponse.create({
    data: {
      reviewId,
      vendorId,
      content,
    },
  });
}

export async function markReviewHelpful(reviewId: string, userId: string, isHelpful: boolean) {
  return await prisma.reviewHelpful.upsert({
    where: {
      reviewId_userId: {
        reviewId,
        userId,
      },
    },
    create: {
      reviewId,
      userId,
      isHelpful,
    },
    update: {
      isHelpful,
    },
  });
}

export async function getProductReviews(productId: string, limit = 10, offset = 0) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      sellerResponse: {
        include: {
          vendor: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      helpful: {
        select: {
          userId: true,
          isHelpful: true,
        },
      },
    },
    orderBy: [
      { helpfulCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
    skip: offset,
  });

  const total = await prisma.review.count({
    where: { productId },
  });

  return {
    reviews,
    total,
    hasMore: offset + limit < total,
  };
}


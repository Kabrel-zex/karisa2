import { prisma } from "./prisma";

export async function moderateProduct(
  productId: string,
  reviewerId: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
  notes?: string
) {
  // Mettre à jour la modération
  await prisma.productModeration.upsert({
    where: { productId },
    create: {
      productId,
      status: status === "approved" ? "approved" : "rejected",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: status === "rejected" ? rejectionReason : null,
      notes,
    },
    update: {
      status: status === "approved" ? "approved" : "rejected",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: status === "rejected" ? rejectionReason : null,
      notes,
    },
  });

  // Mettre à jour le statut du produit
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: status === "approved" ? "active" : "rejected",
    },
  });

  return { success: true };
}

export async function getPendingModerations() {
  return await prisma.productModeration.findMany({
    where: {
      status: "pending_review",
    },
    include: {
      product: {
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
          images: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}


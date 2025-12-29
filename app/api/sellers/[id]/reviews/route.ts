import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sellers/{id}/reviews - Récupérer les avis d'un vendeur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Récupérer les avis des produits du vendeur
    const reviews = await prisma.review.findMany({
      where: {
        product: {
          vendorId: id,
        },
        status: "approved", // Seulement les avis approuvés
      },
      include: {
        product: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
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
              select: {
                businessName: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.review.count({
      where: {
        product: {
          vendorId: id,
        },
        status: "approved",
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] Error fetching seller reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller reviews" },
      { status: 500 }
    );
  }
}


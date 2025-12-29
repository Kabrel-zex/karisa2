/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createReview } from "@/lib/reviews";
import { prisma } from "@/lib/prisma";

// POST /api/orders/{id}/review - Créer un avis depuis une commande
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { orderItemId, rating, title, comment, images } = body;

    if (!orderItemId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Order item ID and valid rating (1-5) are required" },
        { status: 400 }
      );
    }

    // Vérifier que la commande appartient à l'utilisateur et est livrée
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: {
          id,
          userId: session.id,
          status: "delivered",
        },
      },
      include: {
        product: true,
      },
    });

    if (!orderItem || !orderItem.productId) {
      return NextResponse.json(
        { error: "Order item not found or not eligible for review" },
        { status: 404 }
      );
    }

    // Créer l'avis
    const review = await createReview({
      productId: orderItem.productId,
      userId: session.id,
      orderItemId,
      rating,
      title,
      comment,
      images,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("[API] Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}


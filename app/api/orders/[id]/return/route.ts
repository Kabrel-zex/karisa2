import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/orders/{id}/return - Initier un retour
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
    const { orderItemId, reason, images } = body;

    if (!orderItemId || !reason) {
      return NextResponse.json(
        { error: "Order item ID and reason are required" },
        { status: 400 }
      );
    }

    // Vérifier que la commande appartient à l'utilisateur
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.id,
        status: "delivered",
      },
      include: {
        items: {
          where: { id: orderItemId },
        },
      },
    });

    if (!order || order.items.length === 0) {
      return NextResponse.json(
        { error: "Order item not found or not eligible for return" },
        { status: 404 }
      );
    }

    // Créer la demande de retour
    const returnRequest = await prisma.return.create({
      data: {
        orderItemId,
        reason,
        status: "requested",
        images: images ? JSON.stringify(images) : undefined,
      },
    });

    return NextResponse.json({ return: returnRequest }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating return:", error);
    return NextResponse.json(
      { error: "Failed to create return" },
      { status: 500 }
    );
  }
}


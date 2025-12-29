import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/shipping/returns/initiate - Initier un retour
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderItemId, reason, images } = body;

    if (!orderItemId || !reason) {
      return NextResponse.json(
        { error: "Order item ID and reason are required" },
        { status: 400 }
      );
    }

    // Vérifier que l'item appartient à l'utilisateur
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: {
          userId: session.id,
          status: "delivered",
        },
      },
    });

    if (!orderItem) {
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
        images: images ? JSON.stringify(images) : null,
      },
    });

    return NextResponse.json({ return: returnRequest }, { status: 201 });
  } catch (error) {
    console.error("[API] Error initiating return:", error);
    return NextResponse.json(
      { error: "Failed to initiate return" },
      { status: 500 }
    );
  }
}


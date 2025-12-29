import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/shipping/returns/{id}/confirm - Confirmer la réception d'un retour
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { condition, approve, refundAmount } = body;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            order: true,
            vendor: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    // Vérifier que le retour appartient au vendeur
    if (returnRequest.orderItem.vendor?.userId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (approve) {
      await prisma.return.update({
        where: { id },
        data: {
          status: "received",
          receivedAt: new Date(),
          refundAmount: refundAmount || null,
        },
      });

      // Initier le remboursement si nécessaire
      if (refundAmount) {
        // TODO: Créer le remboursement
      }
    } else {
      await prisma.return.update({
        where: { id },
        data: {
          status: "rejected",
        },
      });
    }

    return NextResponse.json({ message: "Return confirmed" });
  } catch (error) {
    console.error("[API] Error confirming return:", error);
    return NextResponse.json(
      { error: "Failed to confirm return" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/inventory/{productId}/log - Enregistrer un log de changement de stock
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const body = await request.json();
    const { quantityChange, reason, notes, orderId } = body;

    if (!quantityChange || !reason) {
      return NextResponse.json(
        { error: "Quantity change and reason are required" },
        { status: 400 }
      );
    }

    // Dans un vrai système, créer une table inventory_logs
    // Pour l'instant, on peut juste logger l'événement
    console.log("Inventory log:", {
      productId,
      quantityChange,
      reason,
      notes,
      orderId,
      createdBy: session.id,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Inventory log created" }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating inventory log:", error);
    return NextResponse.json(
      { error: "Failed to create inventory log" },
      { status: 500 }
    );
  }
}


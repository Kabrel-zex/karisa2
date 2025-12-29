import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { inventoryService } from "@/services/inventory/inventory.service";

// PUT /api/inventory/{productId} - Mettre à jour le stock d'un produit
export async function PUT(
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
    const { quantity, variantId } = body;

    if (quantity === undefined) {
      return NextResponse.json(
        { error: "Quantity is required" },
        { status: 400 }
      );
    }

    await inventoryService.updateStock(productId, variantId, quantity);

    return NextResponse.json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("[API] Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}


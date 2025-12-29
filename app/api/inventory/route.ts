import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { inventoryService } from "@/services/inventory/inventory.service";
import { prisma } from "@/lib/prisma";

// GET /api/inventory - Liste des produits avec leur stock
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lowStockOnly = searchParams.get("lowStock") === "true";

    if (lowStockOnly) {
      const products = await inventoryService.getLowStockProducts();
      return NextResponse.json({ products });
    }

    // Récupérer les produits du vendeur avec leur stock
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        status: true,
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
          },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[API] Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}


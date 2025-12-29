import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { productService } from "@/services/product/product.service";

// POST /api/products/{id}/bulk-upload - Upload en masse de produits
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { products } = body; // Array of product data

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Products array is required" },
        { status: 400 }
      );
    }

    // Récupérer le vendor ID
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.id },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 404 }
      );
    }

    // Créer les produits en batch
    const createdProducts = await Promise.all(
      products.map((productData: any) =>
        productService.createProduct({
          vendorId: vendor.id,
          ...productData,
          status: "pending_review",
        })
      )
    );

    return NextResponse.json(
      { products: createdProducts, count: createdProducts.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error bulk uploading products:", error);
    return NextResponse.json(
      { error: "Failed to bulk upload products" },
      { status: 500 }
    );
  }
}


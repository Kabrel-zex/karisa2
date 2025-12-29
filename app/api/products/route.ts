/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { productService } from "@/services/product/product.service";

// GET /api/products - Liste des produits avec recherche et filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      categoryId: searchParams.get("categoryId") || undefined,
      vendorId: searchParams.get("vendorId") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      status: searchParams.get("status") as any,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    };

    const result = await productService.searchProducts(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      sku,
      nameFr,
      nameEn,
      descriptionFr,
      descriptionEn,
      price,
      compareAtPrice,
      stockQuantity,
    } = body;

    if (!nameFr || !nameEn || !price || stockQuantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const product = await productService.createProduct({
      vendorId: vendor.id,
      categoryId,
      sku,
      nameFr,
      nameEn,
      descriptionFr,
      descriptionEn,
      price,
      compareAtPrice,
      stockQuantity,
      status: "pending_review",
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

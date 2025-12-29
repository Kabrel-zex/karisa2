import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/elasticsearch";

// GET /api/search - Recherche full-text avec Elasticsearch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const vendorId = searchParams.get("vendorId") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const result = await searchProducts(query, {
      categoryId,
      vendorId,
      minPrice,
      maxPrice,
      limit,
      offset,
    });

    return NextResponse.json({
      products: result.products,
      total: result.total,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("[API] Error searching products:", error);
    // Fallback sur la recherche PostgreSQL si Elasticsearch n'est pas disponible
    return NextResponse.json(
      { error: "Search service unavailable" },
      { status: 503 }
    );
  }
}


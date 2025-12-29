import { NextRequest, NextResponse } from "next/server";
import { getProductReviews } from "@/lib/reviews";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getProductReviews(productId, limit, offset);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}


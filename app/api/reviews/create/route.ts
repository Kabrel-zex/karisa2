import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createReview } from "@/lib/reviews";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderItemId, rating, title, comment, images } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Product ID and valid rating (1-5) are required" },
        { status: 400 }
      );
    }

    const review = await createReview({
      productId,
      userId: session.id,
      orderItemId,
      rating,
      title,
      comment,
      images,
    });

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("[API] Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}


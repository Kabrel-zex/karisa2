import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { moderateProduct } from "@/lib/moderation";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, status, rejectionReason, notes } = body;

    if (!productId || !status) {
      return NextResponse.json(
        { error: "Product ID and status are required" },
        { status: 400 }
      );
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    await moderateProduct(productId, session.id, status, rejectionReason, notes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error moderating product:", error);
    return NextResponse.json(
      { error: "Failed to moderate product" },
      { status: 500 }
    );
  }
}


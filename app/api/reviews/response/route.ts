import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addSellerResponse } from "@/lib/reviews";
import { getVendorByUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, content } = body;

    if (!reviewId || !content) {
      return NextResponse.json(
        { error: "Review ID and content are required" },
        { status: 400 }
      );
    }

    const vendor = await getVendorByUserId(session.id);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const response = await addSellerResponse(reviewId, vendor.id, content);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[API] Error adding seller response:", error);
    return NextResponse.json(
      { error: "Failed to add response" },
      { status: 500 }
    );
  }
}


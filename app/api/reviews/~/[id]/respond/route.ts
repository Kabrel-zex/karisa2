import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addSellerResponse } from "@/lib/reviews";
import { getVendorByUserId } from "@/lib/auth";

// POST /api/reviews/{id}/respond - Répondre à un avis (alias de /api/reviews/response)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const vendor = await getVendorByUserId(session.id);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const response = await addSellerResponse(id, vendor.id, content);

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error("[API] Error adding seller response:", error);
    return NextResponse.json(
      { error: "Failed to add response" },
      { status: 500 }
    );
  }
}


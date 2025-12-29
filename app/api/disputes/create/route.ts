import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createDispute } from "@/lib/disputes";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, type, description, evidence } = body;

    if (!orderId || !type || !description) {
      return NextResponse.json(
        { error: "Order ID, type, and description are required" },
        { status: 400 }
      );
    }

    const dispute = await createDispute({
      orderId,
      userId: session.id,
      type,
      description,
      evidence,
    });

    return NextResponse.json({ dispute });
  } catch (error) {
    console.error("[API] Error creating dispute:", error);
    return NextResponse.json(
      { error: "Failed to create dispute" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPendingModerations } from "@/lib/moderation";

// GET /api/admin/products/pending - Liste des produits en attente de modération
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moderations = await getPendingModerations();

    return NextResponse.json({ moderations });
  } catch (error) {
    console.error("[API] Error fetching pending moderations:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending moderations" },
      { status: 500 }
    );
  }
}


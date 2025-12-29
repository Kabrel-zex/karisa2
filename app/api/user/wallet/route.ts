import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dans un vrai système, il y aurait une table wallet
    // Pour l'instant, retourner un wallet par défaut
    const wallet = {
      userId: session.id,
      balance: 0,
      currency: "EUR",
    };

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("[API] Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}


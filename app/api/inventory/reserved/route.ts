import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// GET /api/inventory/reserved - Liste des stocks réservés
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dans un vrai système, récupérer depuis la table reservations
    // Pour l'instant, retourner un tableau vide
    const reservations: any[] = [];

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("[API] Error fetching reserved inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch reserved inventory" },
      { status: 500 }
    );
  }
}


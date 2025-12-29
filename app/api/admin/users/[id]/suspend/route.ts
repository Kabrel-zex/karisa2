import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/admin/users/{id}/suspend - Suspendre un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason, duration } = body;

    // Dans un vrai système, créer une table suspensions
    // Pour l'instant, on peut juste logger
    console.log("User suspended:", {
      userId: id,
      suspendedBy: session.id,
      reason,
      duration,
      suspendedAt: new Date(),
    });

    // Si c'est un vendeur, désactiver sa boutique
    const vendor = await prisma.vendor.findUnique({
      where: { userId: id },
    });

    if (vendor) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ message: "User suspended successfully" });
  } catch (error) {
    console.error("[API] Error suspending user:", error);
    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    );
  }
}


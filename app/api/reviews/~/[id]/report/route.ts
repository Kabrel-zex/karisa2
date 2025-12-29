import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/reviews/{id}/report - Signaler un avis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason, description } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    // Vérifier que l'avis existe
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Dans un vrai système, créer une table review_reports
    // Pour l'instant, on peut juste logger
    console.log("Review reported:", {
      reviewId: id,
      reportedBy: session.id,
      reason,
      description,
      createdAt: new Date(),
    });

    // Publier événement pour modération
    // await eventBus.publish("review.reported", { reviewId: id, reason });

    return NextResponse.json({ message: "Review reported successfully" });
  } catch (error) {
    console.error("[API] Error reporting review:", error);
    return NextResponse.json(
      { error: "Failed to report review" },
      { status: 500 }
    );
  }
}


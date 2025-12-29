import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { markReviewHelpful } from "@/lib/reviews";

// POST /api/reviews/{id}/helpful - Marquer un avis comme utile/inutile
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
    const { isHelpful } = body;

    if (typeof isHelpful !== "boolean") {
      return NextResponse.json(
        { error: "isHelpful must be a boolean" },
        { status: 400 }
      );
    }

    const reviewHelpful = await markReviewHelpful(id, session.id, isHelpful);

    // Mettre à jour le compteur helpfulCount sur la review
    await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: isHelpful ? 1 : -1,
        },
      },
    });

    return NextResponse.json({ reviewHelpful });
  } catch (error) {
    console.error("[API] Error marking review helpful:", error);
    return NextResponse.json(
      { error: "Failed to mark review helpful" },
      { status: 500 }
    );
  }
}


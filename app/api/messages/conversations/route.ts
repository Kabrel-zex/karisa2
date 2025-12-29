import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getConversations } from "@/lib/messaging";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getConversations(session.id);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[API] Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}


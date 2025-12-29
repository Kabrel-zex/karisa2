import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getMessages, sendMessage } from "@/lib/messaging";

// GET /api/messages/{conversationId} - Récupérer les messages d'une conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const messages = await getMessages(conversationId, session.id);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("[API] Error fetching messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/messages/{conversationId} - Envoyer un message dans une conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const message = await sendMessage(conversationId, session.id, content);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error("[API] Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}


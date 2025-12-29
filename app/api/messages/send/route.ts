import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createConversation, sendMessage } from "@/lib/messaging";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, subject, content, orderId, productId } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    // Créer ou récupérer la conversation
    const conversation = await createConversation(
      session.id,
      receiverId,
      subject,
      orderId,
      productId
    );

    // Envoyer le message
    const message = await sendMessage(conversation.id, session.id, content);

    return NextResponse.json({ conversation, message });
  } catch (error) {
    console.error("[API] Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}


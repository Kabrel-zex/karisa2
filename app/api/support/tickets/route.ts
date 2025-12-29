import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createSupportTicket, getTickets } from "@/lib/support";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;

    const tickets = await getTickets(
      session.role === "admin" ? undefined : session.id,
      status
    );

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[API] Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, subject, description, priority } = body;

    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: "Category, subject, and description are required" },
        { status: 400 }
      );
    }

    const ticket = await createSupportTicket({
      userId: session.id,
      category,
      subject,
      description,
      priority,
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[API] Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}


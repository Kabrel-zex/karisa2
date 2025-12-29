import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { enable2FA } from "@/lib/two-factor";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const success = await enable2FA(session.id, token);

    if (!success) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error enabling 2FA:", error);
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 });
  }
}


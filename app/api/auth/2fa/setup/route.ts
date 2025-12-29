import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generate2FASecret } from "@/lib/two-factor";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { method } = body;

    if (!method || (method !== "totp" && method !== "sms")) {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    const { secret, qrCodeUrl, otpAuthUrl } = await generate2FASecret(session.id, method);

    return NextResponse.json({
      secret,
      qrCodeUrl,
      otpAuthUrl,
    });
  } catch (error) {
    console.error("[API] Error setting up 2FA:", error);
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
}


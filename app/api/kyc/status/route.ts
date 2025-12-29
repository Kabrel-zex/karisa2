import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserKycStatus } from "@/lib/kyc";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getUserKycStatus(session.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error("[API] Error fetching KYC status:", error);
    return NextResponse.json({ error: "Failed to fetch KYC status" }, { status: 500 });
  }
}


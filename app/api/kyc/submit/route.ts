import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { submitKycDocument } from "@/lib/kyc";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentType, documentUrl } = body;

    if (!documentType || !documentUrl) {
      return NextResponse.json(
        { error: "Document type and URL are required" },
        { status: 400 }
      );
    }

    const document = await submitKycDocument({
      userId: session.id,
      documentType,
      documentUrl,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("[API] Error submitting KYC document:", error);
    return NextResponse.json({ error: "Failed to submit document" }, { status: 500 });
  }
}


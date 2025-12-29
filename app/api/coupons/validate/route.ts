import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/coupons/validate - Valider un coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { error: "Code and amount are required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
    }

    // Vérifier la validité
    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json({ error: "Coupon not yet valid" }, { status: 400 });
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    // Vérifier le montant minimum
    if (coupon.minPurchase && amount < Number(coupon.minPurchase)) {
      return NextResponse.json(
        { error: `Minimum purchase amount is ${coupon.minPurchase}` },
        { status: 400 }
      );
    }

    // Calculer la réduction
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (amount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return NextResponse.json({
      valid: true,
      discount,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error("[API] Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}


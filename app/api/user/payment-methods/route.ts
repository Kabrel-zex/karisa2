import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// GET /api/user/payment-methods - Liste des méthodes de paiement sauvegardées
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dans un vrai système, récupérer depuis une table payment_methods
    // Pour l'instant, retourner un tableau vide
    const paymentMethods: any[] = [];

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("[API] Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

// POST /api/user/payment-methods - Ajouter une méthode de paiement
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, token, isDefault } = body; // token = Stripe payment method token

    if (!type || !token) {
      return NextResponse.json(
        { error: "Type and token are required" },
        { status: 400 }
      );
    }

    // Dans un vrai système, créer un PaymentMethod dans la DB
    // Stocker uniquement le token Stripe, jamais les données de carte

    return NextResponse.json({
      message: "Payment method added successfully",
      // paymentMethod: { id, type, last4, brand }
    }, { status: 201 });
  } catch (error) {
    console.error("[API] Error adding payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}


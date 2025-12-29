import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession, setSession } from "@/lib/session"

// POST /api/vendors/register - Créer un compte vendeur
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      businessName,
      businessType,
      taxId,
      businessDescription,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
    } = body

    if (!businessName || !addressLine1 || !city || !postalCode || !country) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Vérifier si l'utilisateur a déjà un compte vendeur
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: session.id },
    })

    if (existingVendor) {
      return NextResponse.json({ error: "Vendor account already exists" }, { status: 409 })
    }

    // Créer le profil vendeur
    const vendor = await prisma.vendor.create({
      data: {
        userId: session.id,
        businessName,
        businessType: businessType || null,
        taxId: taxId || null,
        businessDescription: businessDescription || null,
        addresses: {
          create: {
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state: state || null,
            postalCode,
            country,
            phone: phone || null,
            isPrimary: true,
          },
        },
      },
    })

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: session.id },
      data: { role: "seller" },
    })

    // Mettre à jour la session
    await setSession({
      ...session,
      role: "seller",
    })

    return NextResponse.json({ vendor }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating vendor account:", error)
    return NextResponse.json({ error: "Failed to create vendor account" }, { status: 500 })
  }
}


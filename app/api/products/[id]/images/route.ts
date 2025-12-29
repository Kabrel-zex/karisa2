import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/products/{id}/images - Ajouter des images à un produit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { images } = body; // Array of { imageUrl, altText, isPrimary, displayOrder }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }

    // Vérifier que le produit appartient au vendeur
    const product = await prisma.product.findFirst({
      where: {
        id,
        vendor: { userId: session.id },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Créer les images
    const createdImages = await Promise.all(
      images.map((img: any) =>
        prisma.productImage.create({
          data: {
            productId: id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            isPrimary: img.isPrimary || false,
            displayOrder: img.displayOrder || 0,
          },
        })
      )
    );

    return NextResponse.json({ images: createdImages }, { status: 201 });
  } catch (error) {
    console.error("[API] Error adding product images:", error);
    return NextResponse.json(
      { error: "Failed to add product images" },
      { status: 500 }
    );
  }
}


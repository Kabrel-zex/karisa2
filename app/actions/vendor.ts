/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import {prisma} from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { getVendorByUserId } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "seller") {
    return { error: "Unauthorized" }
  }

  const vendor = await getVendorByUserId(session.id)
  if (!vendor) {
    return { error: "Vendor profile not found" }
  }

  try {
    const nameFr = formData.get("name_fr") as string
    const nameEn = formData.get("name_en") as string
    const descriptionFr = formData.get("description_fr") as string
    const descriptionEn = formData.get("description_en") as string
    const price = formData.get("price") as string
    const stockQuantity = formData.get("stock_quantity") as string
    const categoryId = formData.get("category_id") as string
    const sku = `SKU-${Date.now()}`

    await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId,
        sku,
        nameFr,
        nameEn,
        descriptionFr,
        descriptionEn,
        shortDescriptionFr: nameFr,
        shortDescriptionEn: nameEn,
        price: Number.parseFloat(price),
        stockQuantity: Number.parseInt(stockQuantity),
        status: "active",
      },
    })

    revalidatePath("/vendor/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    return { error: "Failed to create product" }
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== "seller") {
    return { error: "Unauthorized" }
  }

  const vendor = await getVendorByUserId(session.id)
  if (!vendor) {
    return { error: "Vendor profile not found" }
  }

  try {
    const nameFr = formData.get("name_fr") as string
    const nameEn = formData.get("name_en") as string
    const descriptionFr = formData.get("description_fr") as string
    const descriptionEn = formData.get("description_en") as string
    const price = formData.get("price") as string
    const stockQuantity = formData.get("stock_quantity") as string
    const status = formData.get("status") as any

    await prisma.product.update({
      where: { id: productId, vendorId: vendor.id },
      data: {
        nameFr,
        nameEn,
        descriptionFr,
        descriptionEn,
        price: Number.parseFloat(price),
        stockQuantity: Number.parseInt(stockQuantity),
        status,
      },
    })

    revalidatePath("/vendor/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    return { error: "Failed to update product" }
  }
}

export async function deleteProduct(productId: string) {
  const session = await getSession()
  if (!session || session.role !== "seller") {
    return { error: "Unauthorized" }
  }

  const vendor = await getVendorByUserId(session.id)
  if (!vendor) {
    return { error: "Vendor profile not found" }
  }

  try {
    await prisma.product.delete({
      where: { id: productId, vendorId: vendor.id },
    })

    revalidatePath("/vendor/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    return { error: "Failed to delete product" }
  }
}

export async function createVendorAccount(formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    const userId = formData.get("userId") as string
    const businessName = formData.get("businessName") as string
    const businessType = formData.get("businessType") as string
    const taxId = formData.get("taxId") as string
    const businessDescription = formData.get("businessDescription") as string
    const addressLine1 = formData.get("addressLine1") as string
    const city = formData.get("city") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const phone = formData.get("phone") as string
/*
    // Create vendor profile
    const vendor = await prisma.vendor.create({
      data: {
        userId,
        businessName,
        businessType: businessType || null,
        taxId: taxId || null,
        businessDescription: businessDescription || null,
      },
    })

    // Create vendor address
    await prisma.vendorAddress.create({
      data: {
        vendorId: vendor.id,
        addressLine1,
        city,
        postalCode,
        country,
        phone: phone || null,
        isPrimary: true,
      },
    })
*/
    // Update user role to seller
    await prisma.user.update({
      where: { id: userId },
      data: { role: "seller" },
    })

    revalidatePath("/vendor/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error creating vendor account:", error)
    return { error: "Failed to create vendor account" }
  }
}

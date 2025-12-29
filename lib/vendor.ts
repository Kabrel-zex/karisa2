import { prisma } from "./prisma"
import { randomBytes } from "crypto"

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export async function generateUniqueVendorSlug(baseName: string) {
  const base = slugify(baseName) || `vendor-${randomBytes(3).toString("hex")}`
  let slug = base
  let attempt = 0
  while (true) {
    const exists = await prisma.vendor.findUnique({ where: { slug } })
    const appExists = await prisma.vendorApplication.findUnique({ where: { slug } })
    if (!exists && !appExists) return slug
    attempt += 1
    slug = `${base}-${attempt}`
  }
}



export async function getVendorProducts(vendorId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { vendorId },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: {
            nameFr: true,
            nameEn: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return products
  } catch (error) {
    console.error("[v0] Error fetching vendor products:", error)
    return []
  }
}

export async function getVendorOrders(vendorId: string, limit = 10) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { vendorId },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Group by order and deduplicate
    const ordersMap = new Map()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderItems.forEach((item:any) => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          paymentStatus: item.order.paymentStatus,
          total: item.order.total,
          createdAt: item.order.createdAt,
          customerName: item.order.user?.name || "Guest",
          customerEmail: item.order.customerEmail,
        })
      }
    })

    return Array.from(ordersMap.values())
  } catch (error) {
    console.error("[v0] Error fetching vendor orders:", error)
    return []
  }
}

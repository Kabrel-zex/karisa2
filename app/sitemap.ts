import { prisma } from "@/lib/prisma"
import { getBaseUrl } from "@/lib/config"

export default async function sitemap() {
  const BASE_URL = getBaseUrl()
  const staticRoutes = ["", "/auth/login", "/auth/signup", "/vendors", "/products"].map((path) => ({
    url: `${BASE_URL}${path || "/"}`,
    lastModified: new Date(),
  }))

  try {
    const [vendors, products] = await Promise.all([
      prisma.vendor.findMany({
        select: { slug: true, updatedAt: true },
        take: 200,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.findMany({
        where: { status: "published" as any },
        select: { id: true, updatedAt: true },
        take: 500,
        orderBy: { updatedAt: "desc" },
      }),
    ])

    const vendorRoutes = vendors.map((v) => ({
      url: `${BASE_URL}/vendors/${v.slug}`,
      lastModified: v.updatedAt ?? new Date(),
    }))

    const productRoutes = products.map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: p.updatedAt ?? new Date(),
    }))

    return [...staticRoutes, ...vendorRoutes, ...productRoutes]
  } catch (error) {
    console.error("[sitemap] failed to load dynamic entries", error)
    return staticRoutes
  }
}

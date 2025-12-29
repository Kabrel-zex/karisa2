import { MetadataRoute } from "next"
import { getBaseUrl } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = getBaseUrl()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}

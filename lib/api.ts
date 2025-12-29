/* eslint-disable @typescript-eslint/no-explicit-any */
// Utilitaire pour appeler les API depuis les composants client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "Une erreur est survenue" }
    }

    return { data }
  } catch (error) {
    console.error(`[API] Error calling ${endpoint}:`, error)
    return { error: "Erreur de connexion" }
  }
}

// API Produits
export const productsAPI = {
  getAll: (params?: {
    category?: string
    vendor?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    limit?: number
    offset?: number
    featured?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append("category", params.category)
    if (params?.vendor) searchParams.append("vendor", params.vendor)
    if (params?.search) searchParams.append("search", params.search)
    if (params?.minPrice) searchParams.append("minPrice", params.minPrice.toString())
    if (params?.maxPrice) searchParams.append("maxPrice", params.maxPrice.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.offset) searchParams.append("offset", params.offset.toString())
    if (params?.featured) searchParams.append("featured", "true")

    return fetchAPI<{ products: any[]; count: number }>(`/products?${searchParams.toString()}`)
  },
  getStats:(params:{
    vendorId:string
  })=>{
    const searchParams = new URLSearchParams()
    searchParams.append("id",params.vendorId)
    return fetchAPI<{ stats: any }>(`/products/stats?${searchParams.toString()}`)

  },

  getById: (id: string) => fetchAPI<{ product: any }>(`/products/${id}`),

  create: (data: any) =>
    fetchAPI<{ product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchAPI<{ product: any }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/products/${id}`, {
      method: "DELETE",
    }),
}

// API Catégories
export const categoriesAPI = {
  getAll: (params?: { parentId?: string | null; includeChildren?: boolean; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.parentId !== undefined) searchParams.append("parentId", params.parentId || "null")
    if (params?.includeChildren) searchParams.append("includeChildren", "true")
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    return fetchAPI<{ categories: any[]; count: number }>(`/categories?${searchParams.toString()}`)
  },

  getBySlug: (slug: string) => fetchAPI<{ category: any }>(`/categories/${slug}`),
}

// API Panier
export const cartAPI = {
  get: () => fetchAPI<{ items: any[]; subtotal: number; itemCount: number }>("/cart"),

  add: (productId: string, quantity = 1, variantId?: string) =>
    fetchAPI<{ cartItem: any }>("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, variantId }),
    }),

  update: (id: string, quantity: number) =>
    fetchAPI<{ cartItem: any }>(`/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  remove: (id: string) =>
    fetchAPI<{ success: boolean }>(`/cart/${id}`, {
      method: "DELETE",
    }),

  clear: () =>
    fetchAPI<{ success: boolean }>("/cart", {
      method: "DELETE",
    }),
}

// API Commandes
export const ordersAPI = {
  getAll: (params?: { status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append("status", params.status)
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    return fetchAPI<{ orders: any[]; count: number }>(`/orders?${searchParams.toString()}`)
  },
  getVendorOrders:(params:{vendorId:string})=>{
    const searchParams = new URLSearchParams()
    searchParams.append("id",params.vendorId)
    return fetchAPI<{ orders: any[]; count: number }>(`/orders/vendor?${searchParams.toString()}`)

  },

  getById: (id: string) => fetchAPI<{ order: any }>(`/orders/${id}`),

  create: (data: any) =>
    fetchAPI<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchAPI<{ order: any }>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// API Authentification
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: { email: string; name: string; password: string; role?: string; language?: string }) =>
    fetchAPI<{ user: any }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchAPI<{ success: boolean }>("/auth/logout", {
      method: "POST",
    }),

  me: () => fetchAPI<{ user: any }>("/auth/me"),
}

// API Vendeurs
export const vendorsAPI = {
  getAll: (params?: { limit?: number; verified?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.verified) searchParams.append("verified", "true")

    return fetchAPI<{ vendors: any[]; count: number }>(`/vendors?${searchParams.toString()}`)
  },

  getById: (id: string) => fetchAPI<{ vendor: any }>(`/vendors/${id}`),

  register: (data: any) =>
    fetchAPI<{ vendor: any }>("/vendors/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// API Avis
export const reviewsAPI = {
  getAll: (params?: { productId?: string; userId?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.productId) searchParams.append("productId", params.productId)
    if (params?.userId) searchParams.append("userId", params.userId)
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    return fetchAPI<{ reviews: any[]; count: number }>(`/reviews?${searchParams.toString()}`)
  },

  getById: (id: string) => fetchAPI<{ review: any }>(`/reviews/${id}`),

  create: (data: any) =>
    fetchAPI<{ review: any }>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchAPI<{ review: any }>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/reviews/${id}`, {
      method: "DELETE",
    }),
}

// API Wishlist
export const wishlistAPI = {
  get: () => fetchAPI<{ items: any[]; count: number }>("/wishlist"),

  add: (productId: string) =>
    fetchAPI<{ item: any }>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  remove: (productId: string) =>
    fetchAPI<{ success: boolean }>(`/wishlist?productId=${productId}`, {
      method: "DELETE",
    }),
}

// API Notifications
export const notificationsAPI = {
  getAll: (params?: { unreadOnly?: boolean; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.unreadOnly) searchParams.append("unreadOnly", "true")
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    return fetchAPI<{ notifications: any[]; count: number; unreadCount: number }>(
      `/notifications?${searchParams.toString()}`
    )
  },

  getById: (id: string) => fetchAPI<{ notification: any }>(`/notifications/${id}`),

  markAsRead: (notificationIds?: string[], markAllAsRead?: boolean) =>
    fetchAPI<{ success: boolean }>("/notifications", {
      method: "PUT",
      body: JSON.stringify({ notificationIds, markAllAsRead }),
    }),

  update: (id: string, data: any) =>
    fetchAPI<{ notification: any }>(`/notifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/notifications/${id}`, {
      method: "DELETE",
    }),
}



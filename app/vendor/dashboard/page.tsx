/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "@/lib/session"
import { getVendorByUserId } from "@/lib/auth"
//import { getVendorStats, getVendorProducts, getVendorOrders } from "@/lib/vendor"
//import { getTopCategories } from "@/lib/products"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StatsCard } from "@/components/vendor/stats-card"
import { ProductForm } from "@/components/vendor/product-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, DollarSign, Star, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { categoriesAPI, ordersAPI, productsAPI, vendorsAPI } from "@/lib/api"

export default async function VendorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== "seller") {
    redirect("/login")
  }

  const vendorsResponse = await vendorsAPI.getById(session.id)
  if (vendorsResponse.error) {
    return <div>Error: {vendorsResponse.error}</div>
  }
  const vendor = vendorsResponse.data?.vendor
  
  
  if (!vendor) {
    redirect("/become-vendor")
  }

  const params = await searchParams
  const locale = (params.lang as "fr" | "en") || "fr"

  

  const [statsResponse, productsResponse, ordersResponse, categoriesResponse] = await Promise.all([
    productsAPI.getStats({vendorId:vendor.id}),
    productsAPI.getAll({vendor:vendor.id}),
    
    ordersAPI.getVendorOrders({vendorId:vendor.id}),
    
    categoriesAPI.getAll(),
  ])

  if (statsResponse.error) {
    return <div>Error: {statsResponse.error}</div>
  }
  const stats = statsResponse.data?.stats
  

  if (ordersResponse.error) {
    return <div>Error: {ordersResponse.error}</div>
  }
  const orders = ordersResponse.data?.orders ||[]
  if (productsResponse.error) {
    return <div>Error: {productsResponse.error}</div>
  }
  const products = productsResponse.data?.products ||[]
  
  if (categoriesResponse.error) {
    return <div>Error: {categoriesResponse.error}</div>
  }
  const categories = categoriesResponse.data?.categories ||[]
  

  

  const translations = {
    fr: {
      dashboard: "Tableau de bord vendeur",
      welcome: "Bienvenue",
      stats: "Statistiques",
      totalOrders: "Commandes totales",
      revenue: "Revenus",
      rating: "Note moyenne",
      products: "Produits",
      recentOrders: "Commandes récentes",
      myProducts: "Mes produits",
      addProduct: "Ajouter un produit",
      orderNumber: "N° Commande",
      customer: "Client",
      status: "Statut",
      total: "Total",
      date: "Date",
      name: "Nom",
      price: "Prix",
      stock: "Stock",
      noProducts: "Aucun produit",
      noOrders: "Aucune commande",
    },
    en: {
      dashboard: "Vendor dashboard",
      welcome: "Welcome",
      stats: "Statistics",
      totalOrders: "Total orders",
      revenue: "Revenue",
      rating: "Average rating",
      products: "Products",
      recentOrders: "Recent orders",
      myProducts: "My products",
      addProduct: "Add product",
      orderNumber: "Order #",
      customer: "Customer",
      status: "Status",
      total: "Total",
      date: "Date",
      name: "Name",
      price: "Price",
      stock: "Stock",
      noProducts: "No products",
      noOrders: "No orders",
    },
  }

  const t = translations[locale]

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-blue-500/10 text-blue-500",
    processing: "bg-purple-500/10 text-purple-500",
    shipped: "bg-cyan-500/10 text-cyan-500",
    delivered: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {t.welcome}, {vendor.businessName}
            </h1>
            <p className="text-muted-foreground">{t.dashboard}</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title={t.totalOrders}
              value={stats.totalOrders}
              icon={ShoppingBag}
              description={locale === "fr" ? "Commandes reçues" : "Orders received"}
            />
            <StatsCard
              title={t.revenue}
              value={`${stats.totalRevenue.toFixed(2)}€`}
              icon={DollarSign}
              description={locale === "fr" ? "Revenus totaux" : "Total revenue"}
            />
            <StatsCard
              title={t.rating}
              value={stats.avgRating.toFixed(1)}
              icon={Star}
              description={locale === "fr" ? "Note des clients" : "Customer rating"}
            />
            <StatsCard
              title={t.products}
              value={stats.totalProducts}
              icon={Package}
              description={locale === "fr" ? "Produits actifs" : "Active products"}
            />
          </div>

          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t.addProduct}</CardTitle>
              <CardDescription>
                {locale === "fr" ? "Ajoutez un nouveau produit à votre catalogue" : "Add a new product to your catalog"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm categories={categories} locale={locale} />
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.myProducts}</CardTitle>
              <CardDescription>{locale === "fr" ? "Gérez vos produits" : "Manage your products"}</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.noProducts}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{locale === "fr" ? "Image" : "Image"}</TableHead>
                        <TableHead>{t.name}</TableHead>
                        <TableHead>{t.price}</TableHead>
                        <TableHead>{t.stock}</TableHead>
                        <TableHead>{t.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: any) => {
                        const productImage = product.images[0]?.imageUrl
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="h-12 w-12 relative rounded overflow-hidden bg-muted">
                                <Image
                                  src={productImage || "/placeholder.svg"}
                                  alt={locale === "fr" ? product.nameFr : product.nameEn}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {locale === "fr" ? product.nameFr : product.nameEn}
                            </TableCell>
                            <TableCell>{Number(product.price).toFixed(2)}€</TableCell>
                            <TableCell>{product.stockQuantity}</TableCell>
                            <TableCell>
                              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                {product.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentOrders}</CardTitle>
              <CardDescription>{locale === "fr" ? "Vos dernières commandes" : "Your recent orders"}</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.noOrders}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.orderNumber}</TableHead>
                        <TableHead>{t.customer}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.total}</TableHead>
                        <TableHead>{t.date}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status as keyof typeof statusColors] || ""}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{Number(order.total).toFixed(2)}€</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString(locale)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

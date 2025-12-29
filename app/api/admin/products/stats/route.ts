import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";


export async function GET(
    req:Request
) {
    
    try {
        const { searchParams } = new URL(req.url);
       
       const id= searchParams.get("id") || undefined
    
        const [orderStats, products] = await Promise.all([
          prisma.orderItem.aggregate({
            where: { id },
            _count: { orderId: true },
            _sum: { subtotal: true },
          }),
          prisma.product.aggregate({
            where: { id },
            _count: { id: true },
            _avg: { rating: true },
          }),
        ])
    
        const stats= {
          totalOrders: orderStats._count.orderId || 0,
          totalRevenue: Number(orderStats._sum.subtotal || 0),
          avgRating: Number(products._avg.rating || 0),
          totalProducts: products._count.id || 0,
        }
        return NextResponse.json(stats)
      } catch (error) {
        console.error("[API] Error fetching vendor stats:", error)
        const stats= { totalOrders: 0, totalRevenue: 0, avgRating: 0, totalProducts: 0 }
        return NextResponse.json(stats)
      }
}
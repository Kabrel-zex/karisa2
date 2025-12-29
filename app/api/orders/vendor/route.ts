import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req:Request) {
    try {
        const { searchParams } = new URL(req.url);
       const limit= searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20
       const id= searchParams.get("vendorId") || undefined
    
        const orderItems = await prisma.orderItem.findMany({
          where: { id },
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
    
        return NextResponse.json( Array.from(ordersMap.values()))
      } catch (error) {
        console.error("[API] Error fetching vendor orders:", error)
        return NextResponse.json([])
      }
}
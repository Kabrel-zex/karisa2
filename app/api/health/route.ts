import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

export async function GET() {
  const health: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Vérifier la base de données
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = "healthy";
  } catch (error) {
    health.checks.database = "unhealthy";
    health.status = "unhealthy";
  }

  // Vérifier Redis
  try {
    const redis = await getRedisClient();
    await redis.ping();
    health.checks.redis = "healthy";
  } catch (error) {
    health.checks.redis = "unhealthy";
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}


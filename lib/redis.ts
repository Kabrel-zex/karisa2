/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    await redisClient.connect();
  }

  return redisClient;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.error("Redis cache get error:", error);
    return null;
  }
}

export async function cacheSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  try {
    const client = await getRedisClient();
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    console.error("Redis cache set error:", error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error("Redis cache delete error:", error);
  }
}

// Session helpers
export async function setSession(sessionId: string, data: any, ttlSeconds = 7 * 24 * 60 * 60): Promise<void> {
  await cacheSet(`session:${sessionId}`, data, ttlSeconds);
}

export async function getSession<T>(sessionId: string): Promise<T | null> {
  return await cacheGet<T>(`session:${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await cacheDelete(`session:${sessionId}`);
}

// Rate limiting
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const current = await client.incr(`rate:${key}`);
    
    if (current === 1) {
      await client.expire(`rate:${key}`, windowSeconds);
    }
    
    return current <= limit;
  } catch (error) {
    console.error("Redis rate limit error:", error);
    return true; // En cas d'erreur, autoriser la requête
  }
}


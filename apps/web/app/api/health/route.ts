import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"

/**
 * GET /api/health
 * Verifica o estado de saúde de todos os serviços.
 */
export async function GET() {
    const checks: Record<string, { status: string; latency?: number; error?: string }> = {}

    // Check PostgreSQL
    const pgStart = Date.now()
    try {
        await prisma.$queryRaw`SELECT 1`
        checks.postgres = { status: "healthy", latency: Date.now() - pgStart }
    } catch (e) {
        checks.postgres = { status: "unhealthy", latency: Date.now() - pgStart, error: String(e) }
    }

    // Check Redis
    const redisStart = Date.now()
    try {
        const { default: Redis } = await import("ioredis")
        const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
            connectTimeout: 3000,
            lazyConnect: true,
        })
        await redis.connect()
        await redis.ping()
        checks.redis = { status: "healthy", latency: Date.now() - redisStart }
        await redis.disconnect()
    } catch (e) {
        checks.redis = { status: "unhealthy", latency: Date.now() - redisStart, error: String(e) }
    }

    const allHealthy = Object.values(checks).every((c) => c.status === "healthy")

    return NextResponse.json(
        {
            status: allHealthy ? "healthy" : "degraded",
            version: process.env.APP_VERSION || "0.1.0",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks,
        },
        { status: allHealthy ? 200 : 503 }
    )
}

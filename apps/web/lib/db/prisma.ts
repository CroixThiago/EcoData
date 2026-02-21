import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// ─── Prisma 7 — Driver Adapter (PostgreSQL) ─────────

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://ecodata:ecodata_secret@localhost:5432/ecodata_db?schema=public"

const adapter = new PrismaPg(connectionString)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

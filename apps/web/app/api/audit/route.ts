import { NextRequest, NextResponse } from "next/server"
import { AuditAction } from "@prisma/client"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/audit
 * Lista trilha de auditoria com paginação e filtros.
 * Acesso restrito a security_admin e validator.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // Apenas admins e validators podem ver auditoria completa
        const allowedRoles = ["security_admin", "validator"]
        if (!allowedRoles.includes(session.role)) {
            return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
        const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"))
        const action = searchParams.get("action")
        const resource = searchParams.get("resource")
        const userId = searchParams.get("userId")

        const where = {
            ...(action ? { action: action as AuditAction } : {}),
            ...(resource ? { resource } : {}),
            ...(userId ? { userId } : {}),
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { fullName: true, email: true, role: true } },
                },
            }),
            prisma.auditLog.count({ where }),
        ])

        return NextResponse.json({
            logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error("[AUDIT GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao listar auditoria" }, { status: 500 })
    }
}

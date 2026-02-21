import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/schemas/[id]
 * Retorna detalhes de um schema específico.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { id } = await params

        const schema = await prisma.schema.findUnique({
            where: { id },
            include: {
                versions: { orderBy: { createdAt: "desc" }, take: 10 },
                _count: { select: { documents: true, forms: true } },
            },
        })

        if (!schema) {
            return NextResponse.json({ error: "Schema não encontrado" }, { status: 404 })
        }

        return NextResponse.json({ schema })
    } catch (error) {
        console.error("[SCHEMA GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao buscar schema" }, { status: 500 })
    }
}

/**
 * PATCH /api/schemas/[id]
 * Atualiza um schema existente (gera versão automaticamente via trigger).
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, description, fields, status: schemaStatus, version } = body

        const existing = await prisma.schema.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Schema não encontrado" }, { status: 404 })
        }

        const schema = await prisma.schema.update({
            where: { id },
            data: {
                ...(name ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(fields ? { fields } : {}),
                ...(schemaStatus ? { status: schemaStatus } : {}),
                ...(version ? { version } : {}),
            },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "UPDATE",
                resource: "schema",
                resourceId: schema.id,
                details: { changes: Object.keys(body) },
            },
        })

        return NextResponse.json({ success: true, schema })
    } catch (error) {
        console.error("[SCHEMA PATCH] Erro:", error)
        return NextResponse.json({ error: "Erro ao atualizar schema" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { AuditAction } from "@prisma/client"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/documents/[id]
 * Retorna detalhes de um documento com suas extrações.
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

        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                uploadedBy: { select: { fullName: true, email: true } },
                schema: { select: { name: true, slug: true, fields: true } },
                extractions: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
            },
        })

        if (!document) {
            return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
        }

        return NextResponse.json({ document })
    } catch (error) {
        console.error("[DOCUMENT GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao buscar documento" }, { status: 500 })
    }
}

/**
 * PATCH /api/documents/[id]
 * Atualiza status ou metadados de um documento.
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
        const { status, schemaId, metadata } = body

        const existing = await prisma.document.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
        }

        const document = await prisma.document.update({
            where: { id },
            data: {
                ...(status ? { status } : {}),
                ...(schemaId !== undefined ? { schemaId } : {}),
                ...(metadata !== undefined ? { metadata } : {}),
            },
        })

        const action = status === "validated" ? "VALIDATE"
            : status === "approved" ? "APPROVE"
                : status === "rejected" ? "REJECT"
                    : "UPDATE"

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: action as AuditAction,
                resource: "document",
                resourceId: document.id,
                details: { changes: Object.keys(body), previousStatus: existing.status },
            },
        })

        return NextResponse.json({ success: true, document })
    } catch (error) {
        console.error("[DOCUMENT PATCH] Erro:", error)
        return NextResponse.json({ error: "Erro ao atualizar documento" }, { status: 500 })
    }
}

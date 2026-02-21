import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/forms/[id]
 * Retorna detalhes de um formulário.
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

        const form = await prisma.form.findUnique({
            where: { id },
            include: {
                schema: true,
                user: { select: { fullName: true, email: true } },
            },
        })

        if (!form) {
            return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
        }

        return NextResponse.json({ form })
    } catch (error) {
        console.error("[FORM GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao buscar formulário" }, { status: 500 })
    }
}

/**
 * PATCH /api/forms/[id]
 * Atualiza dados do formulário.
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
        const { title, data, status: formStatus } = body

        const existing = await prisma.form.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
        }

        const form = await prisma.form.update({
            where: { id },
            data: {
                ...(title ? { title } : {}),
                ...(data !== undefined ? { data } : {}),
                ...(formStatus ? { status: formStatus } : {}),
            },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "UPDATE",
                resource: "form",
                resourceId: form.id,
                details: { changes: Object.keys(body) },
            },
        })

        return NextResponse.json({ success: true, form })
    } catch (error) {
        console.error("[FORM PATCH] Erro:", error)
        return NextResponse.json({ error: "Erro ao atualizar formulário" }, { status: 500 })
    }
}

/**
 * DELETE /api/forms/[id]
 * Remove um formulário (apenas rascunhos podem ser deletados).
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { id } = await params

        const existing = await prisma.form.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 })
        }

        if (existing.status !== "draft") {
            return NextResponse.json(
                { error: "Apenas formulários em rascunho podem ser excluídos" },
                { status: 403 }
            )
        }

        await prisma.form.delete({ where: { id } })

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "DELETE",
                resource: "form",
                resourceId: id,
                details: { title: existing.title },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[FORM DELETE] Erro:", error)
        return NextResponse.json({ error: "Erro ao excluir formulário" }, { status: 500 })
    }
}

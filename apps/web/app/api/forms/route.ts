import { NextRequest, NextResponse } from "next/server"
import { FormStatus } from "@prisma/client"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/forms
 * Lista formulários do usuário com paginação.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
        const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))
        const status = searchParams.get("status")

        const where = {
            createdBy: session.userId,
            ...(status ? { status: status as FormStatus } : {}),
        }

        const [forms, total] = await Promise.all([
            prisma.form.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    schema: { select: { name: true, slug: true } },
                },
            }),
            prisma.form.count({ where }),
        ])

        return NextResponse.json({
            forms,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error("[FORMS GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao listar formulários" }, { status: 500 })
    }
}

/**
 * POST /api/forms
 * Cria novo formulário vinculado a um schema.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { title, schemaId, data } = body

        if (!title || !schemaId) {
            return NextResponse.json(
                { error: "Título e schemaId são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar se schema existe
        const schema = await prisma.schema.findUnique({ where: { id: schemaId } })
        if (!schema) {
            return NextResponse.json({ error: "Schema não encontrado" }, { status: 404 })
        }

        const form = await prisma.form.create({
            data: {
                title,
                schemaId,
                createdBy: session.userId,
                data: data || {},
            },
            include: {
                schema: { select: { name: true, slug: true } },
            },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "CREATE",
                resource: "form",
                resourceId: form.id,
                details: { title, schemaId },
            },
        })

        return NextResponse.json({ success: true, form }, { status: 201 })
    } catch (error) {
        console.error("[FORMS POST] Erro:", error)
        return NextResponse.json({ error: "Erro ao criar formulário" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { SchemaStatus } from "@prisma/client"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/schemas
 * Lista todos os schemas com filtros opcionais.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const search = searchParams.get("search")

        const where = {
            ...(status ? { status: status as SchemaStatus } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { slug: { contains: search, mode: "insensitive" as const } },
                ],
            } : {}),
        }

        const schemas = await prisma.schema.findMany({
            where,
            orderBy: { updatedAt: "desc" },
            include: {
                _count: { select: { documents: true, forms: true, versions: true } },
            },
        })

        return NextResponse.json({ schemas })
    } catch (error) {
        console.error("[SCHEMAS GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao listar schemas" }, { status: 500 })
    }
}

/**
 * POST /api/schemas
 * Cria novo schema (contrato de dados soberano).
 */
export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { name, slug, description, fields, status: schemaStatus } = body

        if (!name || !slug || !fields || !Array.isArray(fields)) {
            return NextResponse.json(
                { error: "Nome, slug e campos (fields) são obrigatórios" },
                { status: 400 }
            )
        }

        // Verificar slug único
        const existing = await prisma.schema.findUnique({ where: { slug } })
        if (existing) {
            return NextResponse.json({ error: "Slug já existe" }, { status: 409 })
        }

        const schema = await prisma.schema.create({
            data: {
                name,
                slug,
                description: description || null,
                fields,
                status: schemaStatus || "draft",
            },
        })

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "CREATE",
                resource: "schema",
                resourceId: schema.id,
                details: { name, slug, fieldCount: fields.length },
            },
        })

        return NextResponse.json({ success: true, schema }, { status: 201 })
    } catch (error) {
        console.error("[SCHEMAS POST] Erro:", error)
        return NextResponse.json({ error: "Erro ao criar schema" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { DocumentStatus, Prisma } from "@prisma/client"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/documents
 * Lista documentos do usuário autenticado com paginação.
 * 
 * Query params: page, limit, status
 */
export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
        const status = searchParams.get("status")

        const where = {
            uploadedById: session.userId,
            ...(status ? { status: status as DocumentStatus } : {}),
        }

        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    schema: { select: { name: true, slug: true } },
                    _count: { select: { extractions: true } },
                },
            }),
            prisma.document.count({ where }),
        ])

        return NextResponse.json({
            documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error("[DOCUMENTS GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao listar documentos" }, { status: 500 })
    }
}

/**
 * POST /api/documents
 * Upload e registro de novo documento.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const schemaId = formData.get("schemaId") as string | null

        if (!file) {
            return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 })
        }

        // Criar registro do documento no banco
        const document = await prisma.document.create({
            data: {
                filename: file.name,
                mimeType: file.type || "application/octet-stream",
                sizeBytes: file.size,
                uploadedById: session.userId,
                schemaId: schemaId || null,
                status: "pending",
            },
        })

        // Registrar auditoria
        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "UPLOAD",
                resource: "document",
                resourceId: document.id,
                details: { filename: file.name, mimeType: file.type, size: file.size },
            },
        })

        // Processar extração OCR em background (via event bus ou direto)
        // Por enquanto, fazemos direto e atualizamos status
        try {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const result = await TextExtractionService.extract(buffer, file.type)

            // Salvar extração
            const extraction = await prisma.extraction.create({
                data: {
                    documentId: document.id,
                    extractedBy: session.userId,
                    engine: "tesseract",
                    rawText: result.rawText || null,
                    structured: (result.structured ?? Prisma.JsonNull) as Prisma.InputJsonValue,
                    confidence: result.confidence || 0,
                },
            })

            // Atualizar status do documento
            await prisma.document.update({
                where: { id: document.id },
                data: { status: "extracted" },
            })

            return NextResponse.json({
                success: true,
                document: { ...document, status: "extracted" },
                extraction,
            }, { status: 201 })

        } catch (extractionError) {
            console.error("[DOCUMENTS] Erro na extração:", extractionError)
            // Documento foi criado mas extração falhou
            await prisma.document.update({
                where: { id: document.id },
                data: { status: "pending" },
            })

            return NextResponse.json({
                success: true,
                document,
                extraction: null,
                warning: "Documento salvo mas extração falhou. Tente novamente.",
            }, { status: 201 })
        }

    } catch (error) {
        console.error("[DOCUMENTS POST] Erro:", error)
        return NextResponse.json({ error: "Erro ao enviar documento" }, { status: 500 })
    }
}

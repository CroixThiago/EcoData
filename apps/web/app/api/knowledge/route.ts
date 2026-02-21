import { NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/auth-service"
import { NotionService } from "@/lib/integrations/notion"

/**
 * GET /api/knowledge — Buscar na base de conhecimento (Notion)
 * POST /api/knowledge — Criar página na base de conhecimento
 */

export async function GET(req: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get("q") || ""
        const type = searchParams.get("type") as "page" | "data_source" | null

        if (!query) {
            return NextResponse.json({ error: "Parâmetro 'q' obrigatório" }, { status: 400 })
        }

        const results = await NotionService.search({
            query,
            filter: type || undefined,
            pageSize: 10,
        })

        return NextResponse.json({
            results: results.results,
            total: results.results?.length || 0,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro na busca"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
        }

        const body = await req.json()
        const { title, content, tags } = body

        if (!title || !content) {
            return NextResponse.json(
                { error: "Campos 'title' e 'content' obrigatórios" },
                { status: 400 }
            )
        }

        const page = await NotionService.createKnowledgePage({
            title,
            content,
            tags,
        })

        return NextResponse.json({ success: true, pageId: page.id }, { status: 201 })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar página"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

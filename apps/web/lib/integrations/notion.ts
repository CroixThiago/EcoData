/**
 * Serviço de integração com Notion para base de conhecimento do EcoData.
 * Utiliza a API do Notion (via MCP ou REST) para sincronizar
 * schemas, documentos e eventos de auditoria.
 */

// ─── Tipos ──────────────────────────────────────

export interface KnowledgePage {
    title: string
    content: string
    tags?: string[]
    parentPageId?: string
}

export interface KnowledgeQuery {
    query: string
    filter?: "page" | "data_source"
    pageSize?: number
}

export interface NotionConfig {
    apiToken: string
    knowledgeBaseId?: string
    changelogDbId?: string
}

// ─── Serviço ────────────────────────────────────

class NotionIntegration {
    private baseUrl = "https://api.notion.com/v1"
    private version = "2022-06-28"

    private get headers(): Record<string, string> {
        const token = process.env.NOTION_API_TOKEN
        if (!token) throw new Error("NOTION_API_TOKEN não configurado")

        return {
            Authorization: `Bearer ${token}`,
            "Notion-Version": this.version,
            "Content-Type": "application/json",
        }
    }

    /**
     * Buscar páginas e databases por título
     */
    async search(params: KnowledgeQuery) {
        const body: Record<string, unknown> = {
            query: params.query,
            page_size: params.pageSize || 10,
        }

        if (params.filter) {
            body.filter = { property: "object", value: params.filter }
        }

        const res = await fetch(`${this.baseUrl}/search`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error(`Notion search failed: ${res.status}`)
        return res.json()
    }

    /**
     * Criar página na base de conhecimento
     */
    async createKnowledgePage(page: KnowledgePage) {
        const parentId = page.parentPageId || process.env.NOTION_KNOWLEDGE_BASE_ID

        if (!parentId) throw new Error("ID da base de conhecimento não configurado")

        const body = {
            parent: { page_id: parentId },
            properties: {
                title: {
                    title: [{ text: { content: page.title } }],
                },
            },
            children: this.buildBlocks(page.content, page.tags),
        }

        const res = await fetch(`${this.baseUrl}/pages`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error(`Notion create page failed: ${res.status}`)
        return res.json()
    }

    /**
     * Adicionar entrada ao changelog (database)
     */
    async addChangelogEntry(entry: {
        title: string
        type: "feature" | "bugfix" | "schema_change" | "deploy"
        description: string
        author: string
    }) {
        const dbId = process.env.NOTION_CHANGELOG_DB_ID
        if (!dbId) throw new Error("NOTION_CHANGELOG_DB_ID não configurado")

        const body = {
            parent: { database_id: dbId },
            properties: {
                Name: { title: [{ text: { content: entry.title } }] },
                Type: { select: { name: entry.type } },
                Author: { rich_text: [{ text: { content: entry.author } }] },
                Date: { date: { start: new Date().toISOString().split("T")[0] } },
            },
            children: [
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{ type: "text", text: { content: entry.description } }],
                    },
                },
            ],
        }

        const res = await fetch(`${this.baseUrl}/pages`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        })

        if (!res.ok) throw new Error(`Notion changelog failed: ${res.status}`)
        return res.json()
    }

    /**
     * Ler conteúdo de uma página
     */
    async getPageContent(pageId: string) {
        const res = await fetch(`${this.baseUrl}/blocks/${pageId}/children?page_size=100`, {
            headers: this.headers,
        })

        if (!res.ok) throw new Error(`Notion get blocks failed: ${res.status}`)
        return res.json()
    }

    /**
     * Construir blocos Notion a partir de conteúdo texto
     */
    private buildBlocks(content: string, tags?: string[]) {
        const blocks: Record<string, unknown>[] = []

        // Tags como callout
        if (tags && tags.length > 0) {
            blocks.push({
                object: "block",
                type: "callout",
                callout: {
                    icon: { type: "emoji", emoji: "🏷️" },
                    rich_text: [{ type: "text", text: { content: `Tags: ${tags.join(", ")}` } }],
                },
            })
        }

        // Dividir conteúdo em parágrafos (máx 2000 chars por bloco Notion)
        const paragraphs = content.split("\n\n").filter(Boolean)

        for (const p of paragraphs) {
            const chunks = this.chunkText(p, 2000)
            for (const chunk of chunks) {
                blocks.push({
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{ type: "text", text: { content: chunk } }],
                    },
                })
            }
        }

        return blocks
    }

    private chunkText(text: string, maxLen: number): string[] {
        if (text.length <= maxLen) return [text]
        const chunks: string[] = []
        for (let i = 0; i < text.length; i += maxLen) {
            chunks.push(text.slice(i, i + maxLen))
        }
        return chunks
    }
}

export const NotionService = new NotionIntegration()

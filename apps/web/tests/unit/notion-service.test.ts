import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock Notion fetch ──────────────────────────

const mockFetch = vi.fn()
global.fetch = mockFetch

// ─── Tests ──────────────────────────────────────

describe("NotionService", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.NOTION_API_TOKEN = "ntn_test_token"
        process.env.NOTION_KNOWLEDGE_BASE_ID = "kb-page-id"
        process.env.NOTION_CHANGELOG_DB_ID = "changelog-db-id"
    })

    describe("search", () => {
        it("deve buscar páginas com query", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    results: [
                        { id: "page-1", properties: { title: { title: [{ text: { content: "Schema RG" } }] } } },
                    ],
                }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const result = await NotionService.search({ query: "Schema RG" })

            expect(result.results).toHaveLength(1)
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.notion.com/v1/search",
                expect.objectContaining({ method: "POST" })
            )
        })

        it("deve filtrar por tipo (page/data_source)", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ results: [] }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            await NotionService.search({ query: "test", filter: "page" })

            const body = JSON.parse(mockFetch.mock.calls[0][1].body)
            expect(body.filter).toEqual({ property: "object", value: "page" })
        })

        it("deve lançar erro quando fetch falha", async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("Notion search failed: 401")
        })
    })

    describe("createKnowledgePage", () => {
        it("deve criar página com título e conteúdo", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: "new-page-id" }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const result = await NotionService.createKnowledgePage({
                title: "Novo Schema",
                content: "Documentação do schema de teste.",
                tags: ["schema", "teste"],
            })

            expect(result.id).toBe("new-page-id")
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.notion.com/v1/pages",
                expect.objectContaining({ method: "POST" })
            )
        })

        it("deve criar blocos com tags como callout", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: "page-id" }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            await NotionService.createKnowledgePage({
                title: "Test",
                content: "Content",
                tags: ["tag1", "tag2"],
            })

            const body = JSON.parse(mockFetch.mock.calls[0][1].body)
            const callout = body.children.find((b: Record<string, string>) => b.type === "callout")
            expect(callout).toBeDefined()
            expect(callout.callout.rich_text[0].text.content).toContain("tag1")
        })

        it("deve lançar erro sem NOTION_KNOWLEDGE_BASE_ID", async () => {
            delete process.env.NOTION_KNOWLEDGE_BASE_ID

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(
                NotionService.createKnowledgePage({ title: "Test", content: "Content" })
            ).rejects.toThrow("ID da base de conhecimento não configurado")
        })
    })

    describe("addChangelogEntry", () => {
        it("deve adicionar entrada ao changelog", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: "entry-id" }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const result = await NotionService.addChangelogEntry({
                title: "Deploy v1.2",
                type: "deploy",
                description: "Deploy com novas APIs",
                author: "admin@eco.gov.br",
            })

            expect(result.id).toBe("entry-id")

            const body = JSON.parse(mockFetch.mock.calls[0][1].body)
            expect(body.parent.database_id).toBe("changelog-db-id")
            expect(body.properties.Type.select.name).toBe("deploy")
        })
    })
})

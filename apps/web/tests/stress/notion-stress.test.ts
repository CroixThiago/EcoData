import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock Notion fetch ──────────────────────────

const mockFetch = vi.fn()
global.fetch = mockFetch

// ─── Stress Tests ───────────────────────────────

describe("NotionService — Stress & Edge Cases", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.NOTION_API_TOKEN = "ntn_test_token"
        process.env.NOTION_KNOWLEDGE_BASE_ID = "kb-page-id"
        process.env.NOTION_CHANGELOG_DB_ID = "changelog-db-id"
    })

    describe("Token inválido / ausente", () => {
        it("deve lançar erro quando NOTION_API_TOKEN não existe", async () => {
            delete process.env.NOTION_API_TOKEN

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("NOTION_API_TOKEN não configurado")
        })

        it("deve propagar erro HTTP 401", async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("Notion search failed: 401")
        })

        it("deve propagar erro HTTP 403 (forbidden)", async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 403 })

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("Notion search failed: 403")
        })

        it("deve propagar erro HTTP 429 (rate limit)", async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("Notion search failed: 429")
        })

        it("deve propagar erro HTTP 500 (server error)", async () => {
            mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("Notion search failed: 500")
        })
    })

    describe("Payloads extremos", () => {
        it("deve enviar query com 10.000 caracteres", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ results: [] }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const longQuery = "a".repeat(10_000)
            const result = await NotionService.search({ query: longQuery })

            expect(result.results).toEqual([])
            const body = JSON.parse(mockFetch.mock.calls[0][1].body)
            expect(body.query.length).toBe(10_000)
        })

        it("deve criar página com conteúdo de 50.000 caracteres (chunked)", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: "page-id" }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const hugeContent = "Parágrafo de teste. ".repeat(2500) // ~50KB
            await NotionService.createKnowledgePage({
                title: "Documento Enorme",
                content: hugeContent,
            })

            const body = JSON.parse(mockFetch.mock.calls[0][1].body)
            // Content should be chunked into blocks of max 2000 chars
            const paragraphs = body.children.filter(
                (b: Record<string, string>) => b.type === "paragraph"
            )
            expect(paragraphs.length).toBeGreaterThan(1)
        })

        it("deve criar página com título contendo caracteres especiais", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: "page-id" }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            await NotionService.createKnowledgePage({
                title: "Schema <RG> & 'CNH' | \"Apólice\" — Versão 1.0 (β)",
                content: "Conteúdo com acentos: ção, ñ, ü",
            })

            const body = JSON.parse(mockFetch.mock.calls[0][1].body)
            expect(body.properties.title.title[0].text.content).toContain("<RG>")
        })

        it("deve criar changelog com todos os tipos", async () => {
            const types = ["feature", "bugfix", "schema_change", "deploy"] as const

            for (const type of types) {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ id: `entry-${type}` }),
                })

                const { NotionService } = await import("@/lib/integrations/notion")
                const result = await NotionService.addChangelogEntry({
                    title: `Test ${type}`,
                    type,
                    description: `Desc for ${type}`,
                    author: "qa@eco.gov.br",
                })

                expect(result.id).toBe(`entry-${type}`)
            }
        })
    })

    describe("Concorrência", () => {
        it("deve lidar com 30 buscas simultâneas", async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ results: [{ id: "r1" }] }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")

            const results = await Promise.all(
                Array.from({ length: 30 }, (_, i) =>
                    NotionService.search({ query: `query-${i}` })
                )
            )

            expect(results).toHaveLength(30)
            expect(mockFetch).toHaveBeenCalledTimes(30)
        })
    })

    describe("Respostas inesperadas", () => {
        it("deve lidar com resposta JSON vazia", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const result = await NotionService.search({ query: "test" })

            expect(result).toBeDefined()
        })

        it("deve lidar com resposta sem campo results", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ object: "list" }),
            })

            const { NotionService } = await import("@/lib/integrations/notion")
            const result = await NotionService.search({ query: "test" })

            expect(result.results).toBeUndefined()
        })

        it("deve lidar com fetch network error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error: ECONNREFUSED"))

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("Network error: ECONNREFUSED")
        })

        it("deve lidar com fetch timeout", async () => {
            mockFetch.mockRejectedValueOnce(new Error("AbortError: The operation was aborted"))

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(NotionService.search({ query: "test" }))
                .rejects.toThrow("AbortError")
        })
    })

    describe("Validação de configuração", () => {
        it("deve lançar erro ao criar página sem NOTION_KNOWLEDGE_BASE_ID", async () => {
            delete process.env.NOTION_KNOWLEDGE_BASE_ID

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(
                NotionService.createKnowledgePage({ title: "Test", content: "Content" })
            ).rejects.toThrow("ID da base de conhecimento não configurado")
        })

        it("deve lançar erro ao criar changelog sem NOTION_CHANGELOG_DB_ID", async () => {
            delete process.env.NOTION_CHANGELOG_DB_ID

            const { NotionService } = await import("@/lib/integrations/notion")

            await expect(
                NotionService.addChangelogEntry({
                    title: "Test",
                    type: "feature",
                    description: "Desc",
                    author: "test@test.com",
                })
            ).rejects.toThrow("NOTION_CHANGELOG_DB_ID não configurado")
        })
    })
})

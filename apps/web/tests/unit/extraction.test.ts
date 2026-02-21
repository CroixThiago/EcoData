import { describe, it, expect, vi } from "vitest"

// ─── Mock pdf-parse ─────────────────────────────

vi.mock("pdf-parse", () => ({
    default: vi.fn().mockResolvedValue({
        text: "Nome: João da Silva\nCPF: 123.456.789-00\nRG: 12.345.678-9",
        numpages: 1,
        info: { Title: "Documento RG", Author: "Sistema" },
    }),
}))

// ─── Mock tesseract.js ──────────────────────────

vi.mock("tesseract.js", () => ({
    createWorker: vi.fn().mockResolvedValue({
        recognize: vi.fn().mockResolvedValue({
            data: {
                text: "Nome: Maria Santos\nCPF: 987.654.321-00",
                confidence: 92.5,
            },
        }),
        terminate: vi.fn(),
    }),
}))

// ─── Tests ──────────────────────────────────────

describe("TextExtractionService", () => {
    describe("extractFromPDF", () => {
        it("deve extrair texto de PDF com metadata", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            const pdfBuffer = Buffer.from("fake-pdf-content")
            const result = await TextExtractionService.extractFromPDF(pdfBuffer)

            expect(result).toBeDefined()
            expect(result.text).toContain("João da Silva")
            expect(result.text).toContain("123.456.789-00")
            expect(result.pages).toBe(1)
        })

        it("deve retornar campos structurados", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            const pdfBuffer = Buffer.from("fake-pdf-content")
            const result = await TextExtractionService.extractFromPDF(pdfBuffer)

            expect(result.metadata).toBeDefined()
            expect(result.metadata?.Title).toBe("Documento RG")
        })
    })

    describe("extractFromImage", () => {
        it("deve extrair texto de imagem via OCR", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            const imageBuffer = Buffer.from("fake-image-content")
            const result = await TextExtractionService.extractFromImage(imageBuffer)

            expect(result).toBeDefined()
            expect(result.text).toContain("Maria Santos")
            expect(result.confidence).toBeGreaterThan(90)
        })

        it("deve usar idioma português para OCR", async () => {
            const { createWorker } = await import("tesseract.js")
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            await TextExtractionService.extractFromImage(Buffer.from("test"))

            expect(createWorker).toHaveBeenCalledWith("por")
        })
    })

    describe("detectFileType", () => {
        it("deve detectar PDF", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            const type = TextExtractionService.detectFileType("documento.pdf")
            expect(type).toBe("pdf")
        })

        it("deve detectar imagens", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            expect(TextExtractionService.detectFileType("foto.png")).toBe("image")
            expect(TextExtractionService.detectFileType("scan.jpg")).toBe("image")
            expect(TextExtractionService.detectFileType("doc.jpeg")).toBe("image")
        })

        it("deve retornar unknown para tipos desconhecidos", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            expect(TextExtractionService.detectFileType("arquivo.xyz")).toBe("unknown")
        })
    })
})

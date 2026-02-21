import { describe, it, expect, vi } from "vitest"

// ─── Mock pdf-parse ─────────────────────────────

vi.mock("pdf-parse", () => ({
    default: vi.fn(),
}))

// ─── Mock tesseract.js ──────────────────────────

vi.mock("tesseract.js", () => ({
    createWorker: vi.fn(),
}))

// ─── Stress Tests ───────────────────────────────

describe("TextExtractionService — Stress & Edge Cases", () => {
    describe("Buffer vazio", () => {
        it("deve lidar com buffer de 0 bytes para PDF", async () => {
            const pdfParse = (await import("pdf-parse")).default
            vi.mocked(pdfParse).mockRejectedValueOnce(new Error("Empty buffer"))

            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.alloc(0), "application/pdf")

            expect(result.rawText).toBeNull()
            expect(result.confidence).toBe(0)
            expect(result.engine).toBe("pdf-parse-error")
        })

        it("deve lidar com buffer de 0 bytes para imagem", async () => {
            const { createWorker } = await import("tesseract.js")
            vi.mocked(createWorker).mockRejectedValueOnce(new Error("Empty buffer"))

            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.alloc(0), "image/png")

            expect(result.rawText).toBeNull()
            expect(result.confidence).toBe(0)
            expect(result.engine).toBe("tesseract-error")
        })

        it("deve processar buffer de 0 bytes em texto puro", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.alloc(0), "text/plain")

            expect(result.rawText).toBe("")
            expect(result.confidence).toBe(1.0)
            expect(result.engine).toBe("passthrough")
        })
    })

    describe("MIME types inválidos", () => {
        it("deve retornar unsupported para MIME desconhecido", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("data"), "application/octet-stream")

            expect(result.engine).toBe("unsupported")
            expect(result.confidence).toBe(0)
        })

        it("deve retornar unsupported para string vazia", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("data"), "")

            expect(result.engine).toBe("unsupported")
        })

        it("deve retornar unsupported para MIME com injection", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(
                Buffer.from("data"),
                "application/pdf; charset=utf-8; evil=true"
            )

            expect(result.engine).toBe("unsupported")
        })
    })

    describe("Buffers muito grandes (simulado)", () => {
        it("deve lidar com buffer de 10MB de texto", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const largeBuffer = Buffer.alloc(10 * 1024 * 1024, "A") // 10MB de 'A'
            const result = await TextExtractionService.extract(largeBuffer, "text/plain")

            expect(result.rawText).toBeDefined()
            expect(result.rawText!.length).toBe(10 * 1024 * 1024)
            expect(result.confidence).toBe(1.0)
            expect(result.durationMs).toBeGreaterThanOrEqual(0)
        })

        it("deve medir duracao corretamente", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("test"), "text/plain")

            expect(result.durationMs).toBeTypeOf("number")
            expect(result.durationMs).toBeGreaterThanOrEqual(0)
            expect(result.durationMs).toBeLessThan(5000) // não devem demorar mais de 5s
        })
    })

    describe("PDF com erro de parsing", () => {
        it("deve retornar erro quando pdf-parse lança exceção", async () => {
            const pdfParse = (await import("pdf-parse")).default
            vi.mocked(pdfParse).mockRejectedValueOnce(new Error("Corrupted PDF"))

            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("corrupted"), "application/pdf")

            expect(result.engine).toBe("pdf-parse-error")
            expect(result.rawText).toBeNull()
        })

        it("deve retornar zero confidence quando PDF sem texto", async () => {
            const pdfParse = (await import("pdf-parse")).default
            vi.mocked(pdfParse).mockResolvedValueOnce({
                text: "",
                numpages: 1,
                info: {},
            })

            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("empty-pdf"), "application/pdf")

            expect(result.confidence).toBe(0)
            expect(result.rawText).toBe("")
        })
    })

    describe("OCR com erro", () => {
        it("deve retornar erro quando tesseract falha", async () => {
            const { createWorker } = await import("tesseract.js")
            vi.mocked(createWorker).mockRejectedValueOnce(new Error("OCR Engine Error"))

            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("bad-image"), "image/jpeg")

            expect(result.engine).toBe("tesseract-error")
            expect(result.rawText).toBeNull()
        })

        it("deve retornar erro quando worker.recognize falha", async () => {
            const { createWorker } = await import("tesseract.js")
            vi.mocked(createWorker).mockResolvedValueOnce({
                recognize: vi.fn().mockRejectedValueOnce(new Error("Recognition failed")),
                terminate: vi.fn(),
            } as unknown as Awaited<ReturnType<typeof createWorker>>)

            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const result = await TextExtractionService.extract(Buffer.from("bad-image"), "image/png")

            expect(result.engine).toBe("tesseract-error")
        })
    })

    describe("detectFileType — edge cases", () => {
        it("deve lidar com arquivo sem extensão", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            expect(TextExtractionService.detectFileType("Makefile")).toBe("unknown")
        })

        it("deve lidar com extensão maiúscula", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            expect(TextExtractionService.detectFileType("foto.PNG")).toBe("image")
            expect(TextExtractionService.detectFileType("doc.PDF")).toBe("pdf")
        })

        it("deve lidar com múltiplos pontos no nome", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            expect(TextExtractionService.detectFileType("my.file.name.pdf")).toBe("pdf")
            expect(TextExtractionService.detectFileType("backup.2024.01.jpg")).toBe("image")
        })

        it("deve lidar com extensão com caracteres especiais", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            expect(TextExtractionService.detectFileType("file.pdfx")).toBe("unknown")
        })

        it("deve lidar com string vazia", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            expect(TextExtractionService.detectFileType("")).toBe("unknown")
        })

        it("deve detectar todos os formatos de imagem suportados", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const formats = ["png", "jpg", "jpeg", "webp", "tiff", "bmp", "gif"]

            for (const fmt of formats) {
                expect(TextExtractionService.detectFileType(`test.${fmt}`)).toBe("image")
            }
        })

        it("deve detectar todos os formatos de texto suportados", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")
            const formats = ["txt", "csv", "json", "xml"]

            for (const fmt of formats) {
                expect(TextExtractionService.detectFileType(`data.${fmt}`)).toBe("text")
            }
        })
    })

    describe("Processamento concorrente", () => {
        it("deve processar 20 extrações de texto simultaneamente", async () => {
            const { TextExtractionService } = await import("@/lib/ai/extraction")

            const results = await Promise.all(
                Array.from({ length: 20 }, (_, i) =>
                    TextExtractionService.extract(
                        Buffer.from(`Documento número ${i}`),
                        "text/plain"
                    )
                )
            )

            expect(results).toHaveLength(20)
            results.forEach((result, i) => {
                expect(result.rawText).toContain(`Documento número ${i}`)
                expect(result.confidence).toBe(1.0)
            })
        })
    })
})

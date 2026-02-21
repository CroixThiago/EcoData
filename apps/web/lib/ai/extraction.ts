/**
 * TextExtractionService — Serviço de extração de texto de documentos
 * 
 * Suporta:
 * - PDFs (via pdf-parse)
 * - Imagens (via tesseract.js OCR)
 * - Texto puro (passthrough)
 */

export interface ExtractionResult {
    rawText: string | null
    structured: Record<string, unknown> | null
    confidence: number
    engine: string
    durationMs: number
}

export const TextExtractionService = {
    /**
     * Extrai texto de um buffer baseado no MIME type.
     */
    async extract(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
        const start = Date.now()

        try {
            if (mimeType === "application/pdf") {
                return await extractFromPDF(buffer, start)
            } else if (mimeType.startsWith("image/")) {
                return await extractFromImage(buffer, start)
            } else if (mimeType.startsWith("text/")) {
                const text = buffer.toString("utf-8")
                return {
                    rawText: text,
                    structured: null,
                    confidence: 1.0,
                    engine: "passthrough",
                    durationMs: Date.now() - start,
                }
            }

            return {
                rawText: null,
                structured: null,
                confidence: 0,
                engine: "unsupported",
                durationMs: Date.now() - start,
            }
        } catch (error) {
            console.error("[EXTRACTION] Erro:", error)
            return {
                rawText: null,
                structured: null,
                confidence: 0,
                engine: "error",
                durationMs: Date.now() - start,
            }
        }
    },

    /** Extrai texto de um PDF */
    async extractFromPDF(buffer: Buffer): Promise<ExtractionResult & { text: string; pages: number; metadata: Record<string, unknown> | null }> {
        const result = await extractFromPDF(buffer, Date.now())
        return {
            ...result,
            text: result.rawText || "",
            pages: (result.structured as Record<string, unknown>)?.pages as number || 0,
            metadata: (result.structured as Record<string, unknown>)?.info as Record<string, unknown> || null,
        }
    },

    /** Extrai texto de uma imagem via OCR */
    async extractFromImage(buffer: Buffer): Promise<ExtractionResult & { text: string; confidence: number }> {
        const result = await extractFromImage(buffer, Date.now())
        return {
            ...result,
            text: result.rawText || "",
            confidence: (result.structured as Record<string, unknown>)?.confidence as number || 0,
        }
    },

    /** Detecta tipo de arquivo baseado na extensão */
    detectFileType(filename: string): "pdf" | "image" | "text" | "unknown" {
        const ext = filename.split(".").pop()?.toLowerCase()
        if (ext === "pdf") return "pdf"
        if (["png", "jpg", "jpeg", "webp", "tiff", "bmp", "gif"].includes(ext || "")) return "image"
        if (["txt", "csv", "json", "xml"].includes(ext || "")) return "text"
        return "unknown"
    },
}

async function extractFromPDF(buffer: Buffer, start: number): Promise<ExtractionResult> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await import("pdf-parse") as any
        const pdfParse = mod.default || mod
        const data = await pdfParse(buffer)

        return {
            rawText: data.text,
            structured: {
                pages: data.numpages,
                info: data.info,
            },
            confidence: data.text.length > 0 ? 0.85 : 0,
            engine: "pdf-parse",
            durationMs: Date.now() - start,
        }
    } catch (error) {
        console.error("[PDF] Erro na extração:", error)
        return {
            rawText: null,
            structured: null,
            confidence: 0,
            engine: "pdf-parse-error",
            durationMs: Date.now() - start,
        }
    }
}

async function extractFromImage(buffer: Buffer, start: number): Promise<ExtractionResult> {
    try {
        const { createWorker } = await import("tesseract.js")
        const worker = await createWorker("por") // Português
        const { data } = await worker.recognize(buffer)
        await worker.terminate()

        return {
            rawText: data.text,
            structured: {
                words: (data as unknown as Record<string, unknown[]>).words?.length || 0,
                confidence: data.confidence,
            },
            confidence: (data.confidence || 0) / 100,
            engine: "tesseract",
            durationMs: Date.now() - start,
        }
    } catch (error) {
        console.error("[OCR] Erro na extração:", error)
        return {
            rawText: null,
            structured: null,
            confidence: 0,
            engine: "tesseract-error",
            durationMs: Date.now() - start,
        }
    }
}

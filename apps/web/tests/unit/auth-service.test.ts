import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock jose ──────────────────────────────────

const mockSign = vi.fn().mockResolvedValue("mock-jwt-token")

vi.mock("jose", () => {
    class MockSignJWT {
        constructor() { }
        setProtectedHeader() { return this }
        setIssuedAt() { return this }
        setExpirationTime() { return this }
        sign() { return mockSign() }
    }
    return {
        SignJWT: MockSignJWT,
        jwtVerify: vi.fn().mockResolvedValue({
            payload: {
                userId: "user-1",
                email: "test@eco.gov.br",
                name: "Test User",
                role: "doc_analyst",
            },
        }),
    }
})

// ─── Mock next/headers (cookies) ────────────────

const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
}

vi.mock("next/headers", () => ({
    cookies: vi.fn().mockResolvedValue(mockCookieStore),
}))

// ─── Mock NextResponse ──────────────────────────

const mockCookieSet = vi.fn()
const mockCookieDelete = vi.fn()

vi.mock("next/server", () => ({
    NextResponse: {
        json: vi.fn(() => ({
            cookies: { set: mockCookieSet, delete: mockCookieDelete },
        })),
    },
}))

// ─── Tests ──────────────────────────────────────

describe("AuthService", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.AUTH_SECRET = "test-secret-key-for-jwt-signing-32chars!"
    })

    describe("getSession", () => {
        it("deve retornar null quando não há cookie", async () => {
            mockCookieStore.get.mockReturnValue(undefined)

            const { AuthService } = await import("@/lib/auth/auth-service")
            const session = await AuthService.getSession()

            expect(session).toBeNull()
        })

        it("deve retornar sessão válida quando cookie existe", async () => {
            mockCookieStore.get.mockReturnValue({ value: "mock-jwt-token" })

            const { AuthService } = await import("@/lib/auth/auth-service")
            const session = await AuthService.getSession()

            expect(session).toEqual({
                userId: "user-1",
                email: "test@eco.gov.br",
                name: "Test User",
                role: "doc_analyst",
            })
        })

        it("deve retornar null quando JWT é inválido", async () => {
            mockCookieStore.get.mockReturnValue({ value: "invalid-token" })

            const { jwtVerify } = await import("jose")
            vi.mocked(jwtVerify).mockRejectedValueOnce(new Error("JWT inválido"))

            const { AuthService } = await import("@/lib/auth/auth-service")
            const session = await AuthService.getSession()

            expect(session).toBeNull()
        })
    })

    describe("createSession", () => {
        it("deve criar sessão e retornar response com cookie", async () => {
            const { AuthService } = await import("@/lib/auth/auth-service")

            const user = {
                userId: "user-1",
                email: "test@eco.gov.br",
                name: "Test User",
                role: "doc_analyst" as const,
            }

            const response = await AuthService.createSession(user)

            expect(response).toBeDefined()
            expect(mockCookieSet).toHaveBeenCalled()
        })
    })

    describe("destroySession", () => {
        it("deve destruir sessão limpando cookie", async () => {
            const { AuthService } = await import("@/lib/auth/auth-service")
            const response = await AuthService.destroySession()

            expect(response).toBeDefined()
            expect(mockCookieSet).toHaveBeenCalled()
        })
    })
})

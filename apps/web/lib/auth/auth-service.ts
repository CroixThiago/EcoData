import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"

// ─── Tipos ──────────────────────────────────────────

export interface UserSession {
    userId: string
    email: string
    name: string
    role: "insured" | "broker" | "doc_analyst" | "template_creator" | "validator" | "security_admin"
}

// ─── Configuração ───────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || "ecodata-sovereign-secret-change-me"
)
const SESSION_COOKIE = "session"
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 dias em segundos

// ─── AuthService ────────────────────────────────────

export const AuthService = {
    /**
     * Cria sessão JWT e seta cookie httpOnly.
     * Retorna NextResponse com cookie configurado.
     */
    async createSession(user: UserSession): Promise<NextResponse> {
        const token = await new SignJWT({ ...user })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(`${SESSION_DURATION}s`)
            .sign(JWT_SECRET)

        const response = NextResponse.json({ success: true, user })

        response.cookies.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: SESSION_DURATION,
            path: "/",
        })

        return response
    },

    /**
     * Lê e valida sessão do cookie JWT.
     * Retorna UserSession ou null se inválida/expirada.
     */
    async getSession(): Promise<UserSession | null> {
        try {
            const cookieStore = await cookies()
            const token = cookieStore.get(SESSION_COOKIE)?.value

            if (!token) return null

            const { payload } = await jwtVerify(token, JWT_SECRET)

            return {
                userId: payload.userId as string,
                email: payload.email as string,
                name: payload.name as string,
                role: payload.role as UserSession["role"],
            }
        } catch {
            return null
        }
    },

    /**
     * Destrói sessão removendo o cookie.
     */
    async destroySession(): Promise<NextResponse> {
        const response = NextResponse.json({ success: true })

        response.cookies.set(SESSION_COOKIE, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        })

        return response
    },
}

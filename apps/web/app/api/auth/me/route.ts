import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/auth/me
 * Retorna dados da sessão do usuário autenticado.
 */
export async function GET() {
    try {
        const session = await AuthService.getSession()

        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
        }

        return NextResponse.json({ user: session })
    } catch {
        return NextResponse.json({ error: "Erro ao validar sessão" }, { status: 500 })
    }
}

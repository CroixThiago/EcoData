import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * POST /api/auth/logout
 * Destrói sessão do usuário.
 */
export async function POST() {
    try {
        return await AuthService.destroySession()
    } catch {
        return NextResponse.json({ error: "Erro ao encerrar sessão" }, { status: 500 })
    }
}

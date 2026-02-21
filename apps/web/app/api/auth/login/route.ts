import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth/auth-service"
import type { UserSession } from "@/lib/auth/auth-service"
import prisma from "@/lib/db/prisma"
import bcrypt from "bcryptjs"

/**
 * POST /api/auth/login
 * 
 * Autenticação real com validação contra banco de dados.
 * Usa bcrypt para comparação de senha e JWT para sessão.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email e senha são obrigatórios" },
                { status: 400 }
            )
        }

        // Buscar usuário no banco de dados
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Credenciais inválidas" },
                { status: 401 }
            )
        }

        // Validar senha com bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Credenciais inválidas" },
                { status: 401 }
            )
        }

        // Atualizar último login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        })

        // Registrar na trilha de auditoria
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "LOGIN",
                resource: "user",
                resourceId: user.id,
                details: { email: user.email },
                ipAddress: request.headers.get("x-forwarded-for") || "unknown",
                userAgent: request.headers.get("user-agent") || "unknown",
            },
        })

        // Criar sessão JWT
        const session: UserSession = {
            userId: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role as UserSession["role"],
        }

        const response = await AuthService.createSession(session)
        return response

    } catch (error) {
        console.error("[LOGIN] Erro:", error)
        return NextResponse.json(
            { error: "Erro interno de autenticação" },
            { status: 500 }
        )
    }
}

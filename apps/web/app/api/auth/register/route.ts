import { NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"

/**
 * POST /api/auth/register
 * 
 * Cadastro de novos usuários com hash bcrypt.
 * Valida email único e cria entrada no banco.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, fullName, role } = body

        // Validações
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: "Email, senha e nome completo são obrigatórios" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Senha deve ter no mínimo 8 caracteres" },
                { status: 400 }
            )
        }

        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 409 }
            )
        }

        // Hash da senha
        const passwordHash = await bcrypt.hash(password, 12)

        // Validar role (default: insured)
        const validRoles: UserRole[] = ["insured", "broker", "doc_analyst", "template_creator", "validator", "security_admin"]
        const userRole: UserRole = validRoles.includes(role) ? role : "insured"

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                passwordHash,
                fullName: fullName.trim(),
                role: userRole,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        })

        // Registrar na auditoria
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "CREATE",
                resource: "user",
                resourceId: user.id,
                details: { email: user.email, role: user.role },
            },
        })

        // Criar notificação de boas-vindas
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: "success",
                title: "Bem-vindo ao EcoData!",
                message: `Olá ${user.fullName}, sua conta foi criada com sucesso. Explore sua plataforma soberana.`,
                link: "/dashboard",
            },
        })

        return NextResponse.json({ success: true, user }, { status: 201 })

    } catch (error) {
        console.error("[REGISTER] Erro:", error)
        return NextResponse.json(
            { error: "Erro ao criar conta" },
            { status: 500 }
        )
    }
}

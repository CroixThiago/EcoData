import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/notifications
 * Lista notificações do usuário autenticado.
 * 
 * Query params: unreadOnly (boolean)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get("unreadOnly") === "true"

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.userId,
                ...(unreadOnly ? { read: false } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        })

        const unreadCount = await prisma.notification.count({
            where: { userId: session.userId, read: false },
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error("[NOTIFICATIONS GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao listar notificações" }, { status: 500 })
    }
}

/**
 * PATCH /api/notifications
 * Marca notificações como lidas.
 * Body: { ids: string[] } ou { markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { ids, markAllRead } = body

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: { userId: session.userId, read: false },
                data: { read: true },
            })
        } else if (ids && Array.isArray(ids)) {
            await prisma.notification.updateMany({
                where: { id: { in: ids }, userId: session.userId },
                data: { read: true },
            })
        } else {
            return NextResponse.json({ error: "ids ou markAllRead é obrigatório" }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[NOTIFICATIONS PATCH] Erro:", error)
        return NextResponse.json({ error: "Erro ao atualizar notificações" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { AuthService } from "@/lib/auth/auth-service"

/**
 * GET /api/marketplace
 * Lista produtos do marketplace com filtro por categoria.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")

        const products = await prisma.marketplaceProduct.findMany({
            where: {
                isActive: true,
                ...(category ? { category } : {}),
            },
            orderBy: { name: "asc" },
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error("[MARKETPLACE GET] Erro:", error)
        return NextResponse.json({ error: "Erro ao listar produtos" }, { status: 500 })
    }
}

/**
 * POST /api/marketplace/purchase
 * Registra compra de um produto do marketplace.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession()
        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { productId } = body

        if (!productId) {
            return NextResponse.json({ error: "productId é obrigatório" }, { status: 400 })
        }

        const product = await prisma.marketplaceProduct.findUnique({
            where: { id: productId },
        })

        if (!product || !product.isActive) {
            return NextResponse.json({ error: "Produto não encontrado ou inativo" }, { status: 404 })
        }

        await prisma.auditLog.create({
            data: {
                userId: session.userId,
                action: "CREATE",
                resource: "marketplace_purchase",
                resourceId: product.id,
                details: { productName: product.name, price: product.price.toString(), currency: product.currency },
            },
        })

        await prisma.notification.create({
            data: {
                userId: session.userId,
                type: "success",
                title: "Compra Realizada!",
                message: `Você adquiriu "${product.name}". O módulo estará disponível em instantes.`,
            },
        })

        return NextResponse.json({
            success: true,
            purchase: {
                productId: product.id,
                productName: product.name,
                price: product.price,
                currency: product.currency,
                purchasedAt: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error("[MARKETPLACE POST] Erro:", error)
        return NextResponse.json({ error: "Erro ao processar compra" }, { status: 500 })
    }
}

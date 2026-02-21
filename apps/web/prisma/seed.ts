import { PrismaClient, UserRole, SchemaStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Iniciando seed do EcoData...")

    // ─── Usuários ──────────────────────────────────────
    const adminPassword = await bcrypt.hash("admin123", 12)
    const brokerPassword = await bcrypt.hash("broker123", 12)
    const analystPassword = await bcrypt.hash("analyst123", 12)

    const admin = await prisma.user.upsert({
        where: { email: "admin@ecodata.io" },
        update: {},
        create: {
            email: "admin@ecodata.io",
            passwordHash: adminPassword,
            fullName: "Administrador Soberano",
            role: UserRole.security_admin,
        },
    })

    await prisma.user.upsert({
        where: { email: "broker@ecodata.io" },
        update: {},
        create: {
            email: "broker@ecodata.io",
            passwordHash: brokerPassword,
            fullName: "Carlos Corretor",
            role: UserRole.broker,
        },
    })

    await prisma.user.upsert({
        where: { email: "analyst@ecodata.io" },
        update: {},
        create: {
            email: "analyst@ecodata.io",
            passwordHash: analystPassword,
            fullName: "Ana Analista de Docs",
            role: UserRole.doc_analyst,
        },
    })

    console.log(`  ✅ ${3} usuários criados`)

    // ─── Schemas (Contratos de Dados) ──────────────────
    await prisma.schema.upsert({
        where: { slug: "rg-nacional" },
        update: {},
        create: {
            name: "RG Nacional",
            slug: "rg-nacional",
            description: "Schema para extração de dados do RG brasileiro",
            status: SchemaStatus.active,
            version: "1.2.0",
            fields: [
                { id: "nome", label: "Nome Completo", type: "text", required: true },
                { id: "rg_numero", label: "Número do RG", type: "text", required: true },
                { id: "data_nascimento", label: "Data de Nascimento", type: "date", required: true },
                { id: "filiacao_mae", label: "Filiação (Mãe)", type: "text", required: false },
                { id: "filiacao_pai", label: "Filiação (Pai)", type: "text", required: false },
                { id: "naturalidade", label: "Naturalidade", type: "text", required: false },
                { id: "orgao_emissor", label: "Órgão Emissor", type: "text", required: true },
                { id: "data_emissao", label: "Data de Emissão", type: "date", required: false },
            ],
        },
    })

    await prisma.schema.upsert({
        where: { slug: "cnh-digital" },
        update: {},
        create: {
            name: "CNH Digital",
            slug: "cnh-digital",
            description: "Schema para extração de dados da CNH digital",
            status: SchemaStatus.active,
            version: "2.1.0",
            fields: [
                { id: "nome", label: "Nome", type: "text", required: true },
                { id: "cpf", label: "CPF", type: "text", required: true },
                { id: "data_nascimento", label: "Data de Nascimento", type: "date", required: true },
                { id: "registro", label: "Nº Registro", type: "text", required: true },
                { id: "validade", label: "Validade", type: "date", required: true },
                { id: "categoria", label: "Categoria", type: "text", required: true },
                { id: "primeira_habilitacao", label: "1ª Habilitação", type: "date", required: false },
                { id: "observacoes", label: "Observações", type: "text", required: false },
                { id: "renach", label: "RENACH", type: "text", required: false },
                { id: "espelho", label: "Nº Espelho", type: "text", required: false },
                { id: "local", label: "Local", type: "text", required: false },
                { id: "foto_base64", label: "Foto (Base64)", type: "text", required: false },
            ],
        },
    })

    await prisma.schema.upsert({
        where: { slug: "apolice-saude" },
        update: {},
        create: {
            name: "Apólice Saúde",
            slug: "apolice-saude",
            description: "Schema para formulário de apólice de saúde",
            status: SchemaStatus.draft,
            version: "0.5.0",
            fields: [
                { id: "segurado_nome", label: "Nome do Segurado", type: "text", required: true },
                { id: "segurado_cpf", label: "CPF do Segurado", type: "text", required: true },
                { id: "plano", label: "Tipo de Plano", type: "select", required: true },
                { id: "valor_mensal", label: "Valor Mensal", type: "number", required: true },
                { id: "vigencia_inicio", label: "Início da Vigência", type: "date", required: true },
                { id: "vigencia_fim", label: "Fim da Vigência", type: "date", required: true },
                { id: "beneficiarios", label: "Beneficiários", type: "text", required: false },
                { id: "carencia", label: "Período de Carência", type: "text", required: false },
                { id: "cobertura", label: "Coberturas Incluídas", type: "text", required: false },
                { id: "exclusoes", label: "Exclusões", type: "text", required: false },
            ],
        },
    })

    console.log(`  ✅ ${3} schemas criados`)

    // ─── Produtos do Marketplace ───────────────────────
    await prisma.marketplaceProduct.createMany({
        skipDuplicates: true,
        data: [
            {
                name: "Motor OCR Premium",
                description: "Extração avançada com IA para documentos brasileiros (RG, CNH, CTPS)",
                category: "ocr",
                price: 299.90,
                currency: "BRL",
            },
            {
                name: "Validador de CNH",
                description: "Verificação de autenticidade de CNH em tempo real via API do DETRAN",
                category: "validation",
                price: 149.90,
                currency: "BRL",
            },
            {
                name: "Assinatura Digital ICP-Brasil",
                description: "Módulo de assinatura digital com certificado ICP-Brasil para contratos",
                category: "security",
                price: 499.90,
                currency: "BRL",
            },
        ],
    })

    console.log(`  ✅ ${3} produtos do marketplace criados`)

    // ─── Notificações iniciais ─────────────────────────
    await prisma.notification.createMany({
        data: [
            {
                userId: admin.id,
                type: "info",
                title: "Bem-vindo ao EcoData",
                message: "Sua plataforma soberana está pronta para uso. Configure suas integrações em Configurações.",
                link: "/dashboard/settings",
            },
            {
                userId: admin.id,
                type: "warning",
                title: "Configurar API Key",
                message: "A chave da API OpenAI ainda é placeholder. Configure em .env para habilitar IA.",
            },
        ],
    })

    console.log(`  ✅ Notificações iniciais criadas`)
    console.log("🏁 Seed concluído com sucesso!")
}

main()
    .catch((e) => {
        console.error("❌ Erro no seed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

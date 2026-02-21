# 🔌 EcoData — Integrações MCP (Model Context Protocol)

## Visão Geral

O EcoData utiliza 4 servidores MCP para estender funcionalidades além do código local:

| Servidor | Propósito | Autenticação |
|----------|-----------|--------------|
| **Firebase** | Auth, Hosting, Firestore, Cloud Functions | Firebase CLI login |
| **Notion** | Base de conhecimento, documentação, tickets | API Token |
| **Cloud Run** | Deploy de containers, escalonamento | GCP Service Account |
| **Context7** | Documentação técnica real-time | API Key |

---

## 1. Firebase MCP Server

### Funcionalidades Disponíveis

- **Autenticação**: Login/Logout, gerenciamento de projetos
- **Hosting**: Deploy de assets estáticos
- **Firestore**: CRUD de documentos em tempo real
- **Cloud Functions**: Executar funções serverless
- **App Check**: Proteção contra abuso

### Configuração

```bash
# Login no Firebase CLI
firebase login

# Definir projeto ativo
firebase use --add ecodata-prod
```

### Uso no EcoData

- **Auth**: Backup de autenticação (além do JWT local)
- **Firestore**: Cache de schemas e configurações em tempo real
- **Hosting**: CDN para assets estáticos do dashboard

---

## 2. Notion MCP Server

### Funcionalidades Disponíveis

- **Busca**: Pesquisar páginas e databases
- **CRUD**: Criar/ler/atualizar/deletar páginas
- **Databases**: Consultar e filtrar databases
- **Comentários**: Adicionar comentários em páginas

### Configuração

Requer `NOTION_API_TOKEN` no `.env`:

```env
NOTION_API_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Uso no EcoData

- **Base de Conhecimento**: Documentar schemas, processos, e decisões
- **Tickets**: Rastrear issues e tarefas
- **Changelog**: Registrar mudanças na plataforma
- **KPIs**: Dashboards de métricas do sistema

### Integração Programática

```typescript
// lib/integrations/notion.ts
import { NotionService } from "@/lib/integrations/notion"

// Criar página na base de conhecimento
await NotionService.createKnowledgePage({
  title: "Schema RG Nacional v1.2",
  content: "Documentação do schema...",
  tags: ["schema", "rg", "documentos"]
})
```

---

## 3. Cloud Run MCP Server

### Funcionalidades Disponíveis

- **Deploy**: Container images, pastas locais, arquivos
- **Gerenciamento**: Listar serviços, ver logs, detalhes
- **Projetos**: Criar e listar projetos GCP

### Configuração

Requer conta GCP com billing ativo e `gcloud` CLI configurado.

### Uso no EcoData

- **Deploy Produção**: Containerizar e deployar a aplicação
- **Microserviços**: Deploy de workers de OCR isolados
- **Escalonamento**: Auto-scale baseado em demanda

### Deploy Command

```bash
# Deploy da pasta web para Cloud Run
gcloud run deploy ecodata-web \
  --source ./apps/web \
  --region southamerica-east1 \
  --allow-unauthenticated
```

---

## 4. Context7 MCP Server

### Funcionalidades Disponíveis

- **Resolver Library ID**: Encontrar IDs de bibliotecas
- **Query Docs**: Buscar documentação atualizada de qualquer lib

### Uso no EcoData

- **Dev-time**: Buscar docs de Prisma, Next.js, Tesseract em tempo real
- **AI Assistant**: Alimentar o orquestrador com docs técnicos atualizados

---

## Variáveis de Ambiente MCP

```env
# Firebase (configurado via CLI login)
# Notion
NOTION_API_TOKEN=ntn_xxxxxxxx

# Cloud Run (configurado via gcloud CLI)
GCP_PROJECT_ID=ecodata-prod
GCP_REGION=southamerica-east1

# Context7
CONTEXT7_API_KEY=ctx7sk_xxxxxxxx
```

---

## Arquitetura de Integração

```
EcoData Platform
│
├─► Firebase MCP ──► Auth + Firestore + Hosting
│
├─► Notion MCP ───► Knowledge Base + Tickets
│
├─► Cloud Run MCP ► Container Deploy + Scaling
│
└─► Context7 MCP ─► Live Documentation
```

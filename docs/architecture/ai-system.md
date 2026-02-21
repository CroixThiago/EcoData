# 🤖 EcoData — Arquitetura do Sistema de IA

## Visão Geral

O sistema de IA do EcoData opera em três camadas complementares:

```
┌─────────────────────────────────────┐
│       Camada de Apresentação        │
│   Dashboard AI • Notificações       │
├─────────────────────────────────────┤
│       Camada de Orquestração        │
│   Event Bus (Redis) • Orchestrator  │
├─────────────────────────────────────┤
│       Camada de Processamento       │
│   OCR • NLP • Embeddings • Qdrant   │
└─────────────────────────────────────┘
```

## Pipeline de Extração

1. **Upload** → API recebe documento (PDF/Imagem)
2. **OCR** → Tesseract.js (português) extrai texto bruto
3. **Estruturação** → OpenAI GPT estrutura dados via schema
4. **Embeddings** → Vercel AI SDK gera vetores, armazena no Qdrant
5. **Validação** → SchemaEngine valida contra contrato de dados
6. **Persistência** → Resultado salvo em PostgreSQL via Prisma

## Serviços de IA

| Serviço | Tecnologia | Uso |
|---------|------------|-----|
| OCR | `tesseract.js` | Extração de texto de imagens |
| PDF Parse | `pdf-parse` | Extração de texto de PDFs |
| NLP/Estruturação | `@ai-sdk/openai` | Estruturar dados extraídos |
| Embeddings | `ai` (Vercel SDK) | Vetorização para busca semântica |
| Vector DB | `@qdrant/js-client-rest` | Armazenamento e busca de vetores |

## Eventos do Event Bus

| Evento | Trigger | Handler |
|--------|---------|---------|
| `document:uploaded` | Upload de doc | Iniciar OCR |
| `document:extracted` | OCR concluído | Estruturar com IA |
| `document:validated` | Validação OK | Notificar usuário |
| `security:anomaly` | Detecção de anomalia | Alertar admin |

## Integrações MCP

O EcoData se integra com 4 servidores MCP para estender capacidades:

- **Firebase** — Autenticação avançada, Hosting, Firestore
- **Notion** — Base de conhecimento e documentação
- **Cloud Run** — Deploy containerizado
- **Context7** — Documentação técnica em tempo real

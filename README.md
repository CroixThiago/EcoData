# EcoData Enterprise Platform — Gestão de Dados Soberana

**EcoData** é uma plataforma de gerenciamento de dados de alta performance e orientada a eventos, projetada especificamente para o setor público e de seguros, com foco em soberania de dados, integridade e automação via IA.

---

## 🚀 Funcionalidades Principais

- **Autenticação Soberana**: Sistema de autenticação robusto com Session Cookies seguros (HTTPOnly), JWT (jose) e hashing via bcrypt.
- **Pipeline de Extração Inteligente**: Extração automática de dados de arquivos PDF e Imagens (OCR) utilizando `tesseract.js` e `pdf-parse`.
- **Contratos de Dados (Schemas)**: Implementação de esquemas versionados para validação de integridade de dados.
- **Gestão de Documentos**: Pipeline completo de upload, extração, validação e auditoria.
- **Log de Auditoria Imutável**: Todas as ações críticas da plataforma são registradas em trilhas de auditoria protegidas por triggers de banco de dados.
- **Integração MCP (Model Context Protocol)**: Conectividade nativa com ecossistemas externos:
  - **Notion**: Base de conhecimento dinâmica e changelog automatizado.
  - **Firebase**: Autenticação social e notificações push.
  - **Cloud Run**: Infraestrutura escalável e segura.
  - **Context7**: Documentação técnica e exemplos de código sempre atualizados.
- **Dashboard de IA (Orchestrator)**: Centro de comando para monitoramento em tempo real dos processos de IA.

---

## 🏗️ Arquitetura

A plataforma utiliza um design moderno e resiliente:

- **Event-Driven**: Processamento assíncrono via Redis Streams para ingestão de dados em larga escala.
- **Design Soberano**: Prioridade máxima para segurança, imutabilidade e controle total sobre a infraestrutura de dados.
- **Monorepo Modular**: Estrutura organizada para facilitar a escalabilidade e o compartilhamento de código.
- **Polyglot Persistence**:
  - **PostgreSQL (Prisma 7)**: Dados relacionais, usuários e contratos.
  - **MongoDB**: Dados não estruturados e logs técnicos.
  - **Redis**: Caching de performance e filas distribuídas.
  - **Qdrant**: Banco de dados vetorial para busca semântica em documentos.

---

## 🛠️ Stack Tecnológica

- **Frontend/Backend**: Next.js 16.1.6 (Turbopack)
- **ORM**: Prisma 7.4.1 (Driver Adapter)
- **IA/OCR**: Vercel AI SDK, Tesseract.js, PDF-parse
- **Segurança**: Jose (JWT), BcryptJS
- **Estilização**: Tailwind CSS (Lucide Icons, Framer Motion)
- **Testes**: Vitest, React Testing Library, JSDOM

---

## 🧪 Estratégia de Qualidade (QA)

A plataforma conta com uma cobertura de testes abrangente, focada em cenários reais e teste de stress:

- **79 Testes Ativos**: Cobrindo autenticação, extração de texto, serviços de integração e rotas de API.
- **Testes de Stress**: Validação de resiliência contra payloads malformados, tokens inválidos e concorrência elevada.
- **Integração Contínua**: Hooks configurados para garantir a saúde do build.

Para executar os testes:

```bash
npm test          # Executa todos os testes
npm run test:cov  # Relatório de cobertura (V8)
```

---

## 📦 Infraestrutura & Deploy

### Pré-requisitos

- Node.js >= 22
- Docker & Docker Compose

### Iniciando a Infraestrutura

```bash
npm run infra:up
```

Este comando inicia o stack enterprise:

- PostgreSQL 16 (Porta 5432)
- MongoDB (Porta 27017)
- Redis (Porta 6379)
- Traefik (Load Balancer & Dashboard)
- Prometheus & Grafana (Observabilidade)

### Deploy Local

Para rodar o app:

```bash
cd apps/web
npm install
npx prisma generate
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

---

## 📄 Documentação de API

A documentação completa das APIs em Português-BR está disponível em:
[docs/API.md](file:///C:/Projects/EcoData/docs/API.md)

---

## 🤝 Integração MCP

Utilizamos o Model Context Protocol para gerenciar extensões:

- **Firebase**: `mcp-firebase-server`
- **Notion**: `notion-mcp-server`
- **Cloud Run**: Gerenciamento de containers via GCP.

---

Desenvolvido com foco em Visual Excellence e Performance Premium. 🌿

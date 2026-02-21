# 📡 EcoData API — Documentação

> **Versão**: 0.1.0  
> **Base URL**: `http://localhost:3000/api`  
> **Autenticação**: JWT via cookie `session`

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Documentos](#documentos)
3. [Schemas](#schemas)
4. [Formulários](#formulários)
5. [Notificações](#notificações)
6. [Auditoria](#auditoria)
7. [Marketplace](#marketplace)
8. [Health Check](#health-check)

---

## 🔐 Autenticação

### `POST /api/auth/login`

Autenticar usuário com email e senha.

**Body** (JSON):

```json
{
  "email": "admin@ecodata.io",
  "password": "admin123"
}
```

**Resposta** `200`:

```json
{
  "success": true,
  "user": {
    "userId": "uuid",
    "email": "admin@ecodata.io",
    "name": "Administrador Soberano",
    "role": "security_admin"
  }
}
```

**Erros**: `400` campos faltando, `401` credenciais inválidas.

---

### `POST /api/auth/register`

Cadastrar novo usuário.

**Body** (JSON):

```json
{
  "email": "novo@ecodata.io",
  "password": "minhasenha123",
  "fullName": "Nome Completo",
  "role": "insured"
}
```

| Campo      | Tipo   | Obrigatório | Descrição                                                                  |
|------------|--------|-------------|----------------------------------------------------------------------------|
| `email`    | string | ✅           | Email único                                                                |
| `password` | string | ✅           | Mínimo 8 caracteres                                                        |
| `fullName` | string | ✅           | Nome do usuário                                                            |
| `role`     | enum   | ❌           | `insured`, `broker`, `doc_analyst`, `template_creator`, `validator`, `security_admin` |

**Resposta** `201`: Usuário criado com sucesso.  
**Erros**: `400` validação, `409` email já existe.

---

### `GET /api/auth/me`

Retorna sessão do usuário autenticado.

**Resposta** `200`:

```json
{
  "user": {
    "userId": "uuid",
    "email": "admin@ecodata.io",
    "name": "Administrador Soberano",
    "role": "security_admin"
  }
}
```

---

## 📄 Documentos

### `GET /api/documents`

Lista documentos do usuário autenticado.

| Parâmetro | Tipo   | Padrão | Descrição                                                     |
|-----------|--------|--------|---------------------------------------------------------------|
| `page`    | number | 1      | Página atual                                                  |
| `limit`   | number | 20     | Itens por página (máx. 50)                                    |
| `status`  | enum   | —      | `pending`, `processing`, `extracted`, `validated`, `rejected`, `archived` |

**Resposta** `200`:

```json
{
  "documents": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

### `POST /api/documents`

Upload de documento com extração OCR automática.

**Body** (`multipart/form-data`):

| Campo      | Tipo   | Obrigatório | Descrição              |
|------------|--------|-------------|------------------------|
| `file`     | File   | ✅           | Arquivo (PDF, imagem)  |
| `schemaId` | string | ❌           | UUID do schema destino |

**Resposta** `201`:

```json
{
  "success": true,
  "document": { "id": "uuid", "filename": "rg.pdf", "status": "extracted" },
  "extraction": { "rawText": "...", "structured": {...}, "confidence": 0.87 }
}
```

---

### `GET /api/documents/[id]`

Detalhes de um documento com histórico de extrações.

**Resposta** `200`: Documento completo com relações (uploadedBy, schema, extractions).

---

### `PATCH /api/documents/[id]`

Atualiza status ou metadados de um documento.

**Body** (JSON):

```json
{
  "status": "validated",
  "metadata": { "reviewNote": "Dados OK" }
}
```

---

## 🧩 Schemas

### `GET /api/schemas`

Lista schemas (contratos de dados).

| Parâmetro | Tipo   | Descrição                        |
|-----------|--------|----------------------------------|
| `status`  | enum   | `active`, `draft`, `deprecated`  |
| `search`  | string | Busca por nome ou slug           |

---

### `POST /api/schemas`

Cria novo schema.

**Body** (JSON):

```json
{
  "name": "CTPS Digital",
  "slug": "ctps-digital",
  "description": "Schema para CTPS",
  "fields": [
    { "id": "nome", "label": "Nome", "type": "text", "required": true },
    { "id": "pis", "label": "PIS/PASEP", "type": "text", "required": true }
  ]
}
```

---

### `GET /api/schemas/[id]`

Detalhes de um schema com histórico de versões.

---

### `PATCH /api/schemas/[id]`

Atualiza schema. Se os `fields` mudarem, uma `SchemaVersion` é criada automaticamente via trigger.

---

## 📝 Formulários

### `GET /api/forms`

Lista formulários do usuário.

| Parâmetro | Tipo   | Descrição                                  |
|-----------|--------|--------------------------------------------|
| `page`    | number | Página atual                               |
| `limit`   | number | Itens por página                           |
| `status`  | enum   | `draft`, `submitted`, `approved`, `rejected` |

---

### `POST /api/forms`

Cria novo formulário vinculado a um schema.

**Body** (JSON):

```json
{
  "title": "Apólice João Silva",
  "schemaId": "uuid-do-schema",
  "data": { "segurado_nome": "João Silva", "segurado_cpf": "123.456.789-00" }
}
```

---

### `GET /api/forms/[id]`

Detalhes de um formulário com schema e usuário.

---

### `PATCH /api/forms/[id]`

Atualiza dados ou status do formulário.

---

### `DELETE /api/forms/[id]`

Remove formulário. **Apenas formulários com status `draft`** podem ser excluídos.

---

## 🔔 Notificações

### `GET /api/notifications`

Lista notificações do usuário.

| Parâmetro    | Tipo    | Descrição            |
|--------------|---------|----------------------|
| `unreadOnly` | boolean | Apenas não lidas     |

**Resposta** inclui `unreadCount`.

---

### `PATCH /api/notifications`

Marca notificações como lidas.

**Body** (JSON):

```json
{ "ids": ["uuid1", "uuid2"] }
// ou
{ "markAllRead": true }
```

---

## 🔒 Auditoria

### `GET /api/audit`

> ⚠️ **Acesso restrito**: `security_admin` e `validator` apenas.

Lista trilha de auditoria completa.

| Parâmetro  | Tipo   | Descrição               |
|------------|--------|-------------------------|
| `page`     | number | Página atual            |
| `limit`    | number | Até 100 por página      |
| `action`   | enum   | Tipo de ação            |
| `resource` | string | Tipo de recurso         |
| `userId`   | string | UUID do usuário         |

**Ações possíveis**: `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `UPLOAD`, `EXTRACT`, `VALIDATE`, `APPROVE`, `REJECT`.

---

## 🛒 Marketplace

### `GET /api/marketplace`

Lista produtos ativos. **Não requer autenticação**.

| Parâmetro  | Tipo   | Descrição            |
|------------|--------|----------------------|
| `category` | string | Filtrar por categoria |

---

### `POST /api/marketplace`

Comprar produto do marketplace. **Requer autenticação**.

**Body** (JSON):

```json
{ "productId": "uuid-do-produto" }
```

---

## ❤️ Health Check

### `GET /api/health`

Verifica saúde dos serviços. **Não requer autenticação**.

**Resposta** `200` (saudável) ou `503` (degradado):

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2026-02-20T12:00:00Z",
  "uptime": 3600.5,
  "checks": {
    "postgres": { "status": "healthy", "latency": 12 },
    "redis": { "status": "healthy", "latency": 5 }
  }
}
```

---

## 🏗️ Códigos de Status HTTP

| Código | Significado                           |
|--------|---------------------------------------|
| `200`  | Sucesso                               |
| `201`  | Recurso criado                        |
| `400`  | Requisição inválida / validação falhou|
| `401`  | Não autenticado                       |
| `403`  | Permissão negada                      |
| `404`  | Recurso não encontrado                |
| `409`  | Conflito (duplicidade)                |
| `500`  | Erro interno do servidor              |
| `503`  | Serviço indisponível                  |

---

## 🔑 Roles do Sistema

| Role               | Descrição                                     |
|--------------------|-----------------------------------------------|
| `insured`          | Segurado — acesso básico                      |
| `broker`           | Corretor — gestão de clientes e apólices      |
| `doc_analyst`      | Analista de Docs — extração e validação       |
| `template_creator` | Criador de Templates — gestão de schemas      |
| `validator`        | Validador — aprovação e auditoria             |
| `security_admin`   | Admin de Segurança — acesso total             |

---

*Documentação gerada automaticamente pelo EcoData Platform v0.1.0*

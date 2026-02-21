---
description: How to deploy EcoData to Cloud Run
---

# Deploy EcoData para Google Cloud Run

## Pré-requisitos

1. Ter o `gcloud` CLI instalado e autenticado
2. Ter um projeto GCP com billing ativo
3. Ter as variáveis de ambiente configuradas

## Passos

// turbo-all

1. Autenticar no GCP:

```bash
gcloud auth login
```

1. Configurar o projeto:

```bash
gcloud config set project ecodata-prod
```

1. Habilitar APIs necessárias:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

1. Build e deploy via Cloud Build:

```bash
cd apps/web
gcloud run deploy ecodata-web --source . --region southamerica-east1 --allow-unauthenticated --set-env-vars="NODE_ENV=production"
```

1. Verificar o deploy:

```bash
gcloud run services describe ecodata-web --region southamerica-east1 --format="value(status.url)"
```

## Variáveis de Ambiente no Cloud Run

Configure via console ou CLI:

```bash
gcloud run services update ecodata-web \
  --region southamerica-east1 \
  --set-env-vars="DATABASE_URL=postgresql://...,AUTH_SECRET=...,OPENAI_API_KEY=...,REDIS_URL=..."
```

## Rollback

```bash
gcloud run services update-traffic ecodata-web --region southamerica-east1 --to-revisions=PREVIOUS_REVISION=100
```

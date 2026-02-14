# EcoData Enterprise Platform

**EcoData** is a high-performance, event-driven data management platform designed for the insurance sector.

## Architecture

- **Event-Driven**: Uses Redis Streams/RabbitMQ for async ingestion.
- **Microservices-Ready**: Modular Monorepo structure.
- **Polyglot Persistence**:
  - **PostgreSQL**: Relational data (Users, Auth).
  - **MongoDB**: Unstructured data (JSON Structures, Logs).
  - **Redis**: Caching & Queues.

## Getting Started

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose

### Infrastructure (Phase 0)
Start the enterprise stack:
```bash
npm run infra:up
```

This will spin up:
- Postgres (Port 5432)
- MongoDB (Port 27017)
- Redis (Port 6379)
- Traefik (Port 80/8080)
- Prometheus (Port 9090)
- Grafana (Port 3000)

## Project Structure
- `apps/`: Deployable applications (Backend API, Frontend).
- `packages/`: Shared libraries (Types, Utils, Configs).
- `infra/`: Infrastructure configuration (Docker, K8s, Prometheus).

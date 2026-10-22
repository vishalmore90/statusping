# StatusPing

High-performance, open-source synthetic uptime monitoring and public status page platform. Self-host with Docker Compose or deploy across modern cloud infrastructure.

[![Backend CI](https://github.com/vishalmore90/statusping/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/vishalmore90/statusping/actions)
[![Frontend CI](https://github.com/vishalmore90/statusping/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/vishalmore90/statusping/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-blue.svg)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org)
[![Live Demo](https://img.shields.io/badge/Production-Live%20Demo-10b981.svg)](https://statusping-rho.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Live Production Deployment](#live-production-deployment)
- [Core Capabilities](#core-capabilities)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Quickstart with Docker Compose](#quickstart-with-docker-compose)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [API Reference](#api-reference)
- [Security and Hardening](#security-and-hardening)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Production Deployment](#production-deployment)
- [Author and License](#author-and-license)

---

## Overview

StatusPing delivers enterprise-grade synthetic health monitoring and public incident communication without recurring third-party SaaS fees. It enables engineering teams to execute high-frequency HTTP and TCP probes, track 90-day daily uptime history, visualize latency telemetry, orchestrate incident lifecycles, and publish server-rendered public status pages with automatic edge revalidation.

---

## Live Production Deployment

StatusPing is continuously deployed across production cloud infrastructure:

| Service | Provider | Production URL | Status |
|---|---|---|---|
| Frontend Web App | Vercel | [https://statusping-rho.vercel.app](https://statusping-rho.vercel.app) | Operational |
| Backend REST API | Render | [https://statusping-7ozn.onrender.com](https://statusping-7ozn.onrender.com) | Operational |
| Health Check (Liveness) | Render | [https://statusping-7ozn.onrender.com/health](https://statusping-7ozn.onrender.com/health) | Operational |
| Health Check (Readiness) | Render | [https://statusping-7ozn.onrender.com/health/ready](https://statusping-7ozn.onrender.com/health/ready) | Operational |
| Interactive API Docs | Render | [https://statusping-7ozn.onrender.com/docs](https://statusping-7ozn.onrender.com/docs) | Operational |
| Primary Database | Supabase | PostgreSQL 17 (Session Pooler Port 5432) | Operational |

For infrastructure runbooks, DNS configuration, and zero-downtime rollback procedures, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Core Capabilities

- **Synthetic Probes**: HTTP(S) and TCP health checks with configurable cadence (30s to 300s), custom timeout thresholds, and HTTP status code assertions.
- **90-Day Uptime Telemetry**: Interactive daily uptime bars with precise calendar date tooltips, historical SLA calculations, and responsive mobile flex-scaling.
- **Latency Analytics**: 50-probe rolling telemetry visualization with min, average, max, and p95 latency indicators.
- **Incident State Machine**: Automated incident creation on downtime with structured progress lifecycles (`investigating` -> `identified` -> `monitoring` -> `resolved`) and one-click resolution.
- **Asynchronous Alerting**: Background email notifications dispatched via async SMTP (`aiosmtplib`) on downtime and service recovery.
- **Public Status Pages**: Server-Side Rendered (SSR) status pages at `/status/<slug>` with dynamic OpenGraph metadata, 30-second edge cache revalidation, and live background polling.
- **Hardened Authentication**: Multi-tenant data isolation, bcrypt password hashing, JWT bearer tokens, and IP-based rate limiting on authentication routes (15 req/min login, 10 req/min register).
- **Responsive Interface**: Obsidian Charcoal (`#0a0d12`) and High-Tech Emerald (`#10b981`) aesthetic, mobile navigation drawer, and strict grid alignment with zero purple gradients or pill buttons.

---

## System Architecture

```
                  +----------------------------------------+
                  |         Client Web Browsers            |
                  +-------------------+--------------------+
                                      |
            +-------------------------+-------------------------+
            | (HTTPS)                                           | (HTTPS / CORS)
            v                                                   v
+───────────────────────+                           +───────────────────────+
|  Public Status Pages  |                           | Management Dashboard  |
|  (/status/<slug>)     |                           | (/dashboard/*)        |
|  Next.js 16 (SSR)     |                           | Next.js 16 (React 19) |
+───────────+───────────+                           +───────────+───────────+
            |                                                   |
            +-------------------------+-------------------------+
                                      |
                                      v
                        +───────────────────────────+
                        |      FastAPI Backend      |
                        |      (Render / Port 8000) |
                        +─────────────+─────────────+
                                      |
        +─────────────────────────────+─────────────────────────────+
        |                             |                             |
        v                             v                             v
+──────────────────+        +──────────────────+        +──────────────────+
|  JWT Auth & User |        |   APScheduler    |        |   Incidents &    |
|  Rate Limiting   |        |   Async Engine   |        |   Notifications  |
+────────┬─────────+        +────────┬─────────+        +────────┬─────────+
         |                           |                           |
         |                           v                           |
         |                 +───────────────────+                 |
         |                 | Synthetic Probes  |                 |
         |                 | (HTTP / TCP)      |                 |
         |                 +───────────────────+                 |
         |                                                       |
         +───────────────────────────+───────────────────────────+
                                     |
                                     | (postgresql+asyncpg://)
                                     | (Session Pooler Port 5432)
                                     v
                        +───────────────────────────+
                        |       PostgreSQL 17       |
                        |    (Supabase / Local 16)  |
                        +───────────────────────────+
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11+, FastAPI 0.115, Pydantic v2, SQLAlchemy 2.0 (Async), Asyncpg, Alembic, APScheduler 3.10 |
| **Frontend** | Next.js 16 (Turbopack, App Router), React 19, TypeScript 5, Lucide Icons, Recharts |
| **Database** | PostgreSQL 17 (Supabase Session Pooler) / PostgreSQL 16 Alpine (Docker) |
| **Security** | HTTP Security Headers, Passlib (Bcrypt), Python-Jose (JWT), In-Memory Rate Limiting |
| **Alerting** | Async SMTP (`aiosmtplib`), HTML notification templates |
| **Testing** | Pytest, Pytest-Asyncio, Pytest-Cov, Ruff, Mypy, ESLint, TypeScript Compiler |
| **Infrastructure**| Docker, Docker Compose, Vercel Edge Network, Render Web Services |

---

## Quickstart with Docker Compose

Run the entire production stack (PostgreSQL + FastAPI Backend + Next.js Frontend) locally with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/vishalmore90/statusping.git
cd statusping

# Build and start all services in detached mode
docker compose up -d --build
```

Verify service endpoints:

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Demo Status Page**: [http://localhost:3000/status/demo](http://localhost:3000/status/demo)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Liveness Probe**: [http://localhost:8000/health](http://localhost:8000/health)
- **Readiness Probe**: [http://localhost:8000/health/ready](http://localhost:8000/health/ready)

View container logs:
```bash
docker compose logs -f
```

Stop and remove containers:
```bash
docker compose down
```

---

## Local Development Setup

### Prerequisites

- **Python**: Version 3.11 or higher
- **Node.js**: Version 20 LTS or higher
- **PostgreSQL**: Version 15 or higher (or run via Docker)

---

### Backend Setup

1. Navigate to the backend directory and initialize a virtual environment:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Linux / macOS
# or: .venv\Scripts\activate    # Windows
```

2. Install dependencies with development tools:
```bash
pip install -e ".[dev]"
```

3. Configure local environment variables:
```bash
cp .env.example .env
```

4. Apply database migrations:
```bash
alembic upgrade head
```

5. Launch the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```

---

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure local environment variables:
```bash
cp .env.local.example .env.local
```

4. Launch the Next.js development server:
```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## Environment Configuration

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:postgres@localhost:5432/statusping` |
| `JWT_SECRET_KEY` | Secret key used for signing JWT tokens | `change-me-in-production` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_HOURS` | Token expiration lifespan | `24` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:3000` |
| `FRONTEND_URL` | Base application URL for email links | `http://localhost:3000` |
| `APP_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `SMTP_HOST` | Outgoing SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | Outgoing SMTP port | `587` |
| `SMTP_USERNAME` | SMTP authentication username | *(empty)* |
| `SMTP_PASSWORD` | SMTP authentication password | *(empty)* |
| `EMAIL_FROM` | Outgoing sender email address | `noreply@statusping.dev` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Browser-accessible backend API endpoint | `http://localhost:8000` |
| `INTERNAL_API_URL` | Internal backend endpoint for Docker SSR | `http://backend:8000` |

---

## API Reference

Interactive OpenAPI documentation is available at `/docs` on the backend host:

| Method | Endpoint | Description | Auth Required | Rate Limit |
|---|---|---|---|---|
| `GET` | `/health` / `/health/live` | Process liveness probe (immediate 200) | No | None |
| `GET` | `/health/ready` | Database readiness probe (2.0s timeout) | No | None |
| `POST` | `/api/v1/auth/register` | Create account and issue JWT token | No | 10 req/min |
| `POST` | `/api/v1/auth/login` | Authenticate credentials and issue JWT | No | 15 req/min |
| `GET` | `/api/v1/auth/me` | Fetch profile for current authenticated user | Yes | None |
| `GET` | `/api/v1/monitors` | List monitors owned by user | Yes | None |
| `POST` | `/api/v1/monitors` | Create a new HTTP or TCP synthetic monitor | Yes | None |
| `GET` | `/api/v1/monitors/{id}` | Retrieve monitor details and settings | Yes | None |
| `PATCH` | `/api/v1/monitors/{id}` | Update monitor configuration or pause probe | Yes | None |
| `DELETE` | `/api/v1/monitors/{id}` | Delete monitor and cascade check history | Yes | None |
| `GET` | `/api/v1/monitors/{id}/checks` | Cursor-paginated probe check history | Yes | None |
| `GET` | `/api/v1/monitors/{id}/stats` | Aggregate uptime percentages (24h, 7d, 30d, 90d) | Yes | None |
| `GET` | `/api/v1/incidents` | List user incidents with status filters | Yes | None |
| `POST` | `/api/v1/incidents` | Create a new manual incident | Yes | None |
| `POST` | `/api/v1/incidents/{id}/updates` | Post an incident update note | Yes | None |
| `POST` | `/api/v1/incidents/{id}/resolve` | One-click resolve an active incident | Yes | None |
| `GET` | `/api/v1/status-pages` | List user public status pages | Yes | None |
| `POST` | `/api/v1/status-pages` | Create or configure a public status page | Yes | None |
| `GET` | `/api/v1/public/status/{slug}` | Public status page payload (cached 30s) | No | None |

---

## Security and Hardening

- **SSRF (Server-Side Request Forgery) Mitigation**:
  - Schema-level target validation (`validate_http_url` and `validate_tcp_target`) rejecting non-HTTP/TCP schemes.
  - Pre-flight DNS resolution and IP classification (`is_prohibited_ip`) blocking loopback (`127.0.0.0/8`, `::1`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), cloud metadata services (`169.254.169.254`), link-local (`fe80::/10`), unique local (`fc00::/7`), and prohibited hostnames (`localhost`, `metadata.google.internal`).
  - Safe iterative redirect inspection (max 5 hops) checking every intermediate `Location` header before connecting.
- **HTTP Security Headers**: Enforced via FastAPI middleware:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Rate Limiting**: In-memory IP-based sliding window middleware on `/api/v1/auth/login` (15 requests/minute) and `/api/v1/auth/register` (10 requests/minute) returning HTTP 429 with `Retry-After: 60`.
- **Tenant Isolation**: Strict database ownership filters across monitors, incidents, check history, and status pages preventing cross-tenant data leakage or tampering.
- **Credential Storage**: Passwords hashed with bcrypt; JWT signatures validated using HMAC-SHA256 with robust `sub` claim type verification.

---

## Testing and Quality Assurance

### Backend Test Suite

StatusPing includes a comprehensive automated test suite (135 tests covering SSRF protection, JWT verification, multi-tenant isolation, check execution, health probes, and incident workflows):

```bash
cd backend
pytest -v --cov=app --cov-report=term-missing
```

Run code formatting and static type checks:

```bash
cd backend
ruff check .
ruff format --check .
mypy app
```

### Frontend Validation

Execute Jest unit and component test suites (covering auth tokens, Badge, StatusIndicator, and UptimeBar components):

```bash
cd frontend
npm test
```

Validate TypeScript types, ESLint rules, and Turbopack production builds:

```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

---

## Production Deployment

StatusPing is architected for zero-downtime multi-cloud deployment:

- **Frontend**: Deployed to [Vercel](https://vercel.com) using Next.js 16 on the Global Edge Network.
- **Backend**: Deployed to [Render](https://render.com) as a containerized web service with automated Alembic migrations on boot.
- **Database**: Hosted on [Supabase](https://supabase.com) using PostgreSQL 17 accessed via IPv4 Session Pooler (`port 5432`).

For complete configuration steps, environment mappings, and operational runbooks, refer to [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Author and License

- **Author**: [Vishal More](https://github.com/vishalmore90)
- **License**: Released under the [MIT License](LICENSE).

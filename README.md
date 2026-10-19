# StatusPing ⚡

> Modern, open-source synthetic uptime monitoring and public status page platform | self-host with Docker or deploy to the cloud in minutes.

[![Backend CI](https://github.com/vishalmore90/statusping/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/vishalmore90/statusping/actions)
[![Frontend CI](https://github.com/vishalmore90/statusping/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/vishalmore90/statusping/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-blue.svg)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org)
[![Live Demo](https://img.shields.io/badge/Production-Live%20Demo-10b981.svg)](https://statusping-rho.vercel.app)

---

## 🌐 Live Production Deployment

StatusPing is fully deployed and publicly accessible in production:

| Service | Platform | Live URL | Status |
|---|---|---|---|
| **Web Application** | Vercel | [https://statusping-rho.vercel.app](https://statusping-rho.vercel.app) | Online |
| **Backend API** | Render | [https://statusping-7ozn.onrender.com](https://statusping-7ozn.onrender.com) | Online |
| **API Health Check** | Render | [https://statusping-7ozn.onrender.com/health](https://statusping-7ozn.onrender.com/health) | Online |
| **Interactive API Docs** | Render | [https://statusping-7ozn.onrender.com/docs](https://statusping-7ozn.onrender.com/docs) | Online |
| **Production Database** | Supabase | PostgreSQL 17 (Session Pooler) | Active |

For complete deployment runbooks, zero-downtime procedures, and rollback documentation, refer to [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🌟 What is StatusPing?

StatusPing provides indie developers, SaaS founders, and engineering teams with enterprise-grade synthetic monitoring without recurring $29 to $99/month fees. Configure HTTP and TCP health probes, track 90-day latency trends, manage incident response workflows, and publish beautiful public status pages with automatic 30-second edge cache revalidation.

---

## ✨ Features

- 🔍 **Synthetic Probes**: HTTP(S) and TCP health checks with configurable intervals (30s to 300s), response timeouts, and custom expected HTTP status codes.
- 📊 **90-Day Interactive Uptime Bars**: Daily uptime visualization with hover tooltips displaying calendar dates and exact uptime percentages.
- 📈 **Latency Telemetry**: 50-check rolling response time charts with minimum, average, maximum, and p95 latency indicators.
- 📣 **Automated Incident Management**: Multi-state incident timelines (`investigating` → `identified` → `monitoring` → `resolved`) with instant one-click resolution.
- 📬 **Email Alerts**: Automatic downtime and recovery notifications via async SMTP (`aiosmtplib`).
- 🌐 **Public Status Pages**: Server-Side Rendered (SSR) status pages at `/status/<slug>` featuring dynamic SEO metadata, 30s edge caching, and live background revalidation.
- 🛡️ **Hardened Security & Rate Limiting**: Production security headers (nosniff, DENY, XSS-Protection, HSTS, CSP), multi-tenant user isolation, bcrypt password hashing, JWT bearer tokens, and IP rate limiting on authentication routes (15 req/min login, 10 req/min register).
- 📜 **Legal & Compliance Pages**: Built-in Privacy Policy (`/privacy`) and Terms of Service (`/terms`) pages.
- 🎨 **Strict 2-Color Design System**: Clean, high-contrast Obsidian Charcoal (`#0a0d12`) and High-Tech Emerald (`#10b981`) UI layout aligned to an 8-column grid with zero pill buttons or purple gradients.
- 🐳 **Production Ready**: Multi-stage Dockerfiles, Docker Compose stack with PostgreSQL 16 health checks, Render web service config, and Vercel edge deployment.

---

## 🏗️ Architecture

```
                  ┌────────────────────────────────────────┐
                  │          End Users & Browsers          │
                  └───────────────────┬────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
            ▼                                                   ▼
┌───────────────────────┐                           ┌───────────────────────┐
│  Public Status Page   │                           │ Management Dashboard  │
│  (/status/<slug>)     │                           │ (/dashboard/*)        │
│  Next.js 16 (SSR)     │                           │ Next.js 16 (React 19) │
└───────────┬───────────┘                           └───────────┬───────────┘
            │                                                   │
            │   HTTP (Internal / External API Requests)         │
            └─────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │     FastAPI Backend       │
                        │     (Port 8000)           │
                        └─────────────┬─────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Auth & JWT     │        │   APScheduler    │        │  Incidents &     │
│   Service        │        │   Async Engine   │        │  Notifications   │
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         │                           ▼                           │
         │                 ┌───────────────────┐                 │
         │                 │ Synthetic Probes  │                 │
         │                 │ (HTTP / TCP)      │                 │
         │                 └───────────────────┘                 │
         │                                                       │
         └───────────────────────────┬───────────────────────────┘
                                     │
                                     ▼
                        ┌───────────────────────────┐
                        │       PostgreSQL 16       │
                        │    (SQLAlchemy + asyncpg) │
                        └───────────────────────────┘
```

---

## 🚀 Quickstart with Docker Compose

Run the entire production stack (PostgreSQL + FastAPI Backend + Next.js Frontend) with a single command:

```bash
# Clone the repository
git clone https://github.com/vishalmore90/statusping.git
cd statusping

# Launch with Docker Compose
docker compose up -d --build
```

Access the services:
- **Web Application & Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Demo Public Status Page**: [http://localhost:3000/status/demo](http://localhost:3000/status/demo)
- **FastAPI Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

To view live container logs:
```bash
docker compose logs -f
```

To stop all services:
```bash
docker compose down
```

---

## 💻 Manual Local Development

### 1. Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ running locally (or via Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=statusping postgres:16-alpine`)

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate       # On Linux/macOS
# or: .venv\Scripts\activate    # On Windows

# Install package with development dependencies
pip install -e ".[dev]"

# Configure environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

Run backend tests:
```bash
pytest -v
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Start Next.js development server
npm run dev
```

Run frontend linting & production build validation:
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:postgres@localhost:5432/statusping` |
| `JWT_SECRET_KEY` | Secret key used for signing JWT tokens | `change-me-in-production` |
| `JWT_ALGORITHM` | Algorithm for JWT encoding | `HS256` |
| `JWT_EXPIRE_HOURS` | Access token lifespan in hours | `24` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:3000` |
| `FRONTEND_URL` | URL used in alert emails | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server host for email alerts | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USERNAME` | SMTP authentication username | *(empty)* |
| `SMTP_PASSWORD` | SMTP authentication password | *(empty)* |
| `EMAIL_FROM` | Sender address for alert emails | `noreply@statusping.dev` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API endpoint accessed by the browser | `http://localhost:8000` |
| `INTERNAL_API_URL` | Internal backend endpoint for SSR (Docker) | `http://backend:8000` |

---

## 📡 API Overview

FastAPI provides automatic interactive Swagger documentation at `https://statusping-7ozn.onrender.com/docs` (or locally at `http://localhost:8000/docs`):

| Method | Endpoint | Description | Auth Required | Rate Limit |
|---|---|---|---|---|
| `GET` | `/health` | Container and database health check | No | None |
| `POST` | `/api/v1/auth/register` | Register new account and receive JWT | No | 10 req/min |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password | No | 15 req/min |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes | None |
| `GET` | `/api/v1/monitors` | List monitors owned by current user | Yes | None |
| `POST` | `/api/v1/monitors` | Create new HTTP or TCP monitor | Yes | None |
| `GET` | `/api/v1/monitors/{id}` | Fetch monitor details and configuration | Yes | None |
| `PATCH` | `/api/v1/monitors/{id}` | Update monitor configuration / pause probe | Yes | None |
| `DELETE` | `/api/v1/monitors/{id}` | Delete monitor and cascade check history | Yes | None |
| `GET` | `/api/v1/monitors/{id}/checks` | Cursor-paginated check history & latency | Yes | None |
| `GET` | `/api/v1/monitors/{id}/stats` | Uptime percentages (24h, 7d, 30d, 90d) | Yes | None |
| `GET` | `/api/v1/incidents` | List user incidents with filters | Yes | None |
| `POST` | `/api/v1/incidents` | Create new incident with initial update | Yes | None |
| `POST` | `/api/v1/incidents/{id}/updates` | Post status update (`identified`, etc.) | Yes | None |
| `POST` | `/api/v1/incidents/{id}/resolve` | One-click resolve incident | Yes | None |
| `GET` | `/api/v1/public/status/{slug}` | Public status page payload (cached 30s) | No | None |

---

## ☁️ Cloud Deployment

StatusPing is production-ready for multi-cloud deployment:

- **Frontend**: [Vercel](https://vercel.com) (Next.js 16 App Router on Global Edge Network)
- **Backend**: [Render](https://render.com) (FastAPI Docker Web Service)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL 17 with IPv4 Session Pooler)

For comprehensive setup steps, environment variable specifications, IPv4 session pooler configuration, and rollback procedures, see the [Production Deployment Guide](DEPLOYMENT.md).

### Quick Cloud Setup Summary

1. **Database (Supabase)**:
   - Create a project on Supabase.
   - Obtain the connection string using the **Session Pooler** (Port 5432, IPv4 compatible).
   - Format: `postgresql+asyncpg://postgres.<ref>:<password>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?ssl=require`

2. **Backend (Render)**:
   - Create a new **Web Service** on Render connected to this repository (`backend/` root).
   - Environment variables: `DATABASE_URL`, `JWT_SECRET_KEY`, `APP_ENV=production`, `FRONTEND_URL`, `ALLOWED_ORIGINS`.
   - Health check path: `/health`.

3. **Frontend (Vercel)**:
   - Import the repository on Vercel with **Root Directory** set to `frontend`.
   - Environment variable: `NEXT_PUBLIC_API_URL=https://<your-render-backend-url>`.
   - Deploy. Vercel automatically builds and optimizes the Next.js 16 application.

---

## 🧪 Testing

### Backend Test Suite
```bash
cd backend
pytest -v --cov=app --cov-report=term-missing
```

### Frontend Typecheck & Build
```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

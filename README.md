# StatusPing ⚡

> Modern, open-source synthetic uptime monitoring and public status page platform — self-host with Docker or deploy to the cloud in minutes.

[![Backend CI](https://github.com/vishalmore90/statusping/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/vishalmore90/statusping/actions)
[![Frontend CI](https://github.com/vishalmore90/statusping/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/vishalmore90/statusping/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-blue.svg)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org)

---

## 🌟 What is StatusPing?

StatusPing provides indie developers, SaaS founders, and engineering teams with enterprise-grade synthetic monitoring without recurring $29–$99/month fees. Configure HTTP and TCP health probes, track 90-day latency trends, manage incident response workflows, and publish beautiful public status pages with automatic 30-second edge cache revalidation.

---

## ✨ Features

- 🔍 **Synthetic Probes**: HTTP(S) and TCP health checks with configurable intervals (30s–300s), response timeouts, and custom expected HTTP status codes.
- 📊 **90-Day Interactive Uptime Bars**: Daily uptime visualization with hover tooltips displaying calendar dates and exact uptime percentages.
- 📈 **Latency Telemetry**: 50-check rolling response time charts with minimum, average, maximum, and p95 latency indicators.
- 📣 **Automated Incident Management**: Multi-state incident timelines (`investigating` → `identified` → `monitoring` → `resolved`) with instant one-click resolution.
- 📬 **Email Alerts**: Automatic downtime and recovery notifications via async SMTP (`aiosmtplib`).
- 🌐 **Public Status Pages**: Server-Side Rendered (SSR) status pages at `/status/<slug>` featuring dynamic SEO metadata, 30s edge caching, and live background revalidation.
- 🔐 **Multi-Tenant Security**: User isolation, bcrypt password hashing, and JWT bearer authentication.
- 🐳 **Production Ready**: Multi-stage Dockerfiles, Docker Compose stack with PostgreSQL 16 health checks, and Railway/Vercel deployment configs.

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

FastAPI provides automatic interactive Swagger documentation at `http://localhost:8000/docs`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Container and database health check | No |
| `POST` | `/api/v1/auth/register` | Register new account and receive JWT | No |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/v1/monitors` | List monitors owned by current user | Yes |
| `POST` | `/api/v1/monitors` | Create new HTTP or TCP monitor | Yes |
| `GET` | `/api/v1/monitors/{id}` | Fetch monitor details and configuration | Yes |
| `PATCH` | `/api/v1/monitors/{id}` | Update monitor configuration / pause probe | Yes |
| `DELETE` | `/api/v1/monitors/{id}` | Delete monitor and cascade check history | Yes |
| `GET` | `/api/v1/monitors/{id}/checks` | Cursor-paginated check history & latency | Yes |
| `GET` | `/api/v1/monitors/{id}/stats` | Uptime percentages (24h, 7d, 30d, 90d) | Yes |
| `GET` | `/api/v1/incidents` | List user incidents with filters | Yes |
| `POST` | `/api/v1/incidents` | Create new incident with initial update | Yes |
| `POST` | `/api/v1/incidents/{id}/updates` | Post status update (`identified`, etc.) | Yes |
| `POST` | `/api/v1/incidents/{id}/resolve` | One-click resolve incident | Yes |
| `GET` | `/api/v1/public/status/{slug}` | Public status page payload (cached 30s) | No |

---

## ☁️ Cloud Deployment

### Backend on Railway

1. Create a new project in [Railway](https://railway.app).
2. Provision a **PostgreSQL** database.
3. Deploy the backend from the `backend/` folder using the included [`railway.json`](backend/railway.json) and [`Dockerfile`](backend/Dockerfile).
4. Add environment variables in the Railway dashboard:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (ensure `postgresql+asyncpg://` protocol prefix).
   - `JWT_SECRET_KEY`: Generate a random 64-character secret.
   - `ALLOWED_ORIGINS`: Set to your production Vercel frontend URL.
5. Railway automatically runs `alembic upgrade head` on startup before launching Uvicorn.

### Frontend on Vercel

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Add the environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend production URL (e.g. `https://statusping-api.up.railway.app`).
4. Deploy. Vercel automatically builds and optimizes the Next.js 16 application.

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

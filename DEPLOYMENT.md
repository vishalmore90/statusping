# StatusPing Production Deployment Guide

## 1. Architecture Overview

StatusPing is deployed across three modern cloud platforms designed for scalability, zero-maintenance database operations, and high-performance edge delivery:

```
                      +-----------------------------+
                      |   End User Browser / Client |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               | (HTTPS)                                   | (HTTPS)
               v                                           v
+-------------------------------+             +-------------------------------+
|      Frontend (Vercel)        |             |     Backend (Render)          |
|  Next.js 16 (React 19)        |             |  FastAPI + Uvicorn            |
|  https://statusping-rho.      |             |  https://statusping-7ozn.     |
|  vercel.app                   |             |  onrender.com                 |
+--------------+----------------+             +---------------+---------------+
               | (Browser REST API / CORS)                     |
               +-----------------------------------------------+
                                                               | (postgresql+asyncpg://)
                                                               | (Session Pooler Port 5432)
                                                               v
                                              +-------------------------------+
                                              |     Database (Supabase)       |
                                              |  PostgreSQL 17 (PgBouncer)    |
                                              |  Region: ap-northeast-2       |
                                              |  Project: statusping-db       |
                                              +-------------------------------+
```

---

## 2. Infrastructure & Live Endpoints

| Component | Platform | Region / Host | Live Endpoint |
|---|---|---|---|
| **Frontend Application** | Vercel | Global Edge Network | [https://statusping-rho.vercel.app](https://statusping-rho.vercel.app) |
| **Backend API Service** | Render | Oregon, USA | [https://statusping-7ozn.onrender.com](https://statusping-7ozn.onrender.com) |
| **Backend Health Check** | Render | Oregon, USA | [https://statusping-7ozn.onrender.com/health](https://statusping-7ozn.onrender.com/health) |
| **Interactive API Docs** | Render | Oregon, USA | [https://statusping-7ozn.onrender.com/docs](https://statusping-7ozn.onrender.com/docs) |
| **Production PostgreSQL** | Supabase | Seoul (`ap-northeast-2`) | `aws-0-ap-northeast-2.pooler.supabase.com:5432` |

---

## 3. Environment Variable Configuration

### Backend (Render Web Service)
Environment variables are securely stored in Render's dashboard under **Environment**:

| Variable Name | Required | Description / Example |
|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql+asyncpg://postgres.<ref>:<password>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?ssl=require` |
| `JWT_SECRET_KEY` | **Yes** | 64-character cryptographically random secret key |
| `APP_ENV` | **Yes** | `production` |
| `FRONTEND_URL` | **Yes** | `https://statusping-rho.vercel.app` |
| `ALLOWED_ORIGINS` | **Yes** | `https://statusping-rho.vercel.app,https://statusping-3t5e2gwpw-vishalmore2957-2696.vercel.app` |
| `SMTP_HOST` | Optional | SMTP mailer host (e.g. `smtp.resend.com` or `smtp.gmail.com`) |
| `SMTP_PORT` | Optional | `587` |
| `SMTP_USERNAME` | Optional | SMTP username / API key |
| `SMTP_PASSWORD` | Optional | SMTP password / API token |
| `EMAIL_FROM` | Optional | Sender address (e.g. `alerts@statusping.dev`) |

### Frontend (Vercel Project)
Environment variables configured in Vercel under **Settings > Environment Variables**:

| Variable Name | Environment | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Production & Preview | `https://statusping-7ozn.onrender.com` |

---

## 4. Database Schema & Migration Execution

Database migrations are managed through Alembic with asynchronous PostgreSQL driver support (`asyncpg`).

### Executed Migrations
- `001_initial_schema`: Created `users`, `status_pages`, `monitors`, `check_results`, `incidents`, `incident_updates`.
- `002_incident_monitor_id`: Added monitor foreign key linkage to incidents.

### Running Migrations Manually
```bash
cd backend
alembic upgrade head
```

---

## 5. Technical Challenges & Architectural Resolutions

### 1. IPv6 vs IPv4 Cloud Resolution
- **Challenge:** Supabase direct database connection `db.<ref>.supabase.co` resolves to an IPv6 address only. Render containerized web services communicate over IPv4 outbound networking, which caused direct DNS resolution failure (`gaierror: [Errno -2] Name or service not known`).
- **Resolution:** StatusPing connects through the Supabase Session Pooler (`aws-0-ap-northeast-2.pooler.supabase.com:5432`), which provides IPv4 A records and supports persistent cloud pool connections.

### 2. asyncpg SSL Parameter Handling
- **Challenge:** Standard PostgreSQL connection URLs frequently specify `sslmode=require`. In Python `asyncpg`, passing `sslmode` results in `TypeError: connect() got an unexpected keyword argument 'sslmode'`.
- **Resolution:** Added automatic URL normalization in `backend/app/config.py` to rewrite `sslmode=` to `ssl=`.

### 3. Event Loop Safety & AsyncIOScheduler
- **Challenge:** APScheduler's `BackgroundScheduler` is thread-based and invoked coroutines via `asyncio.run()`, spawning secondary event loops. Because SQLAlchemy's default `QueuePool` binds database connections to the event loop on which they were created, cross-thread invocations caused `RuntimeError: Task got Future attached to a different loop` and corrupted the connection pool.
- **Resolution:** 
  1. Migrated the scheduler to `apscheduler.schedulers.asyncio.AsyncIOScheduler`, which executes natively inside FastAPI's active Uvicorn event loop.
  2. Configured SQLAlchemy engine with `poolclass=NullPool`, perfectly suited for cloud PgBouncer session pooling.

### 4. Continuous Monitoring on Free Tier
- **Operational Note:** Render free tier instances spin down after 15 minutes of HTTP inactivity. When spun down, APScheduler background jobs pause until the next HTTP request wakes the instance.
- **Recommendation:** For continuous 24/7 background uptime checks, either upgrade Render to the Starter tier ($7/month) or configure an external HTTP monitor (e.g., UptimeRobot) to ping `https://statusping-7ozn.onrender.com/health` every 10 minutes.

---

## 6. Verification & E2E Testing Evidence

An automated end-to-end acceptance script (`scratch/e2e_test.py`) was executed against the live production environment. All operations completed successfully:

```
1. Health Endpoint: HTTP 200 {"status":"ok"}
2. User Registration: HTTP 201 Created (User persisted in Supabase)
3. User Login: HTTP 200 OK (JWT Access Token issued)
4. Authenticated /me: HTTP 200 OK
5. Monitor Creation: HTTP 201 Created (Target: https://httpbin.org/status/200, 60s interval)
6. Monitor Listing: HTTP 200 OK (1 active monitor)
7. Background Check Execution: APScheduler completed check in background after 45s
8. Check Result Record: HTTP 200 OK, latency=243ms, status=up
9. Uptime Statistics: HTTP 200 OK, 24h uptime=100.0%
10. Status Page Creation: HTTP 201 Created
11. Public Status Page: HTTP 200 OK, Overall=operational, 1 monitor displayed
```

---

## 7. Operational Runbook

### Viewing Application Logs
- **Backend Logs:** Render Dashboard > `statusping` > **Logs** tab.
- **Frontend Logs:** Vercel Dashboard > `statusping` > **Deployments** > Select deployment > **Logs**.

### Triggering Deployments
- Pushes to the `main` branch trigger continuous deployment pipelines on both Vercel and Render.
- To trigger a manual redeploy on Render:
  1. Open [Render Dashboard](https://dashboard.render.com).
  2. Select `statusping`.
  3. Click **Manual Deploy** > **Deploy latest commit**.

### Rollback Strategy
- **Frontend (Vercel):** Navigate to **Deployments** in Vercel, select previous successful deployment, click the three dots, and select **Assign Domain**.
- **Backend (Render):** In the **Deploys** tab on Render, locate the previous healthy deployment and click **Rollback**.

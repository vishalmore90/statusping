import time
from collections import defaultdict
from collections.abc import AsyncGenerator, Callable
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.config import settings
from app.routers import auth, check_results, incidents, monitors, public, status_pages
from app.scheduler.jobs import start_scheduler, stop_scheduler

# Rate limiting storage (client_ip:path -> list of request timestamps)
_auth_rate_limit: dict[str, list[float]] = defaultdict(list)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    if settings.app_env != "test":
        await start_scheduler()
    yield
    # Shutdown
    if settings.app_env != "test":
        await stop_scheduler()


def create_app() -> FastAPI:
    app = FastAPI(
        title="StatusPing API",
        description="Open-source uptime monitoring and status page API",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def add_security_headers(
        request: Request, call_next: Callable[[Request], Any]
    ) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    @app.middleware("http")
    async def rate_limit_auth_endpoints(
        request: Request, call_next: Callable[[Request], Any]
    ) -> Response:
        if settings.app_env != "test":
            path = request.url.path
            if request.method == "POST" and (
                path.endswith("/auth/login") or path.endswith("/auth/register")
            ):
                client_ip = request.client.host if request.client else "unknown"
                now = time.time()
                limit = 15 if "login" in path else 10
                window = 60.0
                timestamps = [
                    t for t in _auth_rate_limit[f"{client_ip}:{path}"] if now - t < window
                ]
                if len(timestamps) >= limit:
                    return JSONResponse(
                        status_code=429,
                        content={
                            "detail": "Too many requests. Please wait a moment before retrying."
                        },
                        headers={"Retry-After": "60"},
                    )
                timestamps.append(now)
                _auth_rate_limit[f"{client_ip}:{path}"] = timestamps
        response: Response = await call_next(request)
        return response

    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(status_pages.router, prefix="/api/v1")
    app.include_router(monitors.router, prefix="/api/v1")
    app.include_router(incidents.router, prefix="/api/v1")
    app.include_router(check_results.router, prefix="/api/v1")
    app.include_router(public.router, prefix="/api/v1")

    @app.get("/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

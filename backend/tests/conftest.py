"""
pytest configuration and fixtures for StatusPing backend tests.

Test strategy:
- DB-dependent fixtures are skipped automatically when PostgreSQL is not reachable.
- Each test function that needs a DB gets a fresh transaction rolled back after
  the test, so tests are fully isolated without needing to truncate tables.
- In CI the PostgreSQL service container is always available.
"""

import os
import socket
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app

# ── Helpers ───────────────────────────────────────────────────────────────────

TEST_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/statusping_test",
)


def _postgres_reachable() -> bool:
    """Return True if PostgreSQL is accepting connections on localhost:5432."""
    try:
        with socket.create_connection(("localhost", 5432), timeout=1):
            return True
    except OSError:
        return False


requires_db = pytest.mark.skipif(
    not _postgres_reachable(),
    reason="PostgreSQL not reachable on localhost:5432 — skipping DB tests",
)

# ── Engine / session factory ──────────────────────────────────────────────────

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest_asyncio.fixture(scope="session")
async def create_test_tables() -> AsyncGenerator[None, None]:
    """Create all tables once per session; only runs when PostgreSQL is reachable."""
    if not _postgres_reachable():
        yield
        return
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session(
    create_test_tables: None,
) -> AsyncGenerator[AsyncSession, None]:
    """
    Transactional AsyncSession rolled back after each test.
    Automatically skipped when PostgreSQL is not reachable.
    """
    if not _postgres_reachable():
        pytest.skip("PostgreSQL not reachable")
    async with test_engine.connect() as conn:
        await conn.begin()
        session = AsyncSession(bind=conn, expire_on_commit=False)
        try:
            yield session
        finally:
            await session.close()
            await conn.rollback()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Async test client for endpoint tests that don't need a real DB.
    The app's scheduler is started/stopped via the lifespan context.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def db_client(
    db_session: AsyncSession,
) -> AsyncGenerator[AsyncClient, None]:
    """
    Async test client with the DB dependency overridden to the test transaction session.
    Use this for tests that need both HTTP and DB access.
    """

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

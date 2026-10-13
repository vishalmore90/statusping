"""
Public router: unauthenticated endpoints for public status pages.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.public import PublicStatusPage
from app.services import public_service

router = APIRouter(prefix="/public", tags=["public"])

# Cache public status pages for 30 seconds at the HTTP layer.
# Keeps load off the DB while still reflecting near-real-time data.
_CACHE_CONTROL = "public, max-age=30, stale-while-revalidate=60"


@router.get(
    "/status/{slug}",
    response_model=PublicStatusPage,
    summary="Get public status page data",
    description=(
        "Returns the full status page payload for a given slug. "
        "No authentication required. "
        "Includes monitors with 90-day uptime bars, active and recently resolved incidents. "
        "Responses are cached for 30 seconds."
    ),
)
async def get_public_status_page(
    slug: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> PublicStatusPage:
    page = await public_service.get_public_status_page(db, slug)
    if page is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Status page '{slug}' not found.",
        )
    response.headers["Cache-Control"] = _CACHE_CONTROL
    return page

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ...schemas import ProviderCreate, ProviderResponse, ResponseEnvelope
from ...database import get_db
from ...models import Provider, User
from ..deps import get_current_active_user

import logging

router = APIRouter(prefix="/providers", tags=["Providers"])

logger = logging.getLogger(__name__)

@router.post("/", response_model=ResponseEnvelope[ProviderResponse], status_code=status.HTTP_201_CREATED)
async def create_provider(
    request: ProviderCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Registers a new data provider linked to the authenticated user."""
    try:
        new_provider = Provider(
            **request.model_dump(),
            owner_id=current_user.id
        )
        db.add(new_provider)
        await db.commit()
        await db.refresh(new_provider)
        return ResponseEnvelope(payload=ProviderResponse.model_validate(new_provider))
    except Exception:
        await db.rollback()
        logger.exception("Failed to register new provider")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to register new provider"
        )

@router.get("/", response_model=ResponseEnvelope[List[ProviderResponse]])
async def list_providers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lists all data providers owned by the authenticated user."""
    try:
        # If user is superuser, maybe show all? For now, just owner.
        stmt = select(Provider).where(Provider.owner_id == current_user.id).order_by(Provider.name)
        result = await db.execute(stmt)
        providers = result.scalars().all()
        return ResponseEnvelope(payload=[ProviderResponse.model_validate(p) for p in providers])
    except Exception:
        logger.exception("Error fetching provider directory")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error fetching provider directory"
        )

@router.get("/{provider_id}", response_model=ResponseEnvelope[ProviderResponse])
async def get_provider(
    provider_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieves detailed profile for a specific provider if owned by the user."""
    try:
        provider = await db.get(Provider, provider_id)
        if not provider or provider.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Provider identity not found or access denied"
            )
        return ResponseEnvelope(payload=ProviderResponse.model_validate(provider))
    except HTTPException:
        raise
    except Exception:
        logger.exception(f"Error retrieving provider details for ID: {provider_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error retrieving provider details"
        )

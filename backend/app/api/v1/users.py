from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from ...database import get_db
from ...models import User
from ...schemas import UserResponse, ResponseEnvelope, UserUpdate
from ..deps import get_current_active_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=ResponseEnvelope[UserResponse])
async def get_my_profile(current_user: User = Depends(get_current_active_user)):
    """Retrieves the authenticated user's profile."""
    return ResponseEnvelope(payload=UserResponse.model_validate(current_user))

@router.patch("/me", response_model=ResponseEnvelope[UserResponse])
async def update_my_profile(
    user_update: UserUpdate = Body(...), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Updates the authenticated user's profile information."""
    current_user.full_name = user_update.full_name
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return ResponseEnvelope(payload=UserResponse.model_validate(current_user))

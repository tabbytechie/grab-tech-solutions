from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Optional

from ...schemas import IngestionRequest, IngestionTaskResponse, TaskStatusResponse, ResponseEnvelope
from ...database import get_db
from ...models import IngestionTask, Provider, User
from ...tasks import process_heavy_ingestion
from ..deps import get_current_active_user, get_current_user

router = APIRouter(prefix="/tasks", tags=["Ingestion Tasks"])

from ...core.ws.manager import manager

@router.websocket("/{task_id}/ws")
async def task_log_websocket(
    websocket: WebSocket, 
    task_id: UUID,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Real-time log streaming for a specific ingestion task."""
    connected = False
    try:
        # Resolve user from token
        from ..deps import get_current_user
        user = await get_current_user(db=db, token=token, access_token=None)
        
        # Verify user has permission for this task (owns the provider)
        result = await db.execute(
            select(IngestionTask)
            .join(Provider)
            .where(IngestionTask.id == task_id)
            .where(Provider.owner_id == user.id)
        )
        task = result.scalars().first()
        if not task:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await manager.connect(task_id, websocket)
        connected = True
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            pass
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    finally:
        if connected:
            manager.disconnect(task_id, websocket)

@router.post("/", response_model=ResponseEnvelope[IngestionTaskResponse], status_code=status.HTTP_202_ACCEPTED)
async def create_task(
    request: IngestionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Creates a new ingestion task and offloads processing.
    The response status 202 (Accepted) indicates the task is queued.
    """
    try:
        # Verify provider exists and user owns it
        provider = await db.get(Provider, request.provider_id)
        if not provider or provider.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Provider not found or access denied"
            )

        new_task = IngestionTask(
            provider_id=request.provider_id,
            payload=request.payload,
            priority=request.priority,
            scheduled_at=request.scheduled_at,
            status="queued"
        )
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)

        # Trigger background processing with user email
        background_tasks.add_task(
            process_heavy_ingestion, 
            new_task.id, 
            new_task.payload,
            user_email=current_user.email
        )

        return ResponseEnvelope(payload=IngestionTaskResponse.model_validate(new_task))
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not initialize ingestion task"
        )

from sqlalchemy.orm import selectinload

@router.get("/{task_id}", response_model=ResponseEnvelope[TaskStatusResponse])
async def get_task_status(
    task_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieves the current status, metadata, and execution logs of a specific task."""
    result = await db.execute(
        select(IngestionTask)
        .options(selectinload(IngestionTask.logs))
        .join(Provider)
        .where(IngestionTask.id == task_id)
        .where(Provider.owner_id == current_user.id)
    )
    task = result.scalars().first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Task not found or access denied"
        )
    
    return ResponseEnvelope(payload=TaskStatusResponse.model_validate(task))

@router.get("/", response_model=ResponseEnvelope[List[IngestionTaskResponse]])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lists all ingestion tasks owned by the authenticated user."""
    try:
        result = await db.execute(
            select(IngestionTask)
            .join(Provider)
            .where(Provider.owner_id == current_user.id)
            .order_by(IngestionTask.created_at.desc())
        )
        tasks = result.scalars().all()
        return ResponseEnvelope(payload=[IngestionTaskResponse.model_validate(t) for t in tasks])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not retrieve tasks list"
        )

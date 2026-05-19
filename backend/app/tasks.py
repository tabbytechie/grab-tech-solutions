import asyncio
import logging
from uuid import UUID
from typing import Any
from sqlalchemy import update, delete
from datetime import datetime, timedelta, timezone
from .database import async_session_factory
from .models import IngestionTask, TaskLog
from .core.config import settings
from .core.ws.manager import manager as ws_manager
from .core.email import notify_task_completion

# Configure logging for background tasks
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_old_tasks():
    """Periodic cleanup of old ingestion tasks and logs."""
    logger.info("Initializing periodic data cleanup...")
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=settings.TASK_CLEANUP_DAYS)
    async with async_session_factory() as session:
        try:
            async with session.begin():
                stmt = delete(IngestionTask).where(IngestionTask.created_at < cutoff_date)
                result = await session.execute(stmt)
                logger.info(f"Cleanup complete. Removed {result.rowcount} stale tasks.")
        except Exception as e:
            logger.error(f"Cleanup pipeline failure: {str(e)}")

async def process_heavy_ingestion(task_id: UUID, payload: dict[str, Any], user_email: str = None):
    """Async background worker for heavy data processing."""
    async with async_session_factory() as session:
        try:
            # Update status to 'processing'
            async with session.begin():
                await session.execute(
                    update(IngestionTask).where(IngestionTask.id == task_id).values(status="processing")
                )
                session.add(TaskLog(
                    task_id=task_id, log_level="INFO",
                    message="Pipeline activated.", context={"payload_size": len(str(payload))}
                ))
            
            await ws_manager.broadcast(task_id, {"status": "processing", "message": "Pipeline activated"})
            await asyncio.sleep(5) # Simulate workload
            
            processed_data = {"processed_count": 1024, "status": "verified"}

            async with session.begin():
                await session.execute(
                    update(IngestionTask).where(IngestionTask.id == task_id).values(
                        status="completed", operational_metadata={"result": processed_data}
                    )
                )
                session.add(TaskLog(
                    task_id=task_id, log_level="INFO",
                    message="Ingestion completed successfully.", context=processed_data
                ))
            
            await ws_manager.broadcast(task_id, {"status": "completed", "message": "Success", "data": processed_data})
            if user_email:
                await notify_task_completion(user_email, str(task_id), "completed")
                
        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}")
            async with session.begin():
                await session.execute(update(IngestionTask).where(IngestionTask.id == task_id).values(status="failed"))
                session.add(TaskLog(task_id=task_id, log_level="ERROR", message=f"Task failed: {str(e)}"))
            await ws_manager.broadcast(task_id, {"status": "failed", "message": str(e)})
            if user_email:
                await notify_task_completion(user_email, str(task_id), f"failed: {str(e)}")

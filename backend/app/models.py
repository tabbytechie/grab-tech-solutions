from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, text, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.engine.url import make_url
from .database import Base
from .core.config import settings

def get_uuid_server_default():
    try:
        if make_url(settings.DATABASE_URL).get_backend_name() == "postgresql":
            return text("uuid_generate_v4()")
    except Exception:
        pass
    return None

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4,
        server_default=get_uuid_server_default()
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        server_default=text("now()")
    )

    # Relationships
    providers: Mapped[List["Provider"]] = relationship("Provider", back_populates="owner")

class Provider(Base):
    __tablename__ = "providers"
    
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4,
        server_default=get_uuid_server_default()
    )
    owner_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    config: Mapped[dict] = mapped_column(JSON, default=dict, server_default=text("'{}'"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        server_default=text("now()")
    )

    # Relationships
    owner: Mapped[Optional["User"]] = relationship("User", back_populates="providers")
    tasks: Mapped[List["IngestionTask"]] = relationship(
        "IngestionTask", back_populates="provider", cascade="all, delete-orphan"
    )

class IngestionTask(Base):
    __tablename__ = "ingestion_tasks"
    
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4,
        server_default=get_uuid_server_default()
    )
    provider_id: Mapped[UUID] = mapped_column(
        ForeignKey("providers.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="queued", server_default=text("'queued'"))
    priority: Mapped[int] = mapped_column(Integer, default=5, server_default=text("5"))
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    operational_metadata: Mapped[dict] = mapped_column(JSON, default=dict, server_default=text("'{}'"))
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        server_default=text("now()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        server_default=text("now()")
    )

    # Relationships
    provider: Mapped["Provider"] = relationship("Provider", back_populates="tasks")
    logs: Mapped[List["TaskLog"]] = relationship(
        "TaskLog", back_populates="task", cascade="all, delete-orphan"
    )

class TaskLog(Base):
    __tablename__ = "task_logs"
    
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid4,
        server_default=get_uuid_server_default()
    )
    task_id: Mapped[UUID] = mapped_column(
        ForeignKey("ingestion_tasks.id", ondelete="CASCADE"), nullable=False
    )
    log_level: Mapped[str] = mapped_column(String(20), default="INFO", server_default=text("'INFO'"))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    context: Mapped[dict] = mapped_column(JSON, default=dict, server_default=text("'{}'"))
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        server_default=text("now()")
    )

    # Relationships
    task: Mapped["IngestionTask"] = relationship("IngestionTask", back_populates="logs")

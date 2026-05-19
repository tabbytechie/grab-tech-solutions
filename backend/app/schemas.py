from uuid import UUID, uuid4
import datetime
from typing import Generic, TypeVar, Optional, Any, List
from pydantic import BaseModel, Field, EmailStr, model_validator, ConfigDict

T = TypeVar("T")

class ResponseEnvelope(BaseModel, Generic[T]):
    """Globally consistent response envelope."""
    id: UUID = Field(default_factory=uuid4)
    status: str = "success"
    payload: Optional[T] = None
    timestamp: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    model_config = ConfigDict(from_attributes=True)

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)

class UserResponse(UserBase):
    id: UUID
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Provider Schemas
class ProviderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    config: Optional[dict[str, Any]] = Field(default_factory=dict)
    is_active: Optional[bool] = True

class ProviderCreate(ProviderBase):
    pass

class ProviderResponse(ProviderBase):
    id: UUID
    owner_id: Optional[UUID] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# Task Schemas
class IngestionRequest(BaseModel):
    provider_id: UUID
    payload: dict[str, Any] = Field(..., description="Data to be ingested")
    priority: int = Field(ge=1, le=10, default=5)
    scheduled_at: Optional[datetime.datetime] = None

    @model_validator(mode="after")
    def validate_schedule(self) -> "IngestionRequest":
        if self.scheduled_at:
            if self.scheduled_at.tzinfo is None:
                self.scheduled_at = self.scheduled_at.replace(tzinfo=datetime.timezone.utc)
            if self.scheduled_at < datetime.datetime.now(datetime.timezone.utc):
                raise ValueError("scheduled_at must be in the future")
        return self

class IngestionTaskResponse(BaseModel):
    id: UUID
    provider_id: UUID
    status: str
    priority: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class TaskLogSchema(BaseModel):
    id: UUID
    log_level: str
    message: str
    context: dict[str, Any]
    recorded_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class TaskStatusResponse(IngestionTaskResponse):
    operational_metadata: Optional[dict[str, Any]]
    logs: List[TaskLogSchema] = []

    model_config = ConfigDict(from_attributes=True)

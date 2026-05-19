import os
import warnings
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Data Ingestion Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    API_V2_STR: str = "/api/v2"
    
    # Security
    SECRET_KEY: str
    
    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or v == "super-secret-key-for-development-purposes":
            warnings.warn(
                "SECRET_KEY is insecure or missing. Please set a strong SECRET_KEY in the environment.",
                UserWarning
            )
        return v or "super-secret-key-for-development-purposes"

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:@localhost:5432/grabtech_solutions",
    )
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "false").lower() == "true"
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Ingestion Configuration
    MAX_PAYLOAD_SIZE_MB: int = 50
    TASK_CLEANUP_DAYS: int = 30
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

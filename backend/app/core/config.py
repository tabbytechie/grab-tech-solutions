import os
import warnings
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Data Ingestion Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    API_V2_STR: str = "/api/v2"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-development-purposes")
    
    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        # Avoid warning during tests or if explicitly set
        if (not v or v == "super-secret-key-for-development-purposes") and os.getenv("ENVIRONMENT") != "test":
            warnings.warn(
                "SECRET_KEY is insecure or missing. Please set a strong SECRET_KEY in the environment.",
                UserWarning
            )
        return v or "super-secret-key-for-development-purposes"

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
    TRUSTED_HOSTS: str = os.getenv("TRUSTED_HOSTS", "localhost,127.0.0.1,test")
    HTTPS_ONLY: bool = os.getenv("HTTPS_ONLY", "false").lower() == "true"
    HSTS_MAX_AGE_SECONDS: int = int(os.getenv("HSTS_MAX_AGE_SECONDS", "31536000"))
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:@localhost:5432/grabtech_solutions",
    )
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "false").lower() == "true"
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Telemetry
    APPLICATIONINSIGHTS_CONNECTION_STRING: Optional[str] = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")

    # Ingestion Configuration
    MAX_PAYLOAD_SIZE_MB: int = 50
    TASK_CLEANUP_DAYS: int = 30

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def trusted_hosts_list(self) -> list[str]:
        return [host.strip() for host in self.TRUSTED_HOSTS.split(",") if host.strip()]

    @property
    def COOKIE_SECURE(self) -> bool:
        return self.ENVIRONMENT == "production"

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        insecure_secret = (
            not self.SECRET_KEY
            or self.SECRET_KEY == "super-secret-key-for-development-purposes"
            or self.SECRET_KEY == "your-secret-key-for-dev"
        )
        if self.ENVIRONMENT == "production" and insecure_secret:
            raise ValueError("A strong SECRET_KEY is required in production.")
        if self.ENVIRONMENT == "production" and not self.HTTPS_ONLY:
            warnings.warn("HTTPS_ONLY should be enabled in production.", UserWarning)
        return self
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

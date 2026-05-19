import time
import logging
import uuid
import json
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .api.v1.ingestion import router as ingestion_router
from .api.v1.providers import router as providers_router
from .api.v1.auth import router as auth_router
from .api.v1.users import router as users_router
from .api.v2.router import router as v2_router
from .core.config import settings

# Structured Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api.telemetry")

# Setup Rate Limiting with Redis Backend
limiter = Limiter(
    key_func=get_remote_address, 
    default_limits=["100 per minute"],
    storage_uri=settings.REDIS_URL
)

app = FastAPI(
    title="Data Ingestion Engine",
    description="High-performance, asynchronous API for heavy data processing and ingestion.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    start_time = time.perf_counter()
    
    # Capture payload size
    content_length = request.headers.get("content-length")
    payload_size = int(content_length) if content_length else 0
    
    response = await call_next(request)
    
    execution_time = time.perf_counter() - start_time
    
    log_data = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "correlation_id": correlation_id,
        "path": request.url.path,
        "method": request.method,
        "status_code": response.status_code,
        "execution_time_ms": round(execution_time * 1000, 2),
        "payload_size_bytes": payload_size
    }
    
    logger.info(json.dumps(log_data))
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["X-Execution-Time"] = f"{log_data['execution_time_ms']}ms"
    return response

@app.exception_handler(Exception)
async def sanitized_exception_handler(request: Request, exc: Exception):
    correlation_id = request.headers.get("X-Correlation-ID", "unknown")
    logger.error(f"CORRELATION_ID={correlation_id} | Unhandled Exception: {str(exc)}", exc_info=False)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "id": correlation_id,
            "status": "error",
            "payload": None,
            "message": "An internal server error occurred. Please contact support with the provided ID.",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    )

@app.exception_handler(HTTPException)
async def sanitized_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "id": request.headers.get("X-Correlation-ID"),
            "status": "error",
            "payload": None,
            "message": exc.detail,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    )

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(ingestion_router, prefix=settings.API_V1_STR)
app.include_router(providers_router, prefix=settings.API_V1_STR)
app.include_router(v2_router, prefix=settings.API_V2_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy", 
        "version": settings.VERSION,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

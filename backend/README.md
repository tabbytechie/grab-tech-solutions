# Backend Service Architecture

## 🔌 API Interface
The backend is built on **FastAPI**, utilizing purely asynchronous I/O to handle high-concurrency workloads.

### Key Features
- **Async/Await:** Non-blocking endpoints for database and external service interaction.
- **Pydantic V2:** Strict schema enforcement and input sanitization.
- **Background Workers:** Heavy computational tasks are offloaded to `BackgroundTasks` to preserve the event loop's responsiveness.
- **Redis Rate Limiting:** Distributed rate limiting using `slowapi` with a Redis storage backend.

---

## 🛰 Telemetry & Logging
We implement a **Structured Logging Strategy** for production observability.

### Middleware Implementation
Every request passes through a telemetry middleware that captures:
- **Correlation ID:** A unique UUIDv4 mapped to every request/response cycle.
- **Execution Time:** High-precision timing (ms).
- **Payload Size:** Network throughput tracking.
- **Structured JSON:** Logs are emitted as machine-readable JSON for ingestion into ELK/Grafana stacks.

### Exception Sanitization
Unexpected server errors are caught, logged with the Correlation ID, and returned to the client as a sanitized `500 Internal Server Error` without exposing stack traces.

---

## 💾 Persistence Layer (PostgreSQL)
The database follows **3rd Normal Form (3NF)** with specific optimizations:
- **UUIDv4 Keys:** Non-sequential primary keys for security and distribution.
- **GIN Indexing:** Optimized lookups for JSONB polymorphic payloads.
- **B-Tree Indexing:** High-performance filtering on timestamps and foreign keys.

---

## 🧪 Integration Testing
Tests are implemented using **Pytest-Asyncio** and **HTTPX**.
- **Lifecycle Tests:** Verify full user registration -> login -> resource creation flows.
- **Constraint Tests:** Ensure Pydantic validation correctly rejects malformed payloads (422).
- **Database Consistency:** Verifies session commits and status mutations in background pipelines.

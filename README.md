# Strategic Data Ingestion Engine

## 🏗 System Architecture
A robust, production-grade distributed system designed for high-throughput data ingestion and processing. This application integrates a state-driven React frontend with an asynchronous Python/FastAPI backend, backed by a persistent PostgreSQL layer.

### Core Mandates
- **Principal Engineering:** Optimized React components, non-blocking Python I/O, and 3NF PostgreSQL relations.
- **Reliability:** Dual-layer testing suite with mandatory validation in the containerization lifecycle.
- **Observability:** Distributed tracing via Correlation IDs, structured JSON logging, and client-side telemetry.
- **Security:** OAuth2/JWT session management via Secure/HttpOnly cookies, Pydantic-enforced input sanitization, and Redis-backed distributed rate limiting.
- **Hardening:** Production Docker images run as non-root users (`appuser`) for system integrity.

---

## 🚀 Tech Stack

### Frontend (React & TanStack)
- **Framework:** React 19 (TypeScript)
- **Routing:** TanStack Router (Type-safe navigation)
- **State Management:** TanStack Query (Server-state synchronization)
- **Styling:** Tailwind CSS 4.0
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library

### Backend (Python / FastAPI)
- **Framework:** FastAPI (Async/Await)
- **ORM:** SQLAlchemy 2.0 (AsyncIO)
- **Security:** Jose (JWT), Passlib (Bcrypt)
- **Rate Limiting:** SlowAPI + Redis
- **Background Tasks:** FastAPI BackgroundTasks
- **Testing:** Pytest-Asyncio + HTTPX

### Infrastructure
- **Persistence:** PostgreSQL (3NF Schema with GIN Indexing)
- **Cache/Rate Limit:** Redis
- **Containerization:** Multi-stage Docker (Mandatory Test Validation)
- **CI/CD:** GitHub Actions

---

## 🛠 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### Local Development
1. **Initialize Backend:**
   ```bash
   pip install -r requirements.txt
   uvicorn backend.app.main:app --reload
   ```
2. **Initialize Frontend:**
   ```bash
   npm install
   npm run dev
   ```
3. **Run Tests:**
   ```bash
   # Backend
   python -m pytest
   # Frontend
   npm test
   ```

### Docker Deployment
Build and run the entire stack with mandatory test validation:
```bash
docker build -t ingestion-engine .
docker-compose up -d
```

---

## 📐 Documentation Index
- [Backend Documentation](./backend/README.md) - API Specs, Logging & Task Pipeline.
- [Frontend Documentation](./src/README.md) - Component State Machines & Telemetry.
- [Production Readiness Checklist](./SECURITY_CHECKLIST.md) - Security, performance, residual risks, and SPFx migration notes.

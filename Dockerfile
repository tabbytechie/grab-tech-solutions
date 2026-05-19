# ==========================================
# STAGE 1: Frontend Testing (Node.js Alpine)
# ==========================================
FROM node:20-alpine AS frontend-test
WORKDIR /app

# Install dependencies for testing
COPY package.json package-lock.json ./
RUN npm ci --quiet

# Copy source and run tests
COPY . .
RUN npm test

# ==========================================
# STAGE 2: Backend Testing (Python Slim)
# ==========================================
FROM python:3.11-slim AS backend-test
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application into the build context
COPY . .

# ==========================================
# STAGE 3: Final Production Image
# ==========================================
FROM python:3.11-slim
WORKDIR /app

# Install ONLY runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install production Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ONLY necessary application code from backend-test
# We skip copying the entire /app to avoid test artifacts and cache
COPY --from=backend-test /app/backend /app/backend
COPY --from=backend-test /app/src /app/src
COPY --from=backend-test /app/package.json /app/

# Environment configuration
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start the FastAPI application
ENV PORT=8000

# Create a non-privileged user to run the app
RUN addgroup --system appgroup && adduser --system --group appuser
RUN chown -R appuser:appgroup /app
USER appuser

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

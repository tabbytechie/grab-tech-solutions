-- PostgreSQL High-Throughput Computational Pipeline Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_providers_is_active ON providers(is_active);
CREATE INDEX idx_providers_config_gin ON providers USING gin (config);

CREATE TABLE ingestion_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    payload JSONB NOT NULL,
    operational_metadata JSONB DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingestion_tasks_provider_id ON ingestion_tasks(provider_id);
CREATE INDEX idx_ingestion_tasks_status ON ingestion_tasks(status);
CREATE INDEX idx_ingestion_tasks_created_at ON ingestion_tasks(created_at);
CREATE INDEX idx_ingestion_tasks_payload_gin ON ingestion_tasks USING gin (payload);
CREATE INDEX idx_ingestion_tasks_metadata_gin ON ingestion_tasks USING gin (operational_metadata);

CREATE TABLE task_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES ingestion_tasks(id) ON DELETE CASCADE,
    log_level VARCHAR(20) DEFAULT 'INFO',
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX idx_task_logs_context_gin ON task_logs USING gin (context);

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_providers_timestamp BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER trg_update_tasks_timestamp BEFORE UPDATE ON ingestion_tasks FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

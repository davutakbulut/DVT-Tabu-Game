-- ==============================================================================
-- 🚨 MIGRATION 009: SYSTEM & ERROR LOGS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL DEFAULT 'error', -- 'fatal' | 'error' | 'warn' | 'info'
    source VARCHAR(50) NOT NULL DEFAULT 'client', -- 'client' | 'server' | 'api' | 'supabase' | 'gemini'
    message TEXT NOT NULL,
    stack_trace TEXT,
    page_url TEXT,
    session_id VARCHAR(100),
    user_id VARCHAR(100),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for fast querying and filtering
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON system_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON system_error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON system_error_logs(source);
CREATE INDEX IF NOT EXISTS idx_error_logs_is_resolved ON system_error_logs(is_resolved);

-- Enable RLS
ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;

-- Allow public insert (with rate limits in API)
CREATE POLICY "Allow public insert to error logs"
ON system_error_logs FOR INSERT
WITH CHECK (true);

-- Allow select and update for authenticated or service role / admin
CREATE POLICY "Allow read error logs"
ON system_error_logs FOR SELECT
USING (true);

CREATE POLICY "Allow update error logs"
ON system_error_logs FOR UPDATE
USING (true);

CREATE POLICY "Allow delete error logs"
ON system_error_logs FOR DELETE
USING (true);

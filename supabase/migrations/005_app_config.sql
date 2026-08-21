-- ==============================================================================
-- Migration 005: Remote App Configuration & Strategy Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_config (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'monetization',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial monetization & paywall configuration
INSERT INTO app_config (id, category, data)
VALUES (
    'monetization',
    'monetization',
    '{
        "paywall_games_threshold": 2,
        "ai_deck_paywall_enabled": true,
        "vip_room_paywall_enabled": false,
        "monthly_price": 49,
        "annual_price": 349,
        "active_campaign_title": "%40 Lansman Fırsatı",
        "campaign_badge": "SINIRLI SÜRE"
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET data = EXCLUDED.data, updated_at = NOW();

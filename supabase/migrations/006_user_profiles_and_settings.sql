-- ==============================================================================
-- Migration 006: User Profiles, Cloud Settings & Game Stats
-- ==============================================================================

-- 1. Profiles Table (supports guest, google, apple)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL DEFAULT 'Tabucu',
    avatar_url TEXT,
    email TEXT,
    provider TEXT NOT NULL DEFAULT 'guest',
    is_pro BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    turn_duration INTEGER NOT NULL DEFAULT 60,
    pass_limit INTEGER NOT NULL DEFAULT 3,
    sound_enabled BOOLEAN NOT NULL DEFAULT true,
    haptic_enabled BOOLEAN NOT NULL DEFAULT true,
    theme TEXT NOT NULL DEFAULT 'dark',
    favorite_categories TEXT[] DEFAULT ARRAY['Genel Kültür', 'Sinema & Dizi'],
    custom_decks JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Game Stats Table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_games_played INTEGER NOT NULL DEFAULT 0,
    total_wins INTEGER NOT NULL DEFAULT 0,
    total_correct_words INTEGER NOT NULL DEFAULT 0,
    total_taboos_hit INTEGER NOT NULL DEFAULT 0,
    total_passes_used INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

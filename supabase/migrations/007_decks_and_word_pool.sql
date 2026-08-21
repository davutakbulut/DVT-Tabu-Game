-- ==============================================================================
-- Migration 007: Decks and Word Pool Management System
-- ==============================================================================

-- 1. Create Decks Table
CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Layers',
    color TEXT DEFAULT '#6366f1',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add deck_id and is_active to cards table if not present
ALTER TABLE cards ADD COLUMN IF NOT EXISTS deck_id TEXT REFERENCES decks(id) ON DELETE SET NULL;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 3. Seed Standard Decks
INSERT INTO decks (id, name, description, icon, color, is_active, is_system)
VALUES 
    ('deck-general', 'Genel Kültür & Gündelik Yaşam', 'Her yaştan oyuncuya uygun klasik eğlenceli Türkçe kelimeler.', 'Sparkles', '#6366f1', true, true),
    ('deck-cinema', 'Sinema, Dizi & Popüler Kültür', 'Yerli ve yabancı efsane filmler, unutulmaz diziler ve karakterler.', 'Film', '#ec4899', true, true),
    ('deck-sports', 'Spor Arenası & Futbol', 'Futbol takımları, efsane sporcular, stadyumlar ve terimler.', 'Trophy', '#10b981', true, true),
    ('deck-tech', 'Teknoloji, Yazılım & Gelecek', 'Yapay zeka, kodlama, akıllı cihazlar ve dijital dünya.', 'Cpu', '#06b6d4', true, true),
    ('deck-food', 'Yemek, Mutfak & Lezzetler', 'Geleneksel Türk lezzetleri, tatlılar, dünya mutfağı.', 'Utensils', '#f59e0b', true, true),
    ('deck-nostalgia', '90lar & 2000ler Nostalji', 'Çocukluğumuzun unutulmaz oyuncakları, kasetler, eski şarkılar.', 'History', '#8b5cf6', true, true),
    ('deck-history', 'Tarih & Coğrafya', 'Tarihi olaylar, medeniyetler, ülkeler, başkentler.', 'Globe', '#14b8a6', true, true)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = EXCLUDED.is_active;

-- Map existing cards without deck_id to appropriate decks
UPDATE cards SET deck_id = 'deck-cinema' WHERE (category ILIKE '%Sinema%' OR category ILIKE '%Dizi%') AND deck_id IS NULL;
UPDATE cards SET deck_id = 'deck-sports' WHERE category ILIKE '%Spor%' AND deck_id IS NULL;
UPDATE cards SET deck_id = 'deck-tech' WHERE (category ILIKE '%Teknoloji%' OR category ILIKE '%Yazılım%') AND deck_id IS NULL;
UPDATE cards SET deck_id = 'deck-food' WHERE (category ILIKE '%Yemek%' OR category ILIKE '%Mutfak%') AND deck_id IS NULL;
UPDATE cards SET deck_id = 'deck-nostalgia' WHERE (category ILIKE '%90%' OR category ILIKE '%Nostalji%') AND deck_id IS NULL;
UPDATE cards SET deck_id = 'deck-history' WHERE (category ILIKE '%Tarih%' OR category ILIKE '%Coğrafya%') AND deck_id IS NULL;
UPDATE cards SET deck_id = 'deck-general' WHERE deck_id IS NULL;

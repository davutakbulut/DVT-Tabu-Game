-- ==============================================================================
-- Migration 008: 2026 Trend Memes & Social Media Deck
-- ==============================================================================

-- 1. Drop old restrictive category check constraint to allow custom & dynamic decks
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_category_check;

-- 2. Insert 2026 Memes Deck
INSERT INTO decks (id, name, description, icon, color, is_active, is_system)
VALUES (
    'deck-memes-2026',
    '🔥 2026 Trend Meme''ler & Viral Akımlar',
    'TikTok, Reels, X ve Twitch dünyasının en komik ve popüler 2026 akımları, viral sesleri ve caps''leri.',
    'Flame',
    '#f43f5e',
    true,
    true
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true, color = EXCLUDED.color;

-- 3. Insert 2026 Trending Meme Cards
INSERT INTO cards (main_word, forbidden_words, category, difficulty, deck_id, is_active)
VALUES
    ('SKIBIDI TOILET', ARRAY['TUVALET', 'KAFA', 'KAMERA', 'ŞARKI', 'ÇOCUK'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('NPC YAYINI', ARRAY['TİKTOK', 'DONDURMA', 'HEDİYE', 'YAYIN', 'TEKRAR'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('BRAIN ROT', ARRAY['BEYİN', 'İNTERNET', 'EKRAN', 'Z KUŞAĞI', 'TELEFON'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('SIGMA ERKEK', ARRAY['PATRICK', 'KURAL', 'DİZİ', 'BAKIŞ', 'MÜZİK'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('GIGA CHAD', ARRAY['KASLI', 'ÇENE', 'YAKIŞIKLI', 'MEME', 'ERKEK'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('RIZZ', ARRAY['ETKİLEMEK', 'KARİZMA', 'FLÖRT', 'Z KUŞAĞI', 'KIZ'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('POV', ARRAY['BAKIŞ AÇISI', 'TİKTOK', 'VİDEO', 'SEN', 'DURUM'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('STALKER', ARRAY['PROFİL', 'GİZLİ', 'TAKİP', 'İNSTAGRAM', 'ESKİ SEVGİLİ'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('ASMR', ARRAY['FISILTI', 'SES', 'KULAKLIK', 'RAHATLAMA', 'YEMEK'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('DOOMSCROLLING', ARRAY['TELEFON', 'KAYDIRMAK', 'GECE', 'BAĞIMLILIK', 'HABER'], 'Trend Memeler', 'Zor', 'deck-memes-2026', true),
    ('MEWING', ARRAY['ÇENE', 'DİL', 'YÜZ', 'EGZERSİZ', 'TİKTOK'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('CRINGE', ARRAY['UTANÇ', 'RAHATSIZ', 'VİDEO', 'İZLEMEK', 'HAREKET'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('GASLIGHTING', ARRAY['MANİPÜLASYON', 'YALAN', 'İKNA', 'İLİŞKİ', 'DELİ'], 'Trend Memeler', 'Zor', 'deck-memes-2026', true),
    ('DOPAMİN DETOKSU', ARRAY['TELEFON', 'SOSYAL MEDYA', 'BIRAKMAK', 'BEYİN', 'SAĞLIK'], 'Trend Memeler', 'Zor', 'deck-memes-2026', true),
    ('VIBE CHECK', ARRAY['HAVA', 'ENERJİ', 'ORTAM', 'ARKADAŞ', 'MOD'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('ROAST ETMEK', ARRAY['DALGA', 'ELEŞTİRİ', 'ŞAKA', 'SOSYAL MEDYA', 'KOMİK'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('UNUTTUĞUMUZ BİR ŞEY VAR', ARRAY['VİRAL', 'CÜMLE', 'REELS', 'VİDEO', 'SES'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('YAPAY ZEKA FİLTRESİ', ARRAY['DEĞİŞİM', 'FOTOĞRAF', 'TİKTOK', 'TREND', 'GENÇLEŞME'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('O GÜN BU GÜN DEĞİL', ARRAY['MOTİVASYON', 'VİRAL', 'SES', 'REELS', 'SPOR'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('DELİKANLI GİBİ', ARRAY['ERKEK', 'RACON', 'SÖZ', 'TİKTOK', 'VİRAL'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('GÖZÜNÜ SEVEYİM', ARRAY['RİCA', 'YALVARMAK', 'DİL', 'CAPS', 'KOMİK'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('KAPIBARA', ARRAY['HAYVAN', 'SAKİN', 'VİRAL', 'ŞARKI', 'MEME'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('SARI TUTKU', ARRAY['SARI', 'ÇİZMELİ', 'MİZAH', 'TİKTOK', 'KOMİK'], 'Trend Memeler', 'Orta', 'deck-memes-2026', true),
    ('RED FLAG', ARRAY['KIRMIZI', 'BAYRAK', 'İLİŞKİ', 'TEHLİKE', 'UYARI'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true),
    ('GREEN FLAG', ARRAY['YEŞİL', 'GÜVEN', 'İLİŞKİ', 'İYİ', 'MÜKEMMEL'], 'Trend Memeler', 'Kolay', 'deck-memes-2026', true);

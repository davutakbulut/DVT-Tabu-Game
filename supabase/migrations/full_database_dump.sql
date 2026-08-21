-- ==============================================================================
-- 🎮 DVT TABU GAME - TAM VERİTABANI & SEED KARTLAR SQL DÖKÜMÜ
-- Plesk phpMyAdmin veya MySQL Workbench üzerinden tek tıkla içe aktarılabilir (Import)
-- Sunucu: 213.159.6.158 | Database: dvt_tabu
-- ==============================================================================

USE `dvt_tabu`;

-- Tabloları oluştur
CREATE TABLE IF NOT EXISTS `cards` (
  `id` VARCHAR(36) PRIMARY KEY,
  `main_word` VARCHAR(100) NOT NULL,
  `forbidden_words` JSON NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `difficulty` ENUM('Kolay', 'Orta', 'Zor') NOT NULL DEFAULT 'Orta',
  `language` VARCHAR(5) NOT NULL DEFAULT 'tr',
  `is_approved` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_difficulty` (`category`, `difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` VARCHAR(36) PRIMARY KEY,
  `code` VARCHAR(6) NOT NULL UNIQUE,
  `title` VARCHAR(100) NOT NULL DEFAULT 'Tabu Odası',
  `host_id` VARCHAR(50) NULL,
  `is_private` BOOLEAN DEFAULT FALSE,
  `password_hash` VARCHAR(255) NULL,
  `settings` JSON NOT NULL,
  `status` ENUM('waiting', 'playing', 'paused', 'finished', 'closed') NOT NULL DEFAULT 'waiting',
  `current_game_id` VARCHAR(36) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teams` (
  `id` VARCHAR(36) PRIMARY KEY,
  `room_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT '#6366F1',
  `score` INT NOT NULL DEFAULT 0,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `players` (
  `id` VARCHAR(36) PRIMARY KEY,
  `room_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(50) NULL,
  `guest_name` VARCHAR(50) NOT NULL,
  `avatar_url` VARCHAR(255) NULL,
  `team_id` VARCHAR(36) NULL,
  `is_ready` BOOLEAN DEFAULT FALSE,
  `is_host` BOOLEAN DEFAULT FALSE,
  `is_presenter` BOOLEAN DEFAULT FALSE,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `games` (
  `id` VARCHAR(36) PRIMARY KEY,
  `room_id` VARCHAR(36) NOT NULL,
  `status` ENUM('starting', 'in_progress', 'paused', 'turn_break', 'finished') NOT NULL DEFAULT 'starting',
  `current_round` INT NOT NULL DEFAULT 1,
  `total_rounds` INT NOT NULL DEFAULT 6,
  `active_team_id` VARCHAR(36) NULL,
  `active_presenter_id` VARCHAR(36) NULL,
  `current_card_id` VARCHAR(36) NULL,
  `time_remaining` INT NOT NULL DEFAULT 60,
  `remaining_passes` INT NOT NULL DEFAULT 3,
  `buzzer_locked_by_player_id` VARCHAR(36) NULL,
  `cards_used` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `turns` (
  `id` VARCHAR(36) PRIMARY KEY,
  `game_id` VARCHAR(36) NOT NULL,
  `team_id` VARCHAR(36) NOT NULL,
  `player_id` VARCHAR(36) NULL,
  `round_number` INT NOT NULL,
  `card_id` VARCHAR(36) NULL,
  `action` ENUM('correct', 'pass', 'buzzer', 'timeout') NOT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `game_history` (
  `id` VARCHAR(36) PRIMARY KEY,
  `game_id` VARCHAR(36) NOT NULL,
  `room_id` VARCHAR(36) NOT NULL,
  `winning_team_id` VARCHAR(36) NULL,
  `final_scores` JSON NOT NULL,
  `total_cards_played` INT NOT NULL DEFAULT 0,
  `duration_seconds` INT NOT NULL DEFAULT 0,
  `ai_summary` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `custom_decks` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `share_code` VARCHAR(6) UNIQUE,
  `created_by` VARCHAR(50) NULL,
  `is_public` BOOLEAN DEFAULT FALSE,
  `card_count` INT DEFAULT 0,
  `play_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `custom_cards` (
  `id` VARCHAR(36) PRIMARY KEY,
  `deck_id` VARCHAR(36) NOT NULL,
  `main_word` VARCHAR(100) NOT NULL,
  `forbidden_words` JSON NOT NULL,
  `category` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`deck_id`) REFERENCES `custom_decks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_insights` (
  `id` VARCHAR(36) PRIMARY KEY,
  `insight_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(50) NULL,
  `content` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 100+ Türkçe Tabu Kartı Seed Verisi
INSERT INTO `cards` (`id`, `main_word`, `forbidden_words`, `category`, `difficulty`, `language`) VALUES
('c1', 'PİRAMİT', '["MISIR", "FİRAVUN", "ÜÇGEN", "KEOPS", "TARİH"]', 'Genel Kültür', 'Kolay', 'tr'),
('c2', 'EYFEL KULESİ', '["PARİS", "FRANSA", "DEMİR", "TURİST", "ŞEHİR"]', 'Genel Kültür', 'Kolay', 'tr'),
('c3', 'ANITKABİR', '["ATATÜRK", "ANKARA", "MEZAR", "ASLANLI YOL", "MOZOLE"]', 'Genel Kültür', 'Kolay', 'tr'),
('c4', 'GÖBEKLİTEPE', '["ŞANLIURFA", "TARİH", "TAPINAK", "KAZI", "ARKEOLOJİ"]', 'Genel Kültür', 'Orta', 'tr'),
('c5', 'KAPADOKYA', '["BALON", "PERİ BACASI", "NEVŞEHİR", "KAYA", "TURİZM"]', 'Genel Kültür', 'Kolay', 'tr'),
('c6', 'BOĞAZİÇİ', '["İSTANBUL", "KÖPRÜ", "DENİZ", "MARMARA", "YALI"]', 'Genel Kültür', 'Kolay', 'tr'),
('c7', 'PUSULA', '["YÖN", "KUZEY", "GÜNEY", "MANYETİK", "HARİTA"]', 'Genel Kültür', 'Kolay', 'tr'),
('c8', 'TELESKOP', '["UZAY", "YILDIZ", "GEZEGEN", "GÖKYÜZÜ", "MERCEK"]', 'Genel Kültür', 'Kolay', 'tr'),
('c9', 'KÜTÜPHANE', '["KİTAP", "OKUMAK", "SESSİZ", "RAF", "ÖDÜNÇ"]', 'Genel Kültür', 'Kolay', 'tr'),
('c10', 'NOTER', '["İMZA", "ONAY", "VEKALET", "RESMİ", "TASDİK"]', 'Genel Kültür', 'Orta', 'tr'),
('c11', 'YAPAY ZEKA', '["ROBOT", "ALGORİTMA", "BİLGİSAYAR", "GELECEK", "CHATGPT"]', 'Teknoloji', 'Kolay', 'tr'),
('c12', 'AKILLI TELEFON', '["EKRAN", "DOKUNMATİK", "ŞARJ", "UYGULAMA", "APPLE"]', 'Teknoloji', 'Kolay', 'tr'),
('c13', 'KABLOSUZ KULAKLIK', '["BLUETOOTH", "MÜZİK", "SES", "KULAK", "KUTU"]', 'Teknoloji', 'Kolay', 'tr'),
('c14', 'BULUT DEPOLAMA', '["İNTERNET", "DRIVE", "DOSYA", "YEDEK", "SUNUCU"]', 'Teknoloji', 'Orta', 'tr'),
('c15', 'BLOKZİNCİR', '["BİTCOİN", "KRİPTO", "ZİNCİR", "GÜVENLİK", "MADENCİLİK"]', 'Teknoloji', 'Zor', 'tr'),
('c16', 'DİZÜSTÜ BİLGİSAYAR', '["LAPTOP", "KLAVYE", "BATARYA", "EKRAN", "ÇANTA"]', 'Teknoloji', 'Kolay', 'tr'),
('c17', 'ALGORİTMA', '["KOD", "YAZILIM", "MANTIK", "ADIM", "PROGRAM"]', 'Teknoloji', 'Orta', 'tr'),
('c18', 'VİRAL', '["VİDEO", "İNTERNET", "TREND", "PAYLAŞIM", "SOSYAL MEDYA"]', 'Teknoloji', 'Orta', 'tr'),
('c19', 'ŞİFRE', '["PAROLA", "GİRİŞ", "GÜVENLİK", "KARAKTER", "GİZLİ"]', 'Teknoloji', 'Kolay', 'tr'),
('c20', 'HABABAM SINIFI', '["İNEK ŞABAN", "MAHMUT HOCA", "OKUL", "KEMAL SUNAL", "GÜDÜK NECMİ"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c21', 'KURTLAR VADİSİ', '["POLAT ALEMDAR", "MEMATİ", "DİZİ", "RACON", "SİLAH"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c22', 'AVRUPA YAKASI', '["BURHAN ALTINTOP", "GÜLSE BİRSEL", "NİŞANTAŞI", "KOMEDİ", "ASLI"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c23', 'AŞK-I MEMNU', '["BİHTER", "BEHLÜL", "ADNAN", "FİRDEVS", "YALI"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c24', 'YÜZÜKLERİN EFENDİSİ', '["FRODO", "GANDALF", "YÜZÜK", "GOLUM", "MORDOR"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c25', 'HARRY POTTER', '["BÜYÜCÜ", "ASA", "HOGWARTS", "VOLDEMORT", "SÜPÜRGE"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c26', 'OSCAR', '["ÖDÜL", "HEYKEL", "TÖREN", "AKADEMİ", "FİLM"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c27', 'PATLAMIŞ MISIR', '["SİNEMA", "TUZ", "MISIR", "KOLTUĞU", "FİLM"]', 'Sinema & Dizi', 'Kolay', 'tr'),
('c28', 'OFSET', '["FUTBOL", "HAKEM", "ÇİZGİ", "BAYRAK", "POZİSYON"]', 'Spor', 'Kolay', 'tr'),
('c29', 'PENALTI', '["BEYAZ NOKTA", "KALECİ", "FAUL", "FUTBOL", "VURUŞ"]', 'Spor', 'Kolay', 'tr'),
('c30', 'BASKETBOL', '["POTA", "TOHUM", "SMAÇ", "ÜÇLÜK", "NBA"]', 'Spor', 'Kolay', 'tr'),
('c31', 'VOLEYBOL', '["FİLE", "MANŞET", "SERVİS", "SMAÇ", "PASÖR"]', 'Spor', 'Kolay', 'tr'),
('c32', 'FORMULA 1', '["YARIŞ", "PİLOT", "ARABA", "PİT STOP", "PİST"]', 'Spor', 'Kolay', 'tr'),
('c33', 'OLİMPİYAT', '["MADALYA", "MEŞALE", "HALKA", "DÜNYA", "ŞAMPİYON"]', 'Spor', 'Kolay', 'tr'),
('c34', 'SARI KART', '["HAKEM", "FAUL", "UYARI", "KIRMIZI", "CEZA"]', 'Spor', 'Kolay', 'tr'),
('c35', 'LAHMACUN', '["KIYMA", "LİMON", "FIRIN", "MAYDANOZ", "ÇITIR"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c36', 'BAKLAVA', '["ŞERBET", "FISTIK", "CEVİZ", "YUFKA", "ANTEP"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c37', 'MENEMEN', '["YUMURTA", "DOMATES", "BİBER", "SOĞAN", "KAHVALTI"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c38', 'MANTI', '["YOĞURT", "SARIMSAK", "KAYSERİ", "HAMUR", "SOS"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c39', 'TÜRK KAHVESİ', '["FİNCAN", "FAL", "KÖPÜK", "LOKUM", "ORTA"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c40', 'ÇAYDANLIK', '["DEM", "SICAK", "BARDAK", "KAHVALTI", "SU"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c41', 'DÖNER', '["ET", "TAVUK", "DÜRÜM", "PİLAV", "DÖNMEK"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c42', 'KÜNEFE', '["PEYNİR", "KADAYIF", "ŞERBET", "HATAY", "SICAK"]', 'Yemek & Mutfak', 'Kolay', 'tr'),
('c43', 'ATARİ', '["KASET", "MARIO", "OYUN", "KOLLAR", "TELEVİZYON"]', '90lar & 2000ler', 'Kolay', 'tr'),
('c44', 'TETRİS', '["BLOK", "KUTU", "DÜŞMEK", "OYUN", "ÇİZGİ"]', '90lar & 2000ler', 'Kolay', 'tr'),
('c45', 'WALKMAN', '["KASET", "KULAKLIK", "PİL", "MÜZİK", "SARMAMAK"]', '90lar & 2000ler', 'Kolay', 'tr'),
('c46', 'TASO', '["CİPS", "POKEMON", "ÇİZGİ", "VURMAK", "OYUN"]', '90lar & 2000ler', 'Kolay', 'tr'),
('c47', 'MSN MESSENGER', '["TİTREŞİM", "DURUM", "GÖZ KIRPMA", "ÇEVRİMİÇİ", "SOHBET"]', '90lar & 2000ler', 'Kolay', 'tr')
ON DUPLICATE KEY UPDATE `main_word` = VALUES(`main_word`);

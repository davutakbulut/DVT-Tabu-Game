-- ==============================================================================
-- 🎮 DVT TABU GAME - MARIADB / MYSQL VERİTABANI ŞEMASI
-- Sunucu: tabu.portegu.com / 213.159.6.158
-- Veritabanı: dvt_tabu
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `dvt_tabu` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dvt_tabu`;

-- 1. CARDS (Tabu Kart Havuzu)
CREATE TABLE IF NOT EXISTS `cards` (
  `id` VARCHAR(36) PRIMARY KEY,
  `main_word` VARCHAR(100) NOT NULL,
  `forbidden_words` JSON NOT NULL, -- 5 adet yasaklı kelime dizi formatında
  `category` VARCHAR(50) NOT NULL,
  `difficulty` ENUM('Kolay', 'Orta', 'Zor') NOT NULL DEFAULT 'Orta',
  `language` VARCHAR(5) NOT NULL DEFAULT 'tr',
  `is_approved` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_difficulty` (`category`, `difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ROOMS (Oyun Odaları)
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

-- 3. TEAMS (Odada Yarışan Takımlar)
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

-- 4. PLAYERS (Oyuncular)
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

-- 5. GAMES (Canlı Maç Durumu)
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

-- 6. TURNS (Tur Hareketleri)
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

-- 7. GAME_HISTORY (Biten Oyun İstatistikleri)
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

-- 8. CUSTOM_DECKS & CUSTOM_CARDS
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

-- 9. AI_INSIGHTS (Gemini Önbellek Tablosu)
CREATE TABLE IF NOT EXISTS `ai_insights` (
  `id` VARCHAR(36) PRIMARY KEY,
  `insight_type` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(50) NULL,
  `content` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# 🏛️ DVT TABU GAME — SİSTEM MİMARİSİ & TEKNİK REHBER (ARCHITECTURE)

Bu belge, **DVT Tabu Game** platformunun mimari katmanlarını, veritabanı şemasını, state yönetimini ve modüller arası veri akışını detaylandırır.

---

## 📐 1. Katmanlı Mimari Şeması

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           KULLANICI ARAYÜZÜ (UI)                        │
│   Next.js 14 App Router • Tailwind CSS • Framer Motion • Lucide Icons  │
│   Sayfalar: / (Ana Sayfa) | /play | /summary | /rooms | /room/[code] | /admin │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    GLOBAL STATE & STORE KATMANI (ZUSTAND)               │
│   • gameStore.ts   : Oyun döngüsü, skorlar, turlar, kelime olayları    │
│   • userStore.ts   : Misafir/Kullanıcı kimliği, VIP durumu, ses/titreşim│
│   • roomStore.ts   : Çok oyunculu lobi, katılımcılar, takımlar, kurallar│
│   • adminStore.ts  : Admin PIN kimlik doğrulaması                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       SERVİS & YARDIMCI KATMANLAR                       │
│   • lib/audio.ts       : Web Audio API tabanlı sentetik ses motoru       │
│   • lib/analytics.ts   : Olay izleme ve telemetri istemcisi             │
│   • lib/game-logic.ts  : Kart karıştırma, altın tur ve kural motoru     │
│   • lib/gemini.ts      : Google Gemini 1.5 Flash AI entegrasyonu        │
│   • lib/supabase.ts    : Supabase Cloud PostgreSQL ve Realtime istemcisi│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                           API ROUTES (BACKEND)                          │
│   /api/cards          : Kelime kartı CRUD & Gemini AI kart üretimi      │
│   /api/decks          : Kategori desteleri CRUD                         │
│   /api/rooms          : Çok oyunculu odalar (oluşturma & listeleme)     │
│   /api/rooms/[code]   : Oda durumu güncelleme, kapatma & silme          │
│   /api/games/analytics: Maç geçmişi, kelime zorluk & başarı analitiği   │
│   /api/games/events   : Canlı oyun içi kart olayları kaydı              │
│   /api/ads            : Reklam CRUD & Strateji yapılandırması           │
│   /api/ads/events     : Reklam tıklama, sayfa ve gösterim telemetrisi   │
│   /api/user/profile   : Kullanıcı profili & istatistikleri              │
│   /api/user/upgrade   : VIP Pro / Reklamsız üyelik yükseltme            │
│   /api/logs           : Merkezi hata ve uyarı logları                   │
│   /api/versions       : Uzaktan zorunlu güncelleme kontrolü             │
│   /api/onboarding     : Dinamik onboarding adımları konfigürasyonu       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    SUPABASE CLOUD POSTGRESQL & REALTIME                 │
│   Tablolar: cards, decks, game_rooms, game_sessions, game_card_events, │
│             ads, ad_events, profiles, user_stats, error_logs, app_config│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 2. Supabase Veritabanı Tablo Şemaları

### A. `cards` (Kelime Kartları)
* `id` (text, PK): Benzersiz kart kimliği (örn: `c-futbol-01`).
* `word` (text): Anlatılacak ana kelime (Büyük harf).
* `forbidden_words` (text[]): 5 adet yasaklı kelime.
* `deck_id` (text, FK): Ait olduğu deste kimliği (`deck-general`, `deck-cinema` vb.).
* `category` (text): Kategori adı.
* `difficulty` (text): `Kolay` | `Orta` | `Zor`.
* `times_played` (int): Kartın kaç kez oynandığı.
* `times_correct` (int): Kaç kez doğru bilindiği.
* `times_tabu` (int): Kaç kez tabu yapıldığı.
* `times_passed` (int): Kaç kez pas geçildiği.
* `created_at` (timestamp): Oluşturulma tarihi.

### B. `decks` (Kelime Desteleri)
* `id` (text, PK): Deste kimliği.
* `name` (text): Deste adı (örn: "Sinema, Dizi & Popüler Kültür").
* `description` (text): Deste açıklaması.
* `color` (text): HEX renk kodu (örn: `#ec4899`).
* `card_count` (int): Desteye ait kart sayısı.
* `is_free` (boolean): Ücretsiz erişilebilir mi?
* `is_active` (boolean): Yayında mı?

### C. `game_rooms` (Çok Oyunculu Canlı Odalar)
* `id` (text, PK): Oda kimliği.
* `code` (text, Unique): 6 haneli oda kodu (örn: `TABU88`).
* `title` (text): Oda başlığı.
* `host_id` (text): Odayı oluşturan kullanıcının kimliği.
* `host_name` (text): Kurucunun görünen adı.
* `is_private` (boolean): Şifreli özel oda mı?
* `pin` (text, Nullable): 4 haneli PIN şifresi.
* `max_players` (int): Maksimum kişi kapasitesi (4-12).
* `status` (text): `waiting` | `in_progress` | `finished` | `closed_by_host` | `closed_by_admin`.
* `closure_reason` (text, Nullable): Kapatılma gerekçesi.
* `settings` (jsonb): Oyun kuralları (süre, pas, tur, zorluk).
* `teams` (jsonb): Takım isimleri, renkleri ve skorları.
* `players` (jsonb): Odadaki aktif oyuncular listesi.
* `created_at`, `updated_at` (timestamp).

### D. `game_sessions` (Maç Geçmişi & Oturumlar)
* `id` (text, PK): Maç kimliği (UUID).
* `game_mode` (text): `single_device` | `multiplayer`.
* `room_code` (text, Nullable): Eğer çok oyunculu ise oda kodu.
* `winner_team_id` (text, Nullable): Kazanan takım.
* `winner_team_name` (text, Nullable): Kazanan takım adı.
* `total_rounds` (int): Oynanan toplam tur.
* `final_scores` (jsonb): Takımların final skorları.
* `total_correct` (int): Maç boyunca yapılan toplam doğru.
* `total_tabu` (int): Yapılan toplam tabu sayısı.
* `total_pass` (int): Kullanılan toplam pas sayısı.
* `ai_summary` (text, Nullable): Gemini AI spor spikeri maç yorumu.
* `status` (text): `in_progress` | `completed` | `abandoned`.
* `created_at`, `completed_at` (timestamp).

### E. `game_card_events` (Kart Başına Canlı Telemetri)
* `id` (text, PK): Olay kimliği.
* `session_id` (text, FK): Ait olduğu maç.
* `card_id` (text): Oynanan kart.
* `word` (text): Karttaki ana kelime.
* `team_id` (text): Hangi takımın sırası olduğu.
* `action` (text): `correct` | `tabu` | `pass`.
* `round_number` (int): Kaçıncı turda gerçekleştiği.
* `duration_seconds` (int): Kelimeye kaç saniye harcandığı.
* `created_at` (timestamp).

### F. `ads` & `ad_events` (Reklam & Telemetri)
* `ads`: `id`, `title`, `description`, `image_url`, `target_url`, `cta_text`, `placement`, `display_type` (`fullscreen` | `popup` | `banner_bottom`), `is_skippable`, `skip_delay_seconds`, `duration_seconds`, `impressions`, `clicks`, `is_active`.
* `ad_events`: `id`, `ad_id`, `ad_title`, `event_type` (`impression` | `click` | `skip` | `completed`), `placement`, `display_type`, `page_url`, `user_id`, `guest_id`, `duration_watched_seconds`, `created_at`.

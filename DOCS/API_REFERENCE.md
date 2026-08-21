# 📡 DVT TABU GAME — REST API REFERANS DOKÜMANI (API REFERENCE)

Bu döküman, sistemde bulunan tüm API uç noktalarını (endpoints), istek formatlarını ve dönen yanıt şemalarını listeler.

---

## 1. 🎴 Kelime Kartları & Deste API'leri

### `GET /api/cards`
Tüm kelime kartlarını veya belirli bir desteye ait kartları getirir.
* **Query Parametreleri:**
  * `deckId` (string, opsiyonel): Filtrelenecek deste kimliği (`deck-general`, `deck-cinema` vb.).
  * `category` (string, opsiyonel): Kategori filtresi.
  * `difficulty` (string, opsiyonel): `Kolay` | `Orta` | `Zor`.
  * `search` (string, opsiyonel): Ana kelime araması.
* **Başarılı Yanıt (200 OK):**
  ```json
  {
    "cards": [
      {
        "id": "c-1",
        "word": "FUTBOL",
        "forbidden_words": ["TOP", "GOL", "MAÇ", "SAHA", "HAKEM"],
        "category": "Spor",
        "difficulty": "Kolay",
        "deck_id": "deck-sports",
        "times_played": 120,
        "times_correct": 85,
        "times_tabu": 15,
        "times_passed": 20
      }
    ]
  }
  ```

### `POST /api/cards`
Yeni bir kelime kartı ekler, toplu kart yükler veya Gemini AI ile otomatik kart üretir.
* **Body (Manuel Ekleme):**
  ```json
  {
    "word": "KAHVE",
    "forbidden_words": ["ÇEKİRDEK", "ESPRESSO", "KAFEİN", "FİNCAN", "SÜT"],
    "deck_id": "deck-general",
    "category": "Genel Kültür",
    "difficulty": "Kolay"
  }
  ```
* **Body (Gemini AI Otomatik Üretim):**
  ```json
  {
    "action": "generate_ai",
    "topic": "Süper Kahramanlar",
    "count": 5,
    "deck_id": "deck-cinema"
  }
  ```

### `GET /api/decks` & `POST /api/decks`
Mevcut desteleri listeler veya yeni deste oluşturur.

---

## 2. 🌐 Çok Oyunculu Odalar (Rooms API)

### `GET /api/rooms`
Açık ve bekleyen tüm oyun odalarını listeler.
* **Query Parametreleri:** `status` (`waiting`, `in_progress`, `all`).

### `POST /api/rooms`
Yeni bir oyun odası kurar.
* **Body:**
  ```json
  {
    "title": "Cuma Gecesi Kapışması",
    "host_id": "gst_8f92",
    "host_name": "Ahmet",
    "is_private": true,
    "pin": "1234",
    "max_players": 8,
    "settings": {
      "turn_duration": 60,
      "pass_limit": 3,
      "total_rounds": 6
    },
    "teams": [
      { "id": "team-1", "name": "Mavi Takım", "color": "#3b82f6" },
      { "id": "team-2", "name": "Kırmızı Takım", "color": "#ef4444" }
    ]
  }
  ```

### `GET /api/rooms/[code]`
Belirtilen oda koduna ait (`TABU88`) anlık verileri döner.

### `PATCH /api/rooms/[code]`
Odanın durumunu günceller (oyun başlatma, host veya admin tarafından odayı kapatma).
* **Body:**
  ```json
  {
    "status": "closed_by_admin",
    "closure_reason": "Bu oyun odası yönetici tarafından sonlandırıldı."
  }
  ```

### `DELETE /api/rooms/[code]`
Odayı veritabanından kalıcı olarak siler.

---

## 3. 📊 Oyun Geçmişi & Analitik API'leri

### `GET /api/games/analytics`
Oynanan tüm maçların geçmişini, kelime zorluk oranlarını ve istatistikleri döner.
* **Yanıt:**
  * `sessions`: Son 50 maçın skorları, kazananları, süreleri ve AI yorumları.
  * `stats`: Toplam maç, tamamlanma oranı, ortalama süre, toplam doğru/tabu/pas.
  * `word_analytics`: En çok doğru bilinen, en çok tabu yapılan ve en zor kelimelerin analizi.

### `POST /api/games/events`
Oyun esnasında anlatılan her kart için anlık telemetri kaydeder (`action: correct | tabu | pass`, `duration_seconds`).

---

## 4. 📢 Reklam & Telemetri API'leri

### `GET /api/ads` & `POST /api/ads`
Aktif reklamları, reklam stratejisini (`frequency_turns`, `default_display_type`, `skip_delay_seconds`) getirir ve günceller.

### `POST /api/ads/events`
Reklam gösterim, tıklama ve geçme olaylarını kaydeder.
* **Body:**
  ```json
  {
    "ad_id": "ad-pro-vip",
    "ad_title": "DVT Tabu Pro VIP",
    "event_type": "click",
    "placement": "match_end",
    "display_type": "fullscreen",
    "page_url": "/summary",
    "duration_watched_seconds": 4,
    "user_id": "user@example.com",
    "guest_id": "gst_8f92"
  }
  ```

### `GET /api/ads/events`
Sayfa bazında gösterim, tıklama, geçilme ve CTR % oranlarını hesaplayıp admin paneline sunar.

# 💰 DVT TABU GAME — MONETİZASYON, REKLAM MOTORU & TELEMETRİ (MONETIZATION & ADS)

Bu belge; reklam motorunun mimarisini, desteklenen gösterim formatlarını, zamanlama/geçme kurallarını ve sayfa bazlı telemetri sistemini detaylandırır.

---

## 📱 1. Reklam Formatları (`AdDisplayType`)

Sistemde 3 farklı modern reklam gösterim formatı bulunmaktadır:

### A. 📱 Tam Ekran (Fullscreen Takeover)
* **Kullanım Yeri:** Maç Sonu (`match_end`) veya Büyük Şampiyonluk anları.
* **Görsel Tasarım:** 100vw / 100vh tam ekran karanlık cam kaplama, arkada ambient ışık huzmesi, üst barda geri sayım sayacı ve sağ üstte atlama butonu.
* **Etkileşim:** Odaklanmış büyük görsel ve belirgin CTA butonu ile maksimum dönüşüm.

### B. 🪟 Popup Modal (Centered Glass Card)
* **Kullanım Yeri:** Tur Araları (`turn_break`) ve Kategori Geçişleri.
* **Görsel Tasarım:** Ortalanmış, şık cam efektli (Glassmorphism) modal kutusu.
* **Etkileşim:** Hızlı okunabilir, akıcı ve kullanıcıyı oyundan koparmayan yapı.

### C. 📌 Alt Banner (Floating Bottom Banner Drawer)
* **Kullanım Yeri:** Lobi ve Oyun İçi bekleme anları.
* **Görsel Tasarım:** Ekranın altından kayarak çıkan kompakt sponsor kartı.
* **Etkileşim:** Oyun akışını engellemeden sponsor tanıtımı.

---

## ⏱️ 2. Zamanlama, Süre & Geçilebilirlik Motoru

Her reklam için ayrı ayrı veya küresel stratejiden (`AdConfig`) şu ayarlar yönetilir:

1. **`is_skippable: true` (Geçilebilir Reklam):**
   * Kullanıcıya belirtilen `skip_delay_seconds` (örn: 3 saniye) kadar geri sayım gösterilir.
   * Sayaç sıfırlandığında **"Reklamı Geç"** butonu aktifleşir.
2. **`is_skippable: false` (Zorunlu / Geçilemez Reklam):**
   * Kullanıcı `duration_seconds` (örn: 5 saniye) boyunca reklamı izler, süre dolunca otomatik olarak oyuna döner.
3. **VIP Kullanıcı Muafiyeti:**
   * `is_pro: true` veya `is_vip: true` olan kullanıcılar için reklam motoru tamamen devre dışı kalır.

---

## 📊 3. Sayfa Bazlı Telemetri & Tıklama Analitiği

Her reklam etkileşiminde `/api/ads/events` uç noktasına şu veriler işlenir:
* **`page_url`:** Reklamın görüntülendiği ve tıklandığı sayfa rotası (`/play`, `/summary`, `/rooms`, `/`).
* **`event_type`:** `impression` (Gösterim), `click` (Tıklama), `skip` (Geçildi), `completed` (Tamamlandı).
* **`duration_watched_seconds`:** Kullanıcının reklamı kaç saniye izlediği (Dwell Time).
* **`guest_id` / `user_id`:** Etkileşimde bulunan kullanıcının kimliği.

Admin paneli üzerinden her sayfa için anlık **Dönüşüm Oranı (CTR %)** şu formülle hesaplanır:
$$\text{CTR \%} = \left( \frac{\text{Toplam Tıklama}}{\text{Toplam Gösterim}} \right) \times 100$$

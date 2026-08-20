# 🗺️ DVT TABU GAME — PROJE YOL HARİTASI & MİMARİ REHBERİ

Bu doküman, **DVT Tabu Game** projesinin GitHub Project panosu, mimari şeması, çoklu cihaz senkronizasyon protokolü ve Gemini AI servisinin tüm detaylarını içermektedir.

---

## 📌 1. GitHub Repo & Project Panosu Bağlantıları
- **GitHub Deposu (Repository):** [https://github.com/davutakbulut/DVT-Tabu-Game](https://github.com/davutakbulut/DVT-Tabu-Game)
- **GitHub Project Board (Kanban):** [https://github.com/users/davutakbulut/projects/4](https://github.com/users/davutakbulut/projects/4)

### Otomatik Görev Yönetimi (`manage_github_tasks.py`)
Terminalden tek bir komutla görevleri `Todo` -> `In Progress` -> `Done` kolonları arasında taşıyabilirsiniz:
```bash
# Panoyu listele
python3 manage_github_tasks.py

# Issue #1'i In Progress yap
python3 manage_github_tasks.py 1 in_progress

# Issue #1'i Done yap
python3 manage_github_tasks.py 1 done
```

---

## 🎮 2. ÇOK CİHAZLI OYUN (CROSS-DEVICE) & ŞİFRELİ ODA PROTOKOLÜ

```
                +------------------------------------+
                |        HOST (ODA KURUCUSU)         |
                |  - 6 Haneli Kod Üretimi (TABU88)   |
                |  - PIN Şifresi Belirleme (1234)    |
                |  - Kural & Süre Özelleştirme       |
                +-----------------+------------------+
                                  |
               Supabase Realtime Broadcast & Presence
                                  |
     +----------------------------+----------------------------+
     |                                                         |
+----+----------------------+                   +--------------+-------------+
|    AKTİF ANLATICI CİHAZI   |                   |    RAKİP OYUNCU CİHAZI      |
|  - Ana Kelime Açık         |                   |  - Kart Kapalı (Gizli)      |
|  - 5 Yasaklı Kelime Açık   |                   |  - Dev BUZZER Butonu        |
|  - Doğru (+1) & Pas Butonu |                   |  - İhlal Anında Kilitleme   |
+---------------------------+                   +----------------------------+
```

### Oda Ayarları (Customizable Rules)
- **Oda Kodu:** 6 haneli benzersiz alfa-numerik kod.
- **Şifreli Katılım:** İsteğe bağlı 4 haneli PIN şifresi.
- **Tur Süresi:** 30sn ile 120sn arası serbest ayar.
- **Pas Hakkı:** Tur başına 0 - 5 hak (Varsayılan: 3).
- **Buzzer Cezası:** Yasaklı kelimede -1 veya -2 ceza puanı.
- **Takım Yönetimi:** 2 - 4 takım (Mavi, Kırmızı, Yeşil, Sarı).

---

## 🤖 3. GOOGLE GEMINI AI SERVİSİ (`gemini_advisor.py`)

Canlı Gemini servisi 4 ana modülden oluşur:
1. **📊 Günlük Kategori & Mod Önerisi:** Veritabanındaki trendlere göre günlük oyun modları ve öne çıkan kart üretir.
2. **🎙️ Oyun Sonu AI Maç Spikeri:** Biten maçın skorlarını ve MVP oyuncusunu esprili bir dille analiz eder.
3. **🃏 Akıllı Deste Üreticisi (Deck Generator):** Kullanıcının girdiği temaya göre Tabu kartları (1 ana + 5 yasaklı kelime) üretir.
4. **⚖️ Dinamik Zorluk Dengeleyici:** Skor farkı açıldığında gerideki takıma adil süre/joker önerir.

Test etmek için:
```bash
python3 gemini_advisor.py
```

---

## 📦 4. VERİTABANI & KURULUM ADIMLARI

1. **Supabase SQL:**
   - `supabase/migrations/001_initial_schema.sql` dosyasını Supabase SQL editöründe çalıştırın.
   - `supabase/seed_cards.sql` dosyasını çalıştırarak 100+ başlangıç kartını yükleyin.

2. **Ortam Değişkenleri (`.env.local`):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

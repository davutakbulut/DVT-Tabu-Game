# 🎮 DVT Tabu Game — AI Destekli Gerçek Zamanlı Çok Oyunculu Tabu Arenası

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready_%26_Installable-FF6F00?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

> **DVT Tabu Game**, klasik Tabu kutu oyunu deneyimini modern web teknolojileri, çok cihazlı gerçek zamanlı çok oyunculu (cross-device multiplayer) altyapısı ve Google Gemini yapay zeka motoru ile birleştiren yeni nesil bir **Progressive Web App (PWA)** platformudur.

---

## 🌟 Diğer Tabu Oyunlarından Farkları ve Getirdiği Yenilikler

Geleneksel Tabu mobil uygulamaları ve web siteleri genellikle tek bir cihazın elden ele gezdirildiği, statik kelime havuzlarına sıkışmış, hileye açık ve yapay zekadan yoksun deneyimler sunar. **DVT Tabu Game** bu sınırları yıkar:

| Özellik | Geleneksel Tabu Uygulamaları | 🚀 DVT Tabu Game |
|---|---|---|
| **Çoklu Cihaz (Cross-Device)** | ❌ Yok (Sadece tek telefon devredilir) | ✅ **Var:** Herkes kendi telefonundan bağlanır. Anlatıcı kartı görür, rakip takım ekranında dev **BUZZER** butonu belirir! |
| **Gözetleme & Hile Engelleme** | ❌ Yok (Yanındakiler ekrana bakar) | ✅ **Rol Bazlı Ekran:** Kart sadece aktif anlatıcıya açıktır. Seyirciler ve takım arkadaşları sadece süreyi görür, kelimeler gizlenir. |
| **Yapay Zeka (AI) Desteği** | ❌ Yok | ✅ **Google Gemini Entegrasyonu:** Günlük trend bülteni, özel tema için anında kart üretici ve maç sonu esprili AI spor spikeri. |
| **Oda Güvenliği & PIN Koruması** | ❌ Yok | ✅ **6 Haneli Kod + 4 Haneli PIN:** Arkadaş gruplarınız veya şirket içi etkinlikleriniz için şifreli özel odalar. |
| **Kural Özelleştirme** | ❌ Katı/Sabit Kurallar | ✅ **Tam Esneklik:** Tur süresi (30-120sn), pas limiti (0-5), ceza puanları (-1/-2/0) ve kategori filtreleri serbestçe ayarlanabilir. |
| **Eşitlik Bozma (Altın Tur)** | ❌ Beraberlikte oyun biter | ✅ **Otomatik Altın Tur:** Beraberlik durumunda heyecan bitmez; eşitlik bozulana kadar uzatma turu tetiklenir. |
| **Ses & Dokunsal Hissiyat** | ⚠️ Ağır MP3 dosyaları veya sessiz | ✅ **Saf Web Audio API + Haptics:** Sıfır gecikmeli sentezleyici sesler ve Vibration API dokunsal geri bildirim. |
| **Kurulum & Platform** | ❌ App Store / Play Store indirme zorunluluğu | ✅ **Anında PWA:** İndirme gerekmez, tarayıcıdan açılır veya tek tıkla ana ekrana "Uygulama" olarak yüklenir. |

---

## 🎯 Temel Oyun Modları

### 1. 📱 Mod A: Tek Cihazda Oyna (Pass-and-Play)
- İnternet bağlantısı olmasa bile gömülü 100+ kartlık havuzla anında başlar.
- Cihaz sırayla takımların anlatıcılarına devredilir.
- Anlatıcı kartı tam görür (ana kelime + 5 yasaklı kelime).
- Süre akarken **Doğru (+1)**, **Pas (0)** ve **Tabu / Buzzer (-1)** butonları kullanılır.
- Tur sonu anlık skor tablosu gösterilir ve sonraki takıma geçilir.

### 2. 🌐 Mod B: Çok Cihazlı Canlı Oda (Real-Time Multiplayer)
Her oyuncunun kendi cihazından bağlandığı profesyonel oyun modu:
```
                ┌────────────────────────────────────┐
                │        HOST (ODA KURUCUSU)         │
                │  - 6 Haneli Kod Üretimi (TABU88)   │
                │  - PIN Şifresi Belirleme (1234)    │
                │  - Kural & Süre Özelleştirme       │
                └─────────────────┬──────────────────┘
                                  │
               Supabase Realtime Broadcast & Presence
                                  │
     ┌────────────────────────────┴────────────────────────────┐
     │                                                         │
┌────┴──────────────────────┐                   ┌──────────────┴─────────────┐
│    AKTİF ANLATICI CİHAZI   │                   │    RAKİP OYUNCU CİHAZI      │
│  - Ana Kelime Açık         │                   │  - Kart Kapalı (Gizli)      │
│  - 5 Yasaklı Kelime Açık   │                   │  - Dev Kırmızı BUZZER       │
│  - Doğru (+1) & Pas Butonu │                   │  - İhlal Anında Kilitleme   │
└───────────────────────────┘                   └────────────────────────────┘
```

- **Host (Oda Kurucusu):** 6 haneli oda kodu üretir, dilerse 4 haneli PIN şifresi koyar ve oyun kurallarını belirler.
- **Aktif Anlatıcı Cihazı:** Sadece sıradaki takımın anlatıcısı karttaki kelimeleri okuyabilir; Doğru ve Pas kontrollerine sahiptir.
- **Rakip Takım Cihazı:** Anlatıcıyı dinleyen rakiplerin ekranında dev bir **Kırmızı BUZZER** butonu yer alır. Anlatıcı yasaklı kelime söylerse rakip butona basar; ses çalar, puan düşer (-1) ve tur anında kilitlenir.
- **Takım Arkadaşları & Seyirciler:** Kelimeler gizlenir (perde arkasında kalır), sadece süre sayacı ve canlı skor panosu görünür.

---

## 🤖 Google Gemini Yapay Zeka Özellikleri

DVT Tabu Game, Google'ın en yeni **Gemini 3.5 / 3.6 Flash** modelini kullanarak oyuna akıllı asistan yetenekleri kazandırır:

1. **📊 Günlük AI Oyun Bülteni & Kategori Önerisi:**
   - Ana sayfada her gün yenilenen yapay zeka bülteni yer alır.
   - Örnek: *"Bugün Lahmacun kelimesi rekor hızda bilindi! Mutfak Sanatları kategorisinde 45 saniyelik Hızlı Mod deneyin."*
   - Tek tıkla önerilen ayarlarla oyunu başlatma imkanı.

2. **🃏 Gemini Özel Deste Üreticisi (Custom Deck Generator):**
   - Kullanıcının girdiği herhangi bir temaya göre (Örn: *"90'lar Türk Popu"*, *"Marvel Evreni"*, *"Yazılımcı Terimleri"*) saniyeler içinde 1 ana kelime ve 5 yasaklı kelimeden oluşan dengeli Tabu kartları üretir.
   - Üretilen kartlar anında oyuna ve desteye dahil edilir.

3. **🎙️ Oyun Sonu AI Maç Spikeri Raporu:**
   - Oyun bittiğinde tüm skorları, doğru/pas oranlarını ve buzzer cezalarını analiz eder.
   - Esprili bir spor spikeri ağzıyla maç değerlendirmesi, MVP oyuncu seçimi ve takımlara özel taktiksel tavsiyeler sunar.

4. **⚖️ Dinamik Zorluk Dengeleyici:**
   - Takımlar arasındaki skor farkı çok açıldığında gerideki takıma adil süre veya ekstra pas jokeri önerir.

---

## 🔊 Ses Efektleri, Titreşim & PWA Yetenekleri

- **Saf Web Audio API Sentezleyici:** Harici ses dosyası indirmeye gerek kalmadan tarayıcı frekans osilatörleriyle üretilen sesler:
  * 🔔 **Doğru:** Neşeli ve tiz çift ton (Ding!)
  * 🚨 **Tabu / Buzzer:** Sert ve uyarıcı çift testere dişi dalgası (BZZZZ!)
  * 💨 **Pas:** Frekans süpürme efekti (Whoosh)
  * ⏱️ **Geri Sayım:** Son 10 saniyede gerilimi artıran tıkırtı sesleri (Ticking)
  * 🎺 **Şampiyonluk:** Zafer melodisi ve konfeti animasyonu (Fanfare)
- **Haptic Titreşim (Vibration API):** Doğru bilme (+1), pas ve buzzer basımlarında fiziksel titreşim geri bildirimi.
- **Ekran Kararmasını Önleme (Wake Lock API):** Heyecanlı turlar sırasında cihaz ekranının kararmasını veya kapanmasını otomatik olarak engeller.
- **PWA Desteği:** iOS Safari ve Android Chrome üzerinden *"Ana Ekrana Ekle"* yapılarak internet yokken dahi tam ekran native uygulama gibi çalışır.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Frontend Framework:** Next.js 14+ (App Router, Strict TypeScript, React 18)
- **Stil & Tasarım:** Tailwind CSS v3.4+ (Dark Mode, Glassmorphism, Responsive Breakpoints)
- **Animasyonlar:** Framer Motion (Akıcı kart çevirme ve sayfa geçişleri) + Canvas Confetti
- **State Yönetimi:** Zustand (Hafif ve reaktif store yapısı)
- **Backend & Gerçek Zamanlı Veritabanı:** Supabase (PostgreSQL, Realtime Broadcast, Row Level Security)
- **Yapay Zeka:** Google Gemini 3.5/3.6 Flash API (`/api/ai/suggest`)
- **İkonlar:** Lucide React

---

## 🗄️ Veritabanı Şeması (PostgreSQL / Supabase)

Projede kullanılan ana tablolar:
1. `cards`: Ana kelime, 5 yasaklı kelime, kategori, zorluk ve dil verileri.
2. `rooms`: 6 haneli oda kodu, host bilgisi, 4 haneli PIN şifresi (`password_hash`) ve JSON formatında özelleştirilebilir kural ayarları.
3. `teams`: Mavi, Kırmızı, Yeşil, Sarı takımları, skorları ve renk kodları.
4. `players`: Odaya katılan misafirler/kullanıcılar, takım atamaları, hazır durumu ve anlatıcı bayrağı.
5. `games`: Canlı maç durumu, kalan süre, kalan pas hakkı ve buzzer kilidi.
6. `turns`: Her turun aksiyon kayıtları (doğru, pas, buzzer, süre aşımı).
7. `game_history`: Biten oyunların skorları ve Gemini AI maç analizi raporları.
8. `custom_decks` & `custom_cards`: Kullanıcıların ve yapay zekanın ürettiği özel paketler.
9. `ai_insights`: Gemini önerilerinin 24 saatlik önbellek tablosu.

> SQL migration dosyasına [`supabase/migrations/001_initial_schema.sql`](file:///Users/davutakbulut/Documents/antigravity/calm-salk/supabase/migrations/001_initial_schema.sql) adresinden, 100+ başlangıç kartı seed verisine [`supabase/seed_cards.sql`](file:///Users/davutakbulut/Documents/antigravity/calm-salk/supabase/seed_cards.sql) adresinden erişebilirsiniz.

---

## 🚀 Hızlı Başlangıç & Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/davutakbulut/DVT-Tabu-Game.git
cd DVT-Tabu-Game
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın
`.env.example` dosyasını `.env.local` olarak kopyalayın ve anahtarlarınızı girin:
```env
# Google Gemini API Anahtarı (Server-side)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Veritabanı ve Realtime (Opsiyonel - Yerel modda otomatik çalışır)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### 5. Üretim Derlemesi (Production Build)
```bash
npm run build
npm start
```

---

## 📋 GitHub Project Board & Görev Yönetimi

Projenin geliştirme süreci ve görevleri GitHub Project Kanban panosu üzerinde takip edilmektedir:
- **Kanban Panosu:** [https://github.com/users/davutakbulut/projects/4](https://github.com/users/davutakbulut/projects/4)

Görevlerin durumunu terminalden değiştirmek için:
```bash
# Panodaki tüm görevleri listele
python3 manage_github_tasks.py

# Bir görevi In Progress durumuna taşı
python3 manage_github_tasks.py 13 in_progress

# Bir görevi Done durumuna taşı
python3 manage_github_tasks.py 13 done
```

---

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Dilediğiniz gibi geliştirebilir, dağıtabilir ve özelleştirebilirsiniz.

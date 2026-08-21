# 🎮 DVT Tabu Game — AI Destekli & Gerçek Zamanlı Çok Oyunculu Tabu Platformu

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready_%26_Installable-FF6F00?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

> **DVT Tabu Game**, klasik Tabu kutu oyunu deneyimini modern web teknolojileri, çok cihazlı gerçek zamanlı çok oyunculu (cross-device multiplayer) mimarisi, dinamik reklam motoru ve Google Gemini yapay zeka entegrasyonu ile birleştiren yeni nesil bir **Progressive Web App (PWA)** platformudur.

---

## 📚 Proje Dokümantasyonu & Geliştirici Rehberi

Bu proje üzerinde geliştirme yapacak geliştiriciler ve yapay zeka (AI) ajanları için hazırlanmış detaylı teknik kılavuzlar:

| Belge | Açıklama |
| :--- | :--- |
| [📜 RULES.md](./RULES.md) | **Kesin Kurallar:** Sıfır ham emoji politikası, %100 dinamik veritabanı, güvenlik ve UI/UX standartları. |
| [🏛️ ARCHITECTURE.md](./ARCHITECTURE.md) | **Sistem Mimarisi:** Katmanlar, Supabase PostgreSQL tablo şemaları, Zustand store'ları ve veri akışı. |
| [🔄 DOCS/WORKFLOW_AND_FLOWS.md](./DOCS/WORKFLOW_AND_FLOWS.md) | **Uygulama Akışları:** Onboarding, misafir/VIP üyelik, tek/çok oyunculu oyun döngüsü ve canlı oda kapatma. |
| [📡 DOCS/API_REFERENCE.md](./DOCS/API_REFERENCE.md) | **REST API Referansı:** Kart, deste, oda, reklam, log ve analitik API uç noktalarının tam dökümü. |
| [💰 DOCS/MONETIZATION_AND_ADS.md](./DOCS/MONETIZATION_AND_ADS.md) | **Reklam Motoru:** Tam Ekran, Popup ve Alt Banner formatları, geçilme süreleri ve sayfa bazlı CTR analitiği. |
| [🛡️ DOCS/ADMIN_PANEL_GUIDE.md](./DOCS/ADMIN_PANEL_GUIDE.md) | **Admin Paneli:** CMS, Gemini AI kart üretici, canlı oda moderasyonu, log merkezi ve analitik sekmeleri. |
| [📊 DOCS/ANALYTICS_AND_REPORTS.md](./DOCS/ANALYTICS_AND_REPORTS.md) | **Analitik & Raporlar:** Kelime zorluk skorları, maç geçmişi ve dönüşüm hunisi (funnel) hesaplama mantığı. |

---

## 🌟 Temel Yetenekler & Özellikler

1. **📱 Tek Cihazda Oyna (Pass-and-Play):** Cihazı sırayla anlatıcılara devrederek internet olmasa bile anında oynayabilme.
2. **🌐 Çok Oyunculu Canlı Lobi (Multiplayer):** 4 adımlı sihirbaz ile oda kurma, 6 haneli oda kodu + 4 haneli PIN ile şifreli odalar oluşturma ve her oyuncunun kendi telefonundan katılması.
3. **🚨 Canlı Oda Moderasyonu:** Admin veya Kurucu odayı kapattığında oyundaki tüm oyunculara canlı modal uyarı gönderilip ana sayfaya yönlendirilmesi.
4. **🤖 Google Gemini AI:** Maç sonu esprili spor spikeri maç yorumları ve tek tıkla yeni tematik Tabu kartları üretme.
5. **📢 Gelişmiş Reklam & Gelir Motoru:** Tam Ekran Takeover, Popup Modal ve Alt Banner gösterimleri, ayarlanabilir geçme süreleri ve sayfa bazlı CTR analitiği.
6. **🎵 Web Audio & Haptics:** Sıfır gecikmeli sentetik ses efektleri ve dokunsal titreşim geri bildirimleri.

---

## 🛠️ Kurulum & Yerel Geliştirme

```bash
# 1. Repoyu klonlayın
git clone https://github.com/davutakbulut/DVT-Tabu-Game.git
cd DVT-Tabu-Game

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini (.env.local) yapılandırın
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın:
* **Uygulama:** [http://localhost:3000](http://localhost:3000)
* **Oyun Odaları:** [http://localhost:3000/rooms](http://localhost:3000/rooms)
* **Admin Kontrol Paneli:** [http://localhost:3000/admin](http://localhost:3000/admin) *(Varsayılan PIN: `1234`)*

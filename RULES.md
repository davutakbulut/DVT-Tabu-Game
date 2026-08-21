# 📜 DVT TABU GAME — YAZILIM & GELİŞTİRME KURALLARI (RULES & STANDARDS)

Bu belge, projede geliştirme yapacak tüm yazılımcılar, mimarlar ve yapay zeka (AI) ajanları için **kesinlikle uyulması zorunlu kuralları** içerir. Proje üzerinde yapılacak tüm değişiklikler bu standartlara uygun olmalıdır.

---

## 🚫 1. EMOJİ KULLANIM KURALI (ZERO RAW EMOJI POLICY)
* **KURAL:** Kod tabanında (UI, butonlar, modallar, bildirimler, başlıklar) **asla ham Unicode emoji (örn: 🎮, 🔥, 🏆, ❌, ✅) KULLANILMAZ.**
* **STANDART:** Tüm görsel simgeler için `lucide-react` kütüphanesinden uygun SVG ikonlar import edilerek kullanılır (`<Trophy />`, `<Gamepad2 />`, `<Flame />`, `<Sparkles />`, `<X />`, `<Check />` vb.).
* **İSTİSNA:** Yalnızca AI tarafından üretilen esprili maç sonu spiker yorumlarında veya markdown döküman dosyalarında emoji bulunabilir. React bileşenlerinde ham emoji yasaktır.

---

## 🗄️ 2. %100 DİNAMİK VERİTABANI PERSISTENCE KURALI
* **KURAL:** Projedeki hiçbir veri statik veya sadece bellekte (in-memory) kalıcı olamaz.
* **STANDART:** 
  * Tüm kelime kartları (`cards`), desteler (`decks`), oyun odaları (`game_rooms`), oynanan maçlar (`game_sessions`), kelime bazlı olaylar (`game_card_events`), reklamlar (`ads`), reklam etkinlikleri (`ad_events`), kullanıcı profilleri (`profiles`), hata logları (`error_logs`) ve sürüm/onboarding yapılandırmaları **Supabase Cloud PostgreSQL** üzerinde saklanır ve oradan dinamik olarak çekilir.
  * Veritabanı bağlantısı geçici olarak kesilirse bile sistem "in-memory fallback" ile çökmeyecek şekilde çalışmalı, bağlantı kurulduğu anda veriler Supabase'e yazılmalıdır.

---

## 🔐 3. GÜVENLİK & GİT PUSH KURALI (ZERO-SECRET POLICY)
* **KURAL:** API Key'ler, JWT Secret'lar ve veritabanı şifreleri asla Git reposuna commit EDİLEMEZ.
* **STANDART:** `.env` ve `.env.production` dosyaları `.gitignore` içerisinde kalmalıdır. Ortam değişkenleri `process.env.NEXT_PUBLIC_...` üzerinden okunur.

---

## 🎨 4. TASARIM & UI/UX STANDARTLARI (DESIGN SYSTEM)
* **Tema:** Dark Cyberpunk / Modern Dark Glassmorphism.
* **Arka Plan:** `bg-slate-950` ve koyu slate tonları (`slate-900`, `slate-850`).
* **Vurgu Renkleri:** Neon Indigo (`#6366f1`), Zümrüt Yeşili (`#10b981`), Canlı Amber (`#f59e0b`), Parlak Gül Kırmızı (`#f43f5e`).
* **Cam Efekti:** `backdrop-blur-md`, `bg-slate-900/80`, `border-slate-800/80`.
* **Butonlar:** 3D Hissiyatlı derinlik sınıfları (`btn-3d-indigo`, `btn-3d-emerald`, `btn-3d-rose`, `btn-3d-amber`).
* **Mobil Uyumluluk:** Mobile-first tasarım; tüm ekranlar `max-w-lg mx-auto` içinde iPhone, Android ve Masaüstünde kusursuz ortalanır.

---

## 🔊 5. SES & HAPTIC FEEDBACK STANDARTLARI
* **Ses Motoru:** Harici ağır ses dosyaları yerine `lib/audio.ts` içerisinde Web Audio API osilatör sentezleyicileri (`correct`, `tabu`, `pass`, `tick`, `victory`, `start`, `warning`) kullanılır.
* **Titreşim (Haptic):** Anlatıcı ve seyirci aksiyonlarında `navigator.vibrate([ms])` ile dokunsal tepki verilir.

---

## 📊 6. ANALİTİK & TELEMETRİ ZORUNLULUĞU
* Kullanıcı bir maça başladığında `game_sessions` oluşturulur.
* Her kelime anlatıldığında `game_card_events` tablosuna `correct`, `tabu` veya `pass` olarak, harcanan süreyle birlikte log atılır.
* Her reklam gösterildiğinde, tıklandığında veya geçildiğinde `page_url`, `duration_watched_seconds` ve `guest_id` ile `ad_events` tablosuna telemetri gönderilir.

---

## 🛡️ 7. ODA YÖNETİMİ & GERÇEK ZAMANLI BİLDİRİM KURALI
* Admin veya Oda Kurucusu (Host) bir odayı kapattığında (`closed_by_admin` veya `closed_by_host`), odada bulunan tüm kullanıcılara otomatik olarak modal uyarı çıkar ve ana sayfaya (`/`) yönlendirilir.

# 🔄 DVT TABU GAME — UYGULAMA AKIŞLARI & KULLANICI DENEYİMİ (WORKFLOWS & FLOWS)

Bu belge, bir kullanıcının uygulamaya ilk adımından oyunun sonuna kadar geçen tüm akışları, durum geçişlerini ve kuralları açıklar.

---

## 🚀 1. İlk Giriş & Onboarding Akışı (`OnboardingModal.tsx`)
1. **Misafir Kimliği Üretimi:** Kullanıcı ilk kez girdiğinde `userStore.ts` devreye girer. Tarayıcıda `guestId` (`gst_XXXX`) ve rastgele eğlenceli bir takma ad (`guestName`, örn: "Hızlı Anlatıcı 42") üretilir ve `localStorage` içine kaydedilir.
2. **Onboarding Tetiklenmesi:** Eğer `hasSeenOnboarding` false ise tam ekran interaktif Onboarding Sihirbazı açılır.
3. **Adımlar:**
   * **Adım 1:** "DVT Tabu'ya Hoş Geldin" — Eğlenceli tanıtım ve temel dinamikler.
   * **Adım 2:** "Yasaklı Kelimelere Dikkat!" — 5 tabu kelimenin kuralı ve ceza puanları.
   * **Adım 3:** "Çok Cihazlı Canlı Lobi" — Kendi telefonundan bağlanma ve Buzzer mekaniği.
   * **Adım 4:** "Hemen Başla!" — Ses/titreşim izinleri ve oyuna giriş.
4. **Kapatılma:** "Başla" butonuna tıklandığında `hasSeenOnboarding: true` yapılır ve Supabase `profiles` tablosuna misafir kaydı yazılır.

---

## 🔐 2. Kimlik Durumları & Giriş Modları (`AuthModal.tsx` & `userStore.ts`)
Uygulamada 3 farklı kullanıcı durumu mevcuttur:

1. **Misafir (Guest) Modu:**
   * Hiçbir kayıt gerektirmez, tek tıkla başlar.
   * Maç geçmişi, kazanma oranları ve kelime başarıları cihazın `guest_id` kimliğine bağlanır.
2. **Kayıtlı Kullanıcı (Supabase Auth):**
   * E-posta ve şifre ile giriş yapılır.
   * Veriler bulut profiliyle eşleşir, farklı cihazlardan erişilebilir.
3. **VIP Pro / Reklamsız Üye:**
   * `is_pro: true` veya `is_vip: true` durumudur.
   * Reklam motoru bu kullanıcılara hiçbir reklam (`InterstitialAdModal`) göstermez.
   * Kilitli tüm destelere sınırsız erişim sağlanır.

---

## 🎮 3. Oyun Akışları

### A. Tek Cihazda Oyna (Pass-and-Play) Akışı
```
[Ana Sayfa /] 
     │
     ▼
[Oyun Ayarları & Takım Seçimi Modalı] (Süre, Pas, Tur, Deste)
     │
     ▼
[/play] (Tur Başlangıç Ekranı -> Sıradaki Takım: Mavi Şimşekler)
     │
     ▼
[Geri Sayım & Kart Akışı] (Doğru +1 / Pas / Tabu -1)
     │
     ▼
[Tur Sonu Özeti] (Tur Puanı & Toplam Puan) -> [Varsa Reklam Gösterimi]
     │
     ▼
[Tüm Turlar Tamamlandı mı?] ──(Hayır)──> [Sonraki Takım Turuna Geç]
     │ (Evet)
     ▼
[Beraberlik Var mı?] ──(Evet)──> [🔥 ALTIN TUR (Golden Round) Tetikle]
     │ (Hayır)
     ▼
[/summary] (Şampiyonluk Kutlaması, Konfeti, AI Spiker Yorumu, Detaylı İstatistikler)
```

### B. Çok Oyunculu Canlı Oda (Multiplayer) Akışı
```
[Ana Sayfa /] ──> [/rooms]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  [YENİ ODA KUR]          [KOD / PIN İLE GİR]
  (4 Adımlı Sihirbaz)      (TABU88 + PIN)
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
             [/room/[code] Lobisi]
                     │
   ┌─────────────────┴─────────────────┐
   │ Host Kontrolleri:                 │
   │ • Takımları Düzenle               │
   │ • Kuralları Ayarla (Süre/Pas)     │
   │ • Oyunu Başlat                    │
   │ • Odayı Kapat & Dağıt (Host Exit) │
   └─────────────────┬─────────────────┘
                     │
     Host "Oyunu Başlat"a bastığında
                     │
                     ▼
        [Tüm Cihazlarda /play Başlar]
```

---

## ⚠️ 4. Canlı Oda Kapatma & Müdahale Akışı
1. Eğer **Admin** (`/admin` panelinden) veya **Oda Kurucusu (Host)** odayı kapatırsa:
2. `/api/rooms/[code]` adresine `PATCH` atılarak `status = 'closed_by_admin'` veya `status = 'closed_by_host'` yapılır.
3. `/room/[code]` sayfasındaki tüm bağlı cihazlar bu durum değişikliğini anında yakalar.
4. Ekrana kilitli **"⚠️ Oyun Odası Kapatıldı"** modalı açılır.
5. Kullanıcı **"Anladım, Ana Sayfaya Dön"** butonuna basarak güvenle `/` rotasına yönlendirilir.

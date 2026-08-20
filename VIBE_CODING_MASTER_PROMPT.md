# 🎮 DVT TABU GAME — MASTER VIBE CODING PROMPT (TEK SEFERDE KOPYALA-YAPIŞTIR)

> **KULLANIM:** Bu dosyanın tamamını kopyalayıp Cursor Composer, Bolt.new, Replit Agent, v0 veya Windsurf gibi herhangi bir Vibe Coding yapay zeka aracına doğrudan yapıştırabilirsiniz. Ajanın aklında hiçbir soru işareti kalmayacak şekilde tüm mimari, veritabanı şeması, çoklu cihaz kuralları, şifreli odalar ve Gemini AI entegrasyonu tanımlanmıştır.

---

```markdown
# GÖREV: DVT TABU GAME — FULL STACK REALTIME PWA (CROSS-DEVICE MULTIPLAYER & AI INTEGRATED)

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL + Realtime + Auth) + Zustand + Framer Motion + Google Gemini API kullanarak ultra akıcı, modern ve mobil öncelikli bir Tabu Progressive Web App (PWA) geliştir.

---

## 1. 🏗️ TEKNOLOJİ YIĞINI & MİMARİ
- **Framework:** Next.js 14+ (App Router, Client Components: `'use client'`, Server Routes: `/api/*`)
- **Dil:** TypeScript (Strict Mode, 0 any type toleransı)
- **Stil & Tasarım:** Tailwind CSS v3.4+ (Indigo-Pink-Emerald-Amber temaları, Dark/Light Mode, Glassmorphism)
- **State Yönetimi:** Zustand (Client-side Game, Room, User stores)
- **Backend & Gerçek Zamanlı İletişim:** Supabase (PostgreSQL, Supabase Realtime Broadcast & Presence, Anonymous + OAuth Auth)
- **Yapay Zeka:** Google Gemini 3.5/3.6 Flash API (`/api/ai/suggest`)
- **Ses & Hissiyat:** Howler.js (Ses efektleri) + Web Vibration API (Haptic Feedback) + Screen Wake Lock API (Ekran açık kalma)
- **PWA:** `next-pwa`, `manifest.json`, Service Worker, Standalone display, iOS splash & safe-area insets

---

## 2. 🎯 OYUN MODLARI & ÇOKLU CİHAZ (CROSS-DEVICE) MEKANİĞİ

### Mod A: Tek Cihazda Oyna (Pass-and-Play / Yerel Mod)
- Cihaz elden ele dolaşır.
- Anlatıcı kartı görür (ana kelime + 5 yasaklı).
- Süre akarken Doğru (+1), Pas (0) ve Buzzer (-1) butonlarına basılır.
- Tur sonu skor gösterilir, sonraki takımın anlatıcısına cihaz devredilir.

### Mod B: Çok Cihazlı Online Oda (Real-Time Multiplayer with Room Codes & Password PIN)
1. **Oda Kurma (Host):**
   - 6 haneli benzersiz oda kodu üretilir (Örn: `TABU88`).
   - İsteğe bağlı 4 haneli PIN şifresi (`is_private`, `password_hash`).
   - **Kural Özelleştirme:**
     * Tur Süresi: 30 - 120 saniye (Slider)
     * Pas Limiti: 0 - 5 hak (Varsayılan: 3)
     * Kural İhlali / Buzzer Cezası: -1 puan, -2 puan veya 0 puan
     * Doğru Puanı: +1
     * Hedef Skor veya Toplam Tur Sayısı: 4, 6, 8, 10 tur
     * Kategori Seçimi: Genel Kültür, Sinema, Spor, Teknoloji, Mutfak, vb.
     * Özel Deste (Custom Deck) Seçimi
2. **Odaya Katılma (Oyuncular):**
   - Açık odalar listesinden veya doğrudan 6 haneli kod + PIN şifresiyle giriş yapılır.
   - Her oyuncu takma adını (Guest Name) ve avatarını seçer.
   - Takım Seçimi: Mavi Şimşekler, Kırmızı Ejderler, Yeşil Fırtına, Sarı Kaplanlar (2-4 Takım).
   - "Hazır" (Ready) durumu.
3. **Ekran Ayrımı (Role-Based Realtime Views):**
   - **Aktif Anlatıcı Cihazı:** Sadece o anki anlatıcı kartın ana kelimesini ve 5 yasaklı kelimesini tam okunaklı görür. Doğru ve Pas butonları onda etkindir.
   - **Rakip Takım Cihazları:** Ekranda dev bir **BUZZER** butonu yer alır! Anlatıcı yasaklı kelimeyi söylerse rakip oyuncu buzzer'a basar. Ses çalar, tur -1 ceza ile anında kilitlenir.
   - **Takım Arkadaşları & Seyirciler:** Kartın sadece süresini, skorunu ve "Anlatılıyor..." animasyonunu görür; kelimeler gizlidir (kopya çekmeyi engeller).

---

## 3. 🗄️ SUPABASE VERİTABANI ŞEMASI & RLS

Aşağıdaki SQL şemasını Supabase SQL Editöründe çalıştır:

```sql
-- 1. CARDS
create table if not exists cards (
  id uuid default gen_random_uuid() primary key,
  main_word text not null,
  forbidden_words text[] not null check (array_length(forbidden_words, 1) = 5),
  category text not null,
  difficulty text not null default 'Orta',
  language text not null default 'tr',
  created_at timestamptz default now()
);

-- 2. ROOMS
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  code text not null unique check (length(code) = 6),
  title text not null default 'Tabu Odası',
  host_id uuid,
  is_private boolean default false,
  password_hash text,
  settings jsonb not null default '{
    "team_count": 2,
    "turn_duration": 60,
    "total_rounds": 6,
    "pass_limit": 3,
    "buzzer_penalty": -1,
    "correct_points": 1,
    "categories": ["Genel Kültür", "Sinema & Dizi", "Spor", "Teknoloji"],
    "difficulty": "Tümü"
  }'::jsonb,
  status text not null default 'waiting',
  current_game_id uuid,
  created_at timestamptz default now()
);

-- 3. TEAMS
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  color text not null default '#6366F1',
  score integer not null default 0,
  order_index integer not null default 0
);

-- 4. PLAYERS
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid,
  guest_name text not null,
  team_id uuid references teams(id) on delete set null,
  is_ready boolean default false,
  is_host boolean default false,
  is_presenter boolean default false,
  joined_at timestamptz default now()
);

-- 5. GAMES
create table if not exists games (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  status text not null default 'starting',
  current_round integer not null default 1,
  total_rounds integer not null default 6,
  active_team_id uuid references teams(id),
  active_presenter_id uuid references players(id),
  current_card_id uuid references cards(id),
  time_remaining integer not null default 60,
  remaining_passes integer not null default 3,
  buzzer_locked_by_player_id uuid references players(id),
  cards_used uuid[] not null default '{}',
  created_at timestamptz default now()
);

-- 6. TURNS & GAME_HISTORY & AI_INSIGHTS
create table if not exists turns (
  id uuid default gen_random_uuid() primary key,
  game_id uuid not null references games(id) on delete cascade,
  team_id uuid not null references teams(id),
  player_id uuid references players(id),
  round_number integer not null,
  card_id uuid references cards(id),
  action text not null check (action in ('correct', 'pass', 'buzzer', 'timeout')),
  points integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists game_history (
  id uuid default gen_random_uuid() primary key,
  game_id uuid not null references games(id),
  room_id uuid not null references rooms(id),
  winning_team_id uuid references teams(id),
  final_scores jsonb not null,
  duration_seconds integer not null default 0,
  ai_summary jsonb,
  created_at timestamptz default now()
);

-- RLS: Tüm tablolarda 'enable row level security' aktif edip anon/auth select/insert/update izinlerini aç.
```

---

## 4. 🤖 GOOGLE GEMINI AI ENTEGRASYONU (`app/api/ai/suggest/route.ts`)

Server-side API route oluştur:
- Model: `gemini-3.5-flash` veya `gemini-3.6-flash`
- İşlevler:
  1. `daily_recommendation`: Günlük kategori, mod ve günün kartı önerisi.
  2. `post_game_analysis`: Oyun sonu esprili maç spikeri özeti ve MVP övgüsü.
  3. `generate_deck`: Kullanıcının yazdığı temaya göre 1 ana + 5 yasaklı kelimeden oluşan Tabu kartları üretme.
  4. `difficulty_balancer`: Skor farkı açıldığında dengeleyici dinamik kurallar önerme.

```typescript
// app/api/ai/suggest/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { type, context } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

    const systemPrompt = "Sen DVT Tabu Game'in enerjik AI koçu ve maç spikerisin. Sadece geçerli JSON yanıt ver.";
    // Prompt yapısını hazırla ve Gemini API'ye fetch at
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nİstek: ${type}\nBağlam: ${JSON.stringify(context)}` }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    });

    const data = await response.json();
    const parsedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json(JSON.parse(parsedText || '{}'));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## 5. 📱 FRONTEND SAYFA & BİLEŞEN HİYERARŞİSİ

- `app/layout.tsx`: Root Layout, PWA Meta tags, Theme Provider, Sound Provider
- `app/page.tsx`: Ana Sayfa (Mod Seçimi: Tek Cihaz / Çok Cihazlı Oda / Özel Deste Oluşturucu / Günün AI Önerisi Banner)
- `app/rooms/page.tsx`: Açık Odaları Listeleme, Kod / Şifre ile Katılma Ekranı
- `app/room/[code]/page.tsx`: Çok Cihazlı Lobi (Takım seçimi, PIN şifresi kontrolü, Host kural paneli, Hazır durumu)
- `app/play/page.tsx`: Canlı Oyun Ekranı
  * Anlatıcı Görünümü (Kart + Pas + Doğru)
  * Rakip Görünümü (Dev Kırmızı Buzzer Butonu)
  * Seyirci Görünümü (Gizlenmiş kart + Sayaç + Canlı Skor HUD)
- `app/summary/page.tsx`: Oyun Sonu Podyumu (Konfeti, AI Spiker Yorumu, Skor Kartı Paylaşımı)

---

## 6. 🎨 UI/UX & MOBİL OPTİMİZASYON KURALLARI
1. **Dokunma Alanı (Touch Target):** Tüm butonlar minimum `48x48px` (Buzzer butonu minimum `120x120px`).
2. **Kart Okunabilirliği:** Ana kelime `text-3xl font-black`, 5 yasaklı kelime `text-lg font-bold bg-red-500/10 text-red-500 rounded-xl p-2.5`.
3. **Ekran Kararmasını Engelleme:** `navigator.wakeLock.request('screen')` ile oyun boyunca ekran açık tutulur.
4. **Haptic Titreşim:** Doğru bilince `navigator.vibrate([40])`, Pas geçince `navigator.vibrate([20, 20])`, Buzzer basılınca `navigator.vibrate([150, 50, 150])`.
5. **Ses Efektleri:** Howler.js ile doğru 'ding', hata 'buzzer', son 10 saniye 'ticking'.

---

## 7. 🚀 İLK KURULUM ADIMLARI
1. Gerekli paketleri kur:
   `npm install @supabase/supabase-js zustand framer-motion howler lucide-react canvas-confetti clsx tailwind-merge next-themes`
   `npm install -D @types/howler @types/canvas-confetti`
2. Supabase SQL şemasını ve kart seed verilerini yükle.
3. `.env.local` dosyasına Supabase URL, Anon Key ve `GEMINI_API_KEY` ekle.
4. Tüm bileşenleri TypeScript ve Tailwind kurallarına uygun olarak eksiksiz oluştur.
```

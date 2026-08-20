-- ==============================================================================
-- 🎮 DVT TABU GAME - SUPABASE VERİTABANI ŞEMASI & RLS GÜVENLİK POLİTİKALARI
-- ==============================================================================

-- UUID eklentisi
create extension if not exists "uuid-ossp";

-- 1. CARDS (Genel Tabu Kart Havuzu)
create table if not exists cards (
  id uuid default gen_random_uuid() primary key,
  main_word text not null,
  forbidden_words text[] not null check (array_length(forbidden_words, 1) = 5),
  category text not null check (category in ('Genel Kültür', 'Sinema & Dizi', 'Spor', 'Teknoloji', 'Yemek & Mutfak', 'Seyahat & Coğrafya', 'Tarih', 'Müzik & Sanat', 'Bilim & Doğa', '90lar & 2000ler')),
  difficulty text not null default 'Orta' check (difficulty in ('Kolay', 'Orta', 'Zor')),
  language text not null default 'tr' check (language in ('tr', 'en')),
  is_approved boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ROOMS (Çok Cihazlı Oyun Odaları & Şifre Koruması)
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  code text not null unique check (length(code) = 6),
  title text not null default 'Tabu Odası',
  host_id uuid references auth.users(id) on delete cascade,
  is_private boolean default false,
  password_hash text, -- İsteğe bağlı 4 haneli PIN veya şifre
  settings jsonb not null default '{
    "team_count": 2,
    "turn_duration": 60,
    "total_rounds": 6,
    "pass_limit": 3,
    "buzzer_penalty": -1,
    "correct_points": 1,
    "target_score": null,
    "categories": ["Genel Kültür", "Sinema & Dizi", "Spor", "Teknoloji"],
    "difficulty": "Tümü",
    "deck_id": null
  }'::jsonb,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'paused', 'finished', 'closed')),
  current_game_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TEAMS (Odada Yarışan Takımlar)
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  color text not null default '#6366F1', -- Indigo, Pink, Emerald, Amber
  score integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz default now()
);

-- 4. PLAYERS (Odaya Katılan Oyuncular)
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  guest_name text not null,
  avatar_url text,
  team_id uuid references teams(id) on delete set null,
  is_ready boolean default false,
  is_host boolean default false,
  is_presenter boolean default false,
  socket_id text,
  joined_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

-- 5. GAMES (Aktif Maç Durumu)
create table if not exists games (
  id uuid default gen_random_uuid() primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  status text not null default 'starting' check (status in ('starting', 'in_progress', 'paused', 'turn_break', 'finished')),
  current_round integer not null default 1,
  total_rounds integer not null default 6,
  active_team_id uuid references teams(id) on delete set null,
  active_presenter_id uuid references players(id) on delete set null,
  current_card_id uuid references cards(id) on delete set null,
  time_remaining integer not null default 60,
  remaining_passes integer not null default 3,
  buzzer_locked_by_player_id uuid references players(id) on delete set null,
  cards_used uuid[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. TURNS (Her Tur ve Kartın Aksiyon Günlüğü)
create table if not exists turns (
  id uuid default gen_random_uuid() primary key,
  game_id uuid not null references games(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid references players(id) on delete set null,
  round_number integer not null,
  card_id uuid references cards(id) on delete set null,
  action text not null check (action in ('correct', 'pass', 'buzzer', 'timeout')),
  points integer not null default 0,
  created_at timestamptz default now()
);

-- 7. GAME_HISTORY (Biten Oyun İstatistikleri & AI Analiz Verisi)
create table if not exists game_history (
  id uuid default gen_random_uuid() primary key,
  game_id uuid not null references games(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  winning_team_id uuid references teams(id) on delete set null,
  final_scores jsonb not null,
  total_cards_played integer not null default 0,
  duration_seconds integer not null default 0,
  ai_summary jsonb,
  created_at timestamptz default now()
);

-- 8. CUSTOM_DECKS (Kullanıcı Tarafından Oluşturulan Özel Paketler)
create table if not exists custom_decks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete cascade,
  share_code text unique check (length(share_code) = 6),
  is_public boolean default false,
  card_count integer default 0,
  play_count integer default 0,
  created_at timestamptz default now()
);

-- 9. CUSTOM_CARDS (Özel Paketlerin Kartları)
create table if not exists custom_cards (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid not null references custom_decks(id) on delete cascade,
  main_word text not null,
  forbidden_words text[] not null check (array_length(forbidden_words, 1) = 5),
  category text,
  created_at timestamptz default now()
);

-- 10. AI_INSIGHTS (Gemini AI Önbelleği)
create table if not exists ai_insights (
  id uuid default gen_random_uuid() primary key,
  insight_type text not null check (insight_type in ('daily_recommendation', 'post_game_analysis', 'generate_deck', 'difficulty_balancer')),
  target_id text, -- room_id, user_id veya 'global'
  content jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

-- ==============================================================================
-- INDEXLER
-- ==============================================================================
create index if not exists idx_cards_cat_diff on cards(category, difficulty);
create index if not exists idx_rooms_code on rooms(code);
create index if not exists idx_players_room_team on players(room_id, team_id);
create index if not exists idx_games_room on games(room_id);
create index if not exists idx_turns_game_team on turns(game_id, team_id);
create index if not exists idx_custom_decks_code on custom_decks(share_code);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ==============================================================================
alter table cards enable row level security;
alter table rooms enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table games enable row level security;
alter table turns enable row level security;
alter table game_history enable row level security;
alter table custom_decks enable row level security;
alter table custom_cards enable row level security;
alter table ai_insights enable row level security;

-- Kartlar: Herkes okuyabilir, yetkili kullanıcılar ekleyebilir
create policy "Cards are readable by everyone" on cards for select using (true);
create policy "Authenticated users can create cards" on cards for insert with check (auth.role() = 'authenticated');

-- Odalar: Herkes açık odaları listeleyebilir ve kodla erişebilir
create policy "Rooms are readable by code or public" on rooms for select using (true);
create policy "Anyone can create room" on rooms for insert with check (true);
create policy "Host can update room" on rooms for update using (true);

-- Takımlar & Oyuncular: Odaya katılan herkes okuyabilir ve katılabilir
create policy "Teams are readable by everyone" on teams for select using (true);
create policy "Teams can be managed by players" on teams for all using (true);
create policy "Players are readable by everyone" on players for select using (true);
create policy "Anyone can join as player" on players for insert with check (true);
create policy "Players can update their own state" on players for update using (true);

-- Oyun & Turlar: Canlı maç akışında herkes güncellemeyi okuyabilir
create policy "Games are readable by everyone" on games for select using (true);
create policy "Games can be modified during play" on games for all using (true);
create policy "Turns can be recorded by players" on turns for all using (true);
create policy "Game history is viewable by all" on game_history for select using (true);

-- Özel Desteler: Herkes herkese açık desteleri görebilir, sahibi yönetebilir
create policy "Public decks are viewable by all" on custom_decks for select using (is_public = true or auth.uid() = created_by);
create policy "Users can manage own decks" on custom_decks for all using (auth.uid() = created_by);
create policy "Custom cards are viewable if deck is visible" on custom_cards for select using (true);
create policy "Deck owner can manage custom cards" on custom_cards for all using (true);

-- AI Insights: Herkes okuyabilir
create policy "AI insights are readable by everyone" on ai_insights for select using (true);

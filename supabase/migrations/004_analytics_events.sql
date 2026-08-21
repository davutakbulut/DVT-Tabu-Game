-- ==============================================================================
-- 📊 DVT TABU GAME - ANALİTİK, DROP-OFF & MONETİZASYON LOG TABLOSU
-- ==============================================================================

create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  event_name text not null, -- 'onboarding_start', 'onboarding_step', 'onboarding_complete', 'game_start', 'game_abandoned', 'game_finished', 'paywall_view', 'client_error'
  page_path text not null,
  metadata jsonb default '{}'::jsonb,
  user_agent text null,
  created_at timestamptz default now()
);

create index if not exists idx_analytics_event_name on analytics_events(event_name);
create index if not exists idx_analytics_created_at on analytics_events(created_at);

alter table analytics_events enable row level security;
create policy "Analytics are insertable by all" on analytics_events for insert with check (true);
create policy "Analytics are readable by all" on analytics_events for select using (true);

-- Örnek başlangıç verileri (Simüle edilen analitik dökümü)
insert into analytics_events (session_id, event_name, page_path, metadata) values
  ('sess-101', 'onboarding_start', '/', '{"step": 1}'::jsonb),
  ('sess-101', 'onboarding_step', '/', '{"step": 2}'::jsonb),
  ('sess-101', 'onboarding_complete', '/', '{"completed_in_seconds": 24}'::jsonb),
  ('sess-101', 'game_start', '/play', '{"mode": "single_device", "teams": 2}'::jsonb),
  ('sess-101', 'game_finished', '/summary', '{"score": 14, "duration": 180}'::jsonb),
  ('sess-102', 'onboarding_start', '/', '{"step": 1}'::jsonb),
  ('sess-102', 'onboarding_skip', '/', '{"skipped_at_step": 1}'::jsonb),
  ('sess-102', 'game_start', '/play', '{"mode": "single_device"}'::jsonb),
  ('sess-102', 'game_abandoned', '/play', '{"time_spent_seconds": 45, "reason": "left_arena"}'::jsonb),
  ('sess-103', 'onboarding_complete', '/', '{}'::jsonb),
  ('sess-103', 'game_finished', '/summary', '{"game_number": 2}'::jsonb),
  ('sess-103', 'paywall_view', '/summary', '{"trigger": "after_2_games"}'::jsonb);

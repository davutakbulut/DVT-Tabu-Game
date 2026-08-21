-- ==============================================================================
-- 🚀 DVT TABU GAME - SÜRÜM TAKİBİ & GÜNCELLEME GEÇMİŞİ TABLOSU
-- ==============================================================================

create table if not exists app_versions (
  id uuid default gen_random_uuid() primary key,
  version text not null unique, -- Örn: 'v1.0.0', 'v1.1.0'
  title text not null,          -- Sürüm başlığı
  release_date timestamptz default now(),
  is_mandatory boolean default false, -- Zorunlu güncelleme mi?
  changes jsonb not null default '[]'::jsonb, -- Güncelleme maddeleri [{ "type": "feat"|"fix"|"perf", "text": "..." }]
  created_at timestamptz default now()
);

alter table app_versions enable row level security;
create policy "App versions are viewable by everyone" on app_versions for select using (true);
create policy "Only authenticated users can insert versions" on app_versions for insert with check (true);

-- Başlangıç Sürümleri (Seed)
insert into app_versions (version, title, is_mandatory, changes) values
(
  'v1.0.0',
  'Lansman: DVT Tabu Game Canlıda! 🚀',
  false,
  '[
    {"type": "feat", "text": "Tek Cihazda Oyna (Pass-and-Play) ve Çok Cihazlı Online Oda modları eklendi."},
    {"type": "feat", "text": "6 haneli oda kodu ve 4 haneli PIN şifreli özel oda koruması kuruldu."},
    {"type": "feat", "text": "Google Gemini 3.5 Flash ile Günlük AI Bülteni ve Özel Deste Üreticisi entegre edildi."},
    {"type": "feat", "text": "Saf Web Audio API ses sentezleyici ve Vibration API dokunsal geri bildirim eklendi."},
    {"type": "feat", "text": "100+ Türkçe Tabu kartı Supabase bulut veritabanına aktarıldı."}
  ]'::jsonb
)
on conflict (version) do nothing;

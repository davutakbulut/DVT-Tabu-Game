import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientVersion = url.searchParams.get('current') || '1.1.0';

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const latest = data[0];
        const releaseNotes = Array.isArray(latest.changes)
          ? latest.changes.map((c: any) => (typeof c === 'string' ? c : c.text || JSON.stringify(c)))
          : [];

        return NextResponse.json({
          versions: data,
          latest: {
            version: latest.version.replace(/^v/, ''),
            release_name: latest.title,
            release_notes: releaseNotes,
            is_mandatory: Boolean(latest.is_mandatory),
            min_supported_version: latest.min_supported_version || '1.0.0',
            created_at: latest.created_at,
          },
          client_version: clientVersion,
        });
      }
    } catch {
      // Fallback
    }
  }

  // Fallback version history
  const fallbackVersions = [
    {
      version: '1.1.0',
      title: 'v1.1.0: Onboarding, Analitik & Kesintisiz Tabu Akışı ',
      release_date: new Date().toISOString(),
      is_mandatory: false,
      min_supported_version: '1.0.0',
      changes: [
        { type: 'feat', text: '4 adımlı interaktif Onboarding kılavuzu eklendi.' },
        { type: 'feat', text: 'Terk edilen sayfaları (drop-off) izleyen canlı analitik motoru ve yönetim paneli kuruldu.' },
        { type: 'feat', text: 'Oyun esnasında canlı Pas, Tabu ve Doğru sayaçları ve süre bitimi dökümü eklendi.' },
        { type: 'fix', text: 'Tabu butonu akışı kesintisiz hale getirildi (-1 ceza puanı ve anında sonraki kart).' }
      ]
    },
    {
      version: '1.0.0',
      title: 'v1.0.0: Lansman: DVT Tabu Game Canlıda! ',
      release_date: '2026-08-20T12:00:00.000Z',
      is_mandatory: false,
      min_supported_version: '1.0.0',
      changes: [
        { type: 'feat', text: 'Tek Cihazda Oyna ve Online Çok Oyunculu Oda modları eklendi.' },
        { type: 'feat', text: '6 haneli oda kodu ve 4 haneli PIN şifreli özel oda koruması.' },
        { type: 'feat', text: 'Google Gemini AI destekli Günlük Bülten ve Özel Deste Üreticisi.' }
      ]
    }
  ];

  return NextResponse.json({
    versions: fallbackVersions,
    latest: {
      version: fallbackVersions[0].version,
      release_name: fallbackVersions[0].title,
      release_notes: fallbackVersions[0].changes.map((c) => c.text),
      is_mandatory: fallbackVersions[0].is_mandatory,
      min_supported_version: fallbackVersions[0].min_supported_version,
      created_at: fallbackVersions[0].release_date,
    },
    client_version: clientVersion,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { version, title, changes, is_mandatory, min_supported_version } = body;

    if (!version || !title) {
      return NextResponse.json({ error: 'Sürüm numarası ve başlık zorunludur.' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('app_versions')
        .insert([
          {
            version,
            title,
            changes: changes || [],
            is_mandatory: Boolean(is_mandatory),
            min_supported_version: min_supported_version || '1.0.0'
          }
        ])
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, version: data[0] });
    }

    return NextResponse.json({ error: 'Supabase bağlantısı bulunamadı.' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

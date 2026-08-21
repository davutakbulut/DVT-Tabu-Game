import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ versions: data });
      }
    } catch {
      // Fallback
    }
  }

  // Fallback version history
  return NextResponse.json({
    versions: [
      {
        version: 'v1.0.0',
        title: 'Lansman: DVT Tabu Game Canlıda! 🚀',
        release_date: new Date().toISOString(),
        is_mandatory: false,
        changes: [
          { type: 'feat', text: 'Tek Cihazda Oyna (Pass-and-Play) ve Çok Cihazlı Online Oda modları eklendi.' },
          { type: 'feat', text: '6 haneli oda kodu ve 4 haneli PIN şifreli özel oda koruması kuruldu.' },
          { type: 'feat', text: 'Google Gemini 3.5 Flash ile Günlük AI Bülteni ve Özel Deste Üreticisi entegre edildi.' },
          { type: 'feat', text: 'Saf Web Audio API ses sentezleyici ve Vibration API dokunsal geri bildirim eklendi.' },
          { type: 'feat', text: '100+ Türkçe Tabu kartı Supabase bulut veritabanına aktarıldı.' }
        ]
      }
    ]
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { version, title, changes, is_mandatory } = body;

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
            is_mandatory: Boolean(is_mandatory)
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

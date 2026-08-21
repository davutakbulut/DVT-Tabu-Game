import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];

    if (!events.length) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const records = events.map((ev) => ({
        id: ev.id || `gce_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        game_id: ev.game_id,
        card_id: ev.card_id || null,
        deck_id: ev.deck_id || null,
        main_word: ev.main_word || 'BİLİNMEYEN',
        action: ev.action, // 'correct' | 'pass' | 'tabu' | 'timeout'
        team_name: ev.team_name || null,
        round_number: ev.round_number || 1,
        points: ev.points || 0,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('game_card_events').insert(records);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: events.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ games: [] });
    }

    let query = supabase
      .from('game_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (guestId) {
      query = query.eq('guest_id', guestId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ games: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, games: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      user_id,
      guest_id,
      status,
      current_round,
      total_rounds,
      active_team_index,
      teams,
      settings,
      selected_deck_ids,
      winner_team_name,
      winner_score,
      total_correct,
      total_pass,
      total_tabu,
      duration_seconds,
      finished_at,
    } = body;

    if (!id || !guest_id) {
      return NextResponse.json({ error: 'id and guest_id are required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const payload: any = {
        id,
        user_id: user_id || null,
        guest_id,
        status: status || 'in_progress',
        current_round: current_round || 1,
        total_rounds: total_rounds || 6,
        active_team_index: active_team_index || 0,
        teams: teams || [],
        settings: settings || {},
        selected_deck_ids: selected_deck_ids || [],
        winner_team_name: winner_team_name || null,
        winner_score: winner_score ?? null,
        total_correct: total_correct || 0,
        total_pass: total_pass || 0,
        total_tabu: total_tabu || 0,
        duration_seconds: duration_seconds || 0,
        updated_at: new Date().toISOString(),
      };

      if (finished_at || status === 'finished') {
        payload.finished_at = finished_at || new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, game: data });
    }

    return NextResponse.json({ success: true, game: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

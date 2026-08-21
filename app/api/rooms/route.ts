import { NextResponse, NextRequest } from 'next/server';
import { generateRoomCode } from '@/lib/game-logic';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        return NextResponse.json({ rooms: data });
      }
    }
    return NextResponse.json({ rooms: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, rooms: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || generateRoomCode();
    const room = {
      id: `room-${Date.now()}`,
      code,
      title: body.title || 'Tabu Odası',
      is_private: Boolean(body.is_private),
      password_hash: body.password_hash || null,
      settings: { ...DEFAULT_GAME_SETTINGS, ...(body.settings || {}) },
      status: 'waiting',
      players: body.players || [],
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('game_rooms').upsert(room);
      } catch {}
    }

    return NextResponse.json({ success: true, room });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

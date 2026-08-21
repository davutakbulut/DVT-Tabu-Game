import { NextResponse, NextRequest } from 'next/server';
import { generateRoomCode } from '@/lib/game-logic';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// In-memory rooms cache
let memoryRooms: any[] = [
  {
    id: 'room-tabu01',
    code: 'TABU01',
    title: 'Aksam Partisi Odasi',
    host_id: 'host_system',
    host_name: 'DVT Tabu',
    is_private: false,
    pin: null,
    max_players: 8,
    settings: DEFAULT_GAME_SETTINGS,
    status: 'waiting',
    players: [{ id: 'p1', name: 'Ahmet' }, { id: 'p2', name: 'Ayse' }],
    created_at: new Date().toISOString(),
  },
  {
    id: 'room-tabu99',
    code: 'TABU99',
    title: 'Pro Tabu Kapismasi',
    host_id: 'host_system',
    host_name: 'Efsane Tabucu',
    is_private: true,
    pin: '1234',
    max_players: 6,
    settings: DEFAULT_GAME_SETTINGS,
    status: 'waiting',
    players: [{ id: 'p3', name: 'Can' }],
    created_at: new Date().toISOString(),
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let rooms = memoryRooms;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('game_rooms')
          .select('*')
          .order('created_at', { ascending: false });

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          rooms = data;
        }
      } catch {}
    }

    if (status && status !== 'all') {
      rooms = rooms.filter((r) => r.status === status);
    }

    return NextResponse.json({ rooms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, rooms: memoryRooms }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code || generateRoomCode();
    
    const room = {
      id: body.id || 'room-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      code: code.toUpperCase().trim(),
      title: body.title || 'Tabu Odasi',
      host_id: body.host_id || 'guest_' + Date.now().toString(36),
      host_name: body.host_name || 'Oda Kurucusu',
      is_private: Boolean(body.is_private),
      pin: body.pin || null,
      max_players: body.max_players || 8,
      settings: { ...DEFAULT_GAME_SETTINGS, ...(body.settings || {}) },
      teams: body.teams || [
        { id: 'team-1', name: 'Mavi Takim', color: '#3b82f6', score: 0, players: [] },
        { id: 'team-2', name: 'Kirmizi Takim', color: '#ef4444', score: 0, players: [] }
      ],
      players: body.players || [
        { id: body.host_id || 'host', name: body.host_name || 'Oda Kurucusu', is_host: true, team_id: 'team-1' }
      ],
      status: 'waiting',
      closure_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryRooms.unshift(room);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('game_rooms').upsert([room]);
      } catch {}
    }

    return NextResponse.json({ success: true, room });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

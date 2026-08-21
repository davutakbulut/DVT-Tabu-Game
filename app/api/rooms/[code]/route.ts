import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase().trim();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('code', code)
          .single();

        if (!error && data) {
          return NextResponse.json({ room: data });
        }
      } catch {}
    }

    // Default mock response if offline
    return NextResponse.json({
      room: {
        id: 'room-' + code,
        code,
        title: code + ' Tabu Odasi',
        status: 'waiting',
        host_id: 'host_system',
        host_name: 'Oda Kurucusu',
        is_private: false,
        max_players: 8,
        players: [],
        settings: {},
        created_at: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase().trim();
    const body = await req.json();
    const { status, closure_reason, players, teams, settings } = body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (closure_reason) updateData.closure_reason = closure_reason;
    if (players) updateData.players = players;
    if (teams) updateData.teams = teams;
    if (settings) updateData.settings = settings;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('game_rooms')
          .update(updateData)
          .eq('code', code)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, room: data });
        }
      } catch {}
    }

    return NextResponse.json({ success: true, updated: updateData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase().trim();

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('game_rooms')
          .delete()
          .eq('code', code);
      } catch {}
    }

    return NextResponse.json({ success: true, deletedCode: code });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

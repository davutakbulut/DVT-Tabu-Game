import { NextResponse } from 'next/server';
import { generateRoomCode } from '@/lib/game-logic';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = generateRoomCode();
    const room = {
      id: `room-${Date.now()}`,
      code,
      title: body.title || 'Tabu Odası',
      is_private: Boolean(body.is_private),
      password_hash: body.password_hash || null,
      settings: { ...DEFAULT_GAME_SETTINGS, ...(body.settings || {}) },
      status: 'waiting',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ room });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

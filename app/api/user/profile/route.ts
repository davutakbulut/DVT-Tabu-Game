import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      return NextResponse.json({ profile, settings, stats });
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({ profile: null, settings: null, stats: null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, displayName, avatarUrl, email, provider, isPro, settings, stats } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      // 1. Upsert Profile
      await supabase.from('profiles').upsert({
        id: userId,
        display_name: displayName || 'Tabucu',
        avatar_url: avatarUrl || null,
        email: email || null,
        provider: provider || 'guest',
        is_pro: Boolean(isPro),
        last_login_at: new Date().toISOString(),
      });

      // 2. Upsert Settings if provided
      if (settings) {
        await supabase.from('user_settings').upsert({
          user_id: userId,
          turn_duration: settings.turnDuration || 60,
          pass_limit: settings.passLimit ?? 3,
          sound_enabled: settings.soundEnabled ?? true,
          haptic_enabled: settings.hapticEnabled ?? true,
          favorite_categories: settings.favoriteCategories || ['Genel Kültür'],
          custom_decks: settings.customDecks || [],
          updated_at: new Date().toISOString(),
        });
      }

      // 3. Upsert Stats if provided
      if (stats) {
        await supabase.from('user_stats').upsert({
          user_id: userId,
          total_games_played: stats.totalGamesPlayed || 0,
          total_wins: stats.totalWins || 0,
          total_correct_words: stats.totalCorrectWords || 0,
          total_taboos_hit: stats.totalTaboosHit || 0,
          total_passes_used: stats.totalPassesUsed || 0,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

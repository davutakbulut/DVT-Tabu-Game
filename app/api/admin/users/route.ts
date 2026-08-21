import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      // In-memory / mock fallback if Supabase is offline
      return NextResponse.json({
        users: [
          {
            id: 'gst_bw8qtor_mt30b9je',
            display_name: 'Şampiyon99',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            email: 'şampiyon99@gmail.com',
            provider: 'google',
            is_pro: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_login_at: new Date().toISOString(),
            stats: { totalGamesPlayed: 14, totalWins: 11, totalCorrectWords: 92, totalTaboosHit: 4, totalPassesUsed: 8 },
          },
          {
            id: 'gst_ihwr4kj_mt36hl3q',
            display_name: 'GizemliKaplan',
            avatar_url: null,
            email: null,
            provider: 'guest',
            is_pro: false,
            created_at: new Date(Date.now() - 43200000).toISOString(),
            last_login_at: new Date(Date.now() - 3600000).toISOString(),
            stats: { totalGamesPlayed: 6, totalWins: 4, totalCorrectWords: 38, totalTaboosHit: 2, totalPassesUsed: 5 },
          }
        ],
        summary: {
          totalUsers: 2,
          proUsers: 1,
          googleUsers: 1,
          guestUsers: 1
        }
      });
    }

    // 1. Fetch all profiles from Supabase
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (pErr) throw pErr;

    // 2. Fetch stats for all users
    const { data: statsList } = await supabase
      .from('user_stats')
      .select('*');

    // Map stats by user_id
    const statsMap: Record<string, any> = {};
    (statsList || []).forEach((st) => {
      statsMap[st.user_id] = st;
    });

    const enrichedUsers = (profiles || []).map((user) => {
      const userStat = statsMap[user.id] || {
        total_games_played: 0,
        total_wins: 0,
        total_correct_words: 0,
        total_taboos_hit: 0,
        total_passes_used: 0,
      };

      return {
        id: user.id,
        display_name: user.display_name || 'İsimsiz Oyuncu',
        avatar_url: user.avatar_url || null,
        email: user.email || null,
        provider: user.provider || (user.email ? 'google' : 'guest'),
        is_pro: Boolean(user.is_pro),
        created_at: user.created_at,
        last_login_at: user.last_login_at || user.created_at,
        stats: {
          totalGamesPlayed: userStat.total_games_played || 0,
          totalWins: userStat.total_wins || 0,
          totalCorrectWords: userStat.total_correct_words || 0,
          totalTaboosHit: userStat.total_taboos_hit || 0,
          totalPassesUsed: userStat.total_passes_used || 0,
          winRate: userStat.total_games_played > 0 
            ? Math.round((userStat.total_wins / userStat.total_games_played) * 100) 
            : 0,
        },
      };
    });

    const totalUsers = enrichedUsers.length;
    const proUsers = enrichedUsers.filter((u) => u.is_pro).length;
    const googleUsers = enrichedUsers.filter((u) => u.provider === 'google' || Boolean(u.email)).length;
    const guestUsers = totalUsers - googleUsers;

    return NextResponse.json({
      users: enrichedUsers,
      summary: {
        totalUsers,
        proUsers,
        googleUsers,
        guestUsers,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, isPro, displayName } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const updates: Record<string, any> = {};
      if (isPro !== undefined) updates.is_pro = isPro;
      if (displayName !== undefined) updates.display_name = displayName;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    }

    return NextResponse.json({ success: true, userId, isPro, displayName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

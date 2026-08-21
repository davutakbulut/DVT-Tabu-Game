import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ words: [], summary: {}, decks: [] });
    }

    // 1. Fetch recent card events
    const { data: events, error: eventsErr } = await supabase
      .from('game_card_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (eventsErr) throw eventsErr;

    // 2. Fetch game sessions summary
    const { data: games, error: gamesErr } = await supabase
      .from('game_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (gamesErr) throw gamesErr;

    // Aggregate word statistics
    const wordMap: Record<string, {
      word: string;
      card_id?: string;
      deck_id?: string;
      seen: number;
      correct: number;
      pass: number;
      tabu: number;
      difficulty: 'Kolay' | 'Orta' | 'Zor';
      correctRate: number;
      tabuRate: number;
    }> = {};

    (events || []).forEach((ev) => {
      const key = ev.main_word.toUpperCase();
      if (!wordMap[key]) {
        wordMap[key] = {
          word: ev.main_word,
          card_id: ev.card_id,
          deck_id: ev.deck_id,
          seen: 0,
          correct: 0,
          pass: 0,
          tabu: 0,
          difficulty: 'Orta',
          correctRate: 0,
          tabuRate: 0,
        };
      }

      wordMap[key].seen += 1;
      if (ev.action === 'correct') wordMap[key].correct += 1;
      else if (ev.action === 'pass') wordMap[key].pass += 1;
      else if (ev.action === 'tabu' || ev.action === 'buzzer') wordMap[key].tabu += 1;
    });

    // Compute rates & dynamic difficulties
    const wordsList = Object.values(wordMap).map((w) => {
      const correctRate = w.seen > 0 ? Math.round((w.correct / w.seen) * 100) : 0;
      const tabuRate = w.seen > 0 ? Math.round((w.tabu / w.seen) * 100) : 0;
      const passRate = w.seen > 0 ? Math.round((w.pass / w.seen) * 100) : 0;

      let difficulty: 'Kolay' | 'Orta' | 'Zor' = 'Orta';
      if (tabuRate + passRate >= 50 || correctRate < 40) {
        difficulty = 'Zor';
      } else if (correctRate >= 70) {
        difficulty = 'Kolay';
      }

      return {
        ...w,
        correctRate,
        tabuRate,
        passRate,
        difficulty,
      };
    });

    // Sort by seen count descending
    wordsList.sort((a, b) => b.seen - a.seen);

    // Summary KPIs
    const totalGames = games?.length || 0;
    const completedGames = games?.filter((g) => g.status === 'finished').length || 0;
    const inProgressGames = games?.filter((g) => g.status === 'in_progress').length || 0;
    const totalCardEvents = events?.length || 0;

    return NextResponse.json({
      summary: {
        totalGames,
        completedGames,
        inProgressGames,
        totalCardEvents,
        completionRate: totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0,
      },
      words: wordsList,
      recentGames: games?.slice(0, 50) || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, words: [], summary: {} }, { status: 500 });
  }
}

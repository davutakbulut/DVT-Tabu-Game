import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cards, deck_id, category } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'cards dizisi zorunludur' }, { status: 400 });
    }

    const formattedCards = cards.map((c: any) => ({
      main_word: (c.main_word || c.word || '').toUpperCase().trim(),
      forbidden_words: (c.forbidden_words || c.taboos || []).map((w: string) => w.toUpperCase().trim()),
      category: c.category || category || 'Genel Kültür',
      difficulty: c.difficulty || 'Orta',
      deck_id: c.deck_id || deck_id || 'deck-general',
      is_active: true,
    })).filter((c: any) => c.main_word && c.forbidden_words.length >= 5);

    if (formattedCards.length === 0) {
      return NextResponse.json({ error: 'Geçerli formatta kart bulunamadı (En az ana kelime ve 5 yasaklı kelime olmalı)' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('cards')
        .insert(formattedCards)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, count: data.length, cards: data });
    }

    return NextResponse.json({ success: true, count: formattedCards.length, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

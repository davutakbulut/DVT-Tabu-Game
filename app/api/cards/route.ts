import { NextResponse } from 'next/server';
import { INITIAL_CARDS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deckId = searchParams.get('deckId');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const difficulty = searchParams.get('difficulty');
  const activeOnly = searchParams.get('activeOnly') === 'true';
  const limit = parseInt(searchParams.get('limit') || '150', 10);

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('cards').select('*');

      if (deckId && deckId !== 'all') {
        query = query.eq('deck_id', deckId);
      }
      if (category && category !== 'Tümü') {
        query = query.eq('category', category);
      }
      if (difficulty && difficulty !== 'Tümü') {
        query = query.eq('difficulty', difficulty);
      }
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      if (search) {
        query = query.ilike('main_word', `%${search}%`);
      }

      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ total: data.length, cards: data });
      }
    } catch {
      // Fallback below
    }
  }

  let fallback = [...INITIAL_CARDS];
  if (category && category !== 'Tümü') {
    fallback = fallback.filter((c) => c.category === category);
  }
  if (search) {
    fallback = fallback.filter((c) => c.main_word.toLowerCase().includes(search.toLowerCase()));
  }

  return NextResponse.json({
    total: fallback.length,
    cards: fallback.slice(0, limit),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { main_word, forbidden_words, category, difficulty, deck_id, is_active } = body;

    if (!main_word || !forbidden_words || forbidden_words.length < 5) {
      return NextResponse.json({ error: 'Ana kelime ve 5 yasaklı kelime zorunludur' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('cards')
        .insert([{
          main_word: main_word.toUpperCase().trim(),
          forbidden_words: forbidden_words.map((w: string) => w.toUpperCase().trim()),
          category: category || 'Genel Kültür',
          difficulty: difficulty || 'Orta',
          deck_id: deck_id || 'deck-general',
          is_active: is_active ?? true,
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, card: data });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, main_word, forbidden_words, category, difficulty, deck_id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Kart id zorunludur' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const updateData: any = {};
      if (main_word) updateData.main_word = main_word.toUpperCase().trim();
      if (forbidden_words) updateData.forbidden_words = forbidden_words.map((w: string) => w.toUpperCase().trim());
      if (category) updateData.category = category;
      if (difficulty) updateData.difficulty = difficulty;
      if (deck_id) updateData.deck_id = deck_id;
      if (typeof is_active === 'boolean') updateData.is_active = is_active;

      const { data, error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, card: data });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Kart id zorunludur' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

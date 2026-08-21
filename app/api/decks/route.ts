import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const { data: decks, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .order('is_system', { ascending: false });

      if (decksError) throw decksError;

      // Fetch card counts for each deck
      const { data: cards } = await supabase
        .from('cards')
        .select('id, deck_id, is_active');

      const decksWithCount = (decks || []).map((deck) => {
        const deckCards = (cards || []).filter((c) => c.deck_id === deck.id);
        return {
          ...deck,
          card_count: deckCards.length,
          active_card_count: deckCards.filter((c) => c.is_active !== false).length,
        };
      });

      return NextResponse.json({ decks: decksWithCount });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Fallback in-memory / local decks
  return NextResponse.json({
    decks: [
      { id: 'deck-general', name: 'Genel Kültür & Gündelik Yaşam', description: 'Klasik eğlenceli Türkçe kelimeler.', icon: 'Sparkles', color: '#6366f1', is_active: true, is_system: true, card_count: 50, active_card_count: 50 },
      { id: 'deck-cinema', name: 'Sinema, Dizi & Popüler Kültür', description: 'Yerli ve yabancı filmler ve diziler.', icon: 'Film', color: '#ec4899', is_active: true, is_system: true, card_count: 35, active_card_count: 35 },
      { id: 'deck-sports', name: 'Spor Arenası & Futbol', description: 'Futbol ve efsane sporcular.', icon: 'Trophy', color: '#10b981', is_active: true, is_system: true, card_count: 30, active_card_count: 30 },
      { id: 'deck-tech', name: 'Teknoloji & Yazılım', description: 'Yapay zeka, kodlama ve dijital dünya.', icon: 'Cpu', color: '#06b6d4', is_active: true, is_system: true, card_count: 25, active_card_count: 25 },
    ],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, icon, color, is_active } = body;

    if (!name) {
      return NextResponse.json({ error: 'Deste adı zorunludur' }, { status: 400 });
    }

    const deckId = id || 'deck-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('decks')
        .insert([{
          id: deckId,
          name,
          description: description || '',
          icon: icon || 'Layers',
          color: color || '#6366f1',
          is_active: is_active ?? true,
          is_system: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, deck: data });
    }

    return NextResponse.json({ success: true, localOnly: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, is_active, name, description, color } = body;

    if (!id) {
      return NextResponse.json({ error: 'Deste id zorunludur' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const updateData: any = {};
      if (typeof is_active === 'boolean') updateData.is_active = is_active;
      if (name) updateData.name = name;
      if (typeof description === 'string') updateData.description = description;
      if (color) updateData.color = color;

      const { data, error } = await supabase
        .from('decks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, deck: data });
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
      return NextResponse.json({ error: 'Deste id zorunludur' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('decks')
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

import { NextResponse } from 'next/server';
import { INITIAL_CARDS } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('cards').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      if (difficulty && difficulty !== 'Tümü') {
        query = query.eq('difficulty', difficulty);
      }
      query = query.limit(limit);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ total: data.length, cards: data });
      }
    } catch {
      // Fallback below
    }
  }

  let fallback = [...INITIAL_CARDS];
  if (category) {
    fallback = fallback.filter(c => c.category === category);
  }
  if (difficulty && difficulty !== 'Tümü') {
    fallback = fallback.filter(c => c.difficulty === difficulty);
  }

  return NextResponse.json({
    total: fallback.length,
    cards: fallback.slice(0, limit)
  });
}

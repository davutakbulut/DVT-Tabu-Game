import { NextResponse } from 'next/server';
import { INITIAL_CARDS } from '@/lib/constants';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    let sql = 'SELECT * FROM cards WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (difficulty && difficulty !== 'Tümü') {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }
    sql += ' LIMIT ?';
    params.push(limit);

    const rows = await query(sql, params);
    if (Array.isArray(rows) && rows.length > 0) {
      const formatted = rows.map((r: any) => ({
        id: r.id,
        main_word: r.main_word,
        forbidden_words: typeof r.forbidden_words === 'string' ? JSON.parse(r.forbidden_words) : r.forbidden_words,
        category: r.category,
        difficulty: r.difficulty,
        language: r.language
      }));
      return NextResponse.json({ total: formatted.length, cards: formatted });
    }
  } catch (err: any) {
    // Fallback to local memory cards if DB connection is in progress
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

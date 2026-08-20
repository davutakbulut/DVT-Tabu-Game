import { NextResponse } from 'next/server';
import { INITIAL_CARDS } from '@/lib/constants';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let result = [...INITIAL_CARDS];

  if (category) {
    result = result.filter(c => c.category === category);
  }
  if (difficulty && difficulty !== 'Tümü') {
    result = result.filter(c => c.difficulty === difficulty);
  }

  return NextResponse.json({
    total: result.length,
    cards: result.slice(0, limit)
  });
}

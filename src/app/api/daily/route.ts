import { NextRequest, NextResponse } from 'next/server';
import { getDailyPuzzle } from '@/lib/puzzles';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? undefined;
  const puzzle = await getDailyPuzzle(date);
  if (!puzzle) {
    return NextResponse.json({ error: 'No puzzle for today' }, { status: 404 });
  }
  const { curatorNotes: _, ...publicPuzzle } = puzzle;
  return NextResponse.json({ puzzle: publicPuzzle });
}

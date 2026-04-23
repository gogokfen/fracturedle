import { NextResponse } from 'next/server';
import { getPublishedPuzzles } from '@/lib/puzzles';

export const dynamic = 'force-dynamic';

export async function GET() {
  const puzzles = (await getPublishedPuzzles()).map(({ curatorNotes: _, ...p }) => p);
  return NextResponse.json({ puzzles });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllPuzzles, upsertPuzzle, deletePuzzle } from '@/lib/puzzles';
import type { Puzzle } from '@/types';

// GET /api/admin/puzzles — all puzzles including drafts (auth enforced by middleware)
export async function GET() {
  try {
    const puzzles = await getAllPuzzles();
    return NextResponse.json({ puzzles });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/admin/puzzles — create or update a puzzle
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const puzzle = body as Puzzle;
    if (!puzzle.id || !puzzle.fakeCard || !puzzle.realCardName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const saved = await upsertPuzzle(puzzle);
    return NextResponse.json({ puzzle: saved });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Postgres unique constraint violation
    if (msg.includes('puzzles_date_key') || msg.includes('unique constraint')) {
      return NextResponse.json(
        { error: `A puzzle is already scheduled for that date. Choose a different date or edit the existing one.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/puzzles?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await deletePuzzle(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

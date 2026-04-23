import { NextRequest, NextResponse } from 'next/server';
import { generateAndCacheArtwork } from '@/lib/artwork';
import { updatePuzzleArtwork } from '@/lib/puzzles';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { puzzleId, prompt } = await req.json();
  if (!puzzleId || !prompt) {
    return NextResponse.json({ error: 'puzzleId and prompt required' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 });
  }

  try {
    const artworkUrl = await generateAndCacheArtwork(puzzleId, prompt);
    await updatePuzzleArtwork(puzzleId, artworkUrl);
    return NextResponse.json({ artworkUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

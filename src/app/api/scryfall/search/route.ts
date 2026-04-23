import { NextRequest, NextResponse } from 'next/server';
import { scryfallToRealCard } from '@/lib/scryfall';

const SCRYFALL_HEADERS = {
  'User-Agent': 'Fracturedle/1.0 (contact: ordav1113@gmail.com)',
  'Accept': 'application/json',
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q) return NextResponse.json({ cards: [] });

  try {
    const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}&order=edhrec&unique=cards&page=1`;
    const res = await fetch(url, { headers: SCRYFALL_HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ cards: [] });
    const data = await res.json();
    const cards = (data.data ?? []).slice(0, 20).map(scryfallToRealCard);
    return NextResponse.json({ cards, total: data.total_cards ?? 0 });
  } catch {
    return NextResponse.json({ cards: [] }, { status: 500 });
  }
}

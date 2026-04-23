import { NextRequest, NextResponse } from 'next/server';
import { scryfallToRealCard } from '@/lib/scryfall';

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  const id = req.nextUrl.searchParams.get('id');

  if (!name && !id) {
    return NextResponse.json({ error: 'name or id required' }, { status: 400 });
  }

  try {
    let url: string;
    if (id) {
      url = `https://api.scryfall.com/cards/${encodeURIComponent(id)}`;
    } else {
      url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name!)}`;
    }

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ card: null, error: 'not found' });
      return NextResponse.json({ error: 'scryfall error' }, { status: 502 });
    }

    const sc = await res.json();
    const card = scryfallToRealCard(sc);
    return NextResponse.json({ card });
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

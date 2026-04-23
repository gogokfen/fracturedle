import { NextRequest, NextResponse } from 'next/server';
import { scryfallToRealCard } from '@/lib/scryfall';

const SCRYFALL_HEADERS = {
  'User-Agent': 'Fracturedle/1.0 (contact: ordav1113@gmail.com)',
  'Accept': 'application/json',
};

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  const id = req.nextUrl.searchParams.get('id');

  if (!name && !id) {
    return NextResponse.json({ error: 'name or id required' }, { status: 400 });
  }

  try {
    const url = id
      ? `https://api.scryfall.com/cards/${encodeURIComponent(id)}`
      : `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name!)}`;

    const res = await fetch(url, {
      headers: SCRYFALL_HEADERS,
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      if (res.status === 404) return NextResponse.json({ card: null, error: 'not found' });
      return NextResponse.json({ error: `scryfall ${res.status}` }, { status: 502 });
    }

    const sc = await res.json();
    const card = scryfallToRealCard(sc);
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

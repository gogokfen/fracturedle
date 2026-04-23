import { NextRequest, NextResponse } from 'next/server';

const SCRYFALL_HEADERS = {
  'User-Agent': 'Fracturedle/1.0 (contact: ordav1113@gmail.com)',
  'Accept': 'application/json',
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}&include_extras=false`,
      { headers: SCRYFALL_HEADERS, next: { revalidate: 3600 } },
    );
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = await res.json();
    return NextResponse.json({ results: (data.data as string[]).slice(0, 10) });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}&include_extras=false`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = await res.json();
    return NextResponse.json({ results: (data.data as string[]).slice(0, 10) });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}

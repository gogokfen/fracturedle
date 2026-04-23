import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSessionToken, makeSessionCookie, clearSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || !checkPassword(password)) {
    // Delay to slow brute force
    await new Promise(r => setTimeout(r, 500));
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', makeSessionCookie(token));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearSessionCookie());
  return res;
}

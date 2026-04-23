import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'fracturedle_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET env var not set');
  return s;
}

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error('ADMIN_PASSWORD env var not set');
  return p;
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const lastDot = decoded.lastIndexOf('.');
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = sign(payload);
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  try {
    const expected = getAdminPassword();
    return timingSafeEqual(
      Buffer.from(candidate),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

export function verifyAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export function makeSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export { COOKIE_NAME };

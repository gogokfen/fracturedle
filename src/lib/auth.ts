// Uses Web Crypto API only — compatible with Edge Runtime (middleware) and Node.js (API routes)

export const COOKIE_NAME = 'fracturedle_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET not set');
  return s;
}

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error('ADMIN_PASSWORD not set');
  return p;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function hmacSign(secret: string, payload: string): Promise<ArrayBuffer> {
  const key = await hmacKey(secret);
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const sig = await hmacSign(getSecret(), payload);
  return btoa(`${payload}.${toHex(sig)}`).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const lastDot = decoded.lastIndexOf('.');
    const payload = decoded.slice(0, lastDot);
    const sigHex = decoded.slice(lastDot + 1);
    const expected = await hmacSign(getSecret(), payload);
    const expectedBytes = new Uint8Array(expected);
    const actualBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
    return constantTimeEqual(expectedBytes, actualBytes);
  } catch {
    return false;
  }
}

export async function checkPassword(candidate: string): Promise<boolean> {
  try {
    const secret = getSecret();
    const [hashA, hashB] = await Promise.all([
      hmacSign(secret, candidate),
      hmacSign(secret, getAdminPassword()),
    ]);
    return constantTimeEqual(new Uint8Array(hashA), new Uint8Array(hashB));
  } catch {
    return false;
  }
}

export function makeSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

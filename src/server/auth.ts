/** Accounts and sessions: Google is the only way in, sessions live in D1. */
import { getEnv } from "./env";

export const SESSION_COOKIE = "mh_session";
export const OAUTH_COOKIE = "mh_oauth";
const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  /** Public username; null until the account is set up on /account. */
  handle: string | null;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  handle: string | null;
}

const toSessionUser = (r: UserRow): SessionUser => ({
  id: r.id,
  email: r.email,
  name: r.name,
  avatarUrl: r.avatar_url,
  handle: r.handle,
});

/* ---------- cookies ---------- */
export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) {
      return decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  return undefined;
}

export function serializeCookie(
  request: Request,
  name: string,
  value: string,
  opts: { maxAge: number; path?: string },
): string {
  const secure = new URL(request.url).protocol === "https:";
  return [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${opts.path ?? "/"}`,
    `Max-Age=${opts.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/* ---------- crypto helpers ---------- */
export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256(input: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)));
}

/** Only allow same-site paths as post-login destinations (no `//evil.com`). */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

/* ---------- users ---------- */
export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

/** Find the account for this Google identity, creating it on first sign-in. */
export async function upsertGoogleUser(p: GoogleProfile): Promise<SessionUser> {
  const { DB } = await getEnv();
  const email = p.email.toLowerCase();
  const existing = await DB.prepare(
    "SELECT id, email, name, avatar_url, handle FROM users WHERE google_sub = ?",
  )
    .bind(p.sub)
    .first<UserRow>();
  if (existing) {
    await DB.prepare("UPDATE users SET email = ?, name = ?, avatar_url = ? WHERE id = ?")
      .bind(email, p.name ?? null, p.picture ?? null, existing.id)
      .run();
    return toSessionUser({
      ...existing,
      email,
      name: p.name ?? null,
      avatar_url: p.picture ?? null,
    });
  }
  const id = crypto.randomUUID();
  await DB.prepare(
    "INSERT INTO users (id, google_sub, email, name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(id, p.sub, email, p.name ?? null, p.picture ?? null, Date.now())
    .run();
  return { id, email, name: p.name ?? null, avatarUrl: p.picture ?? null, handle: null };
}

/* ---------- sessions ---------- */
/** Creates a session and returns the Set-Cookie header value for it. */
export async function createSession(request: Request, userId: string): Promise<string> {
  const { DB } = await getEnv();
  const token = randomToken();
  const now = Date.now();
  await DB.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(base64url(await sha256(token)), userId, now + SESSION_DAYS * DAY_MS, now)
    .run();
  return serializeCookie(request, SESSION_COOKIE, token, { maxAge: SESSION_DAYS * 24 * 60 * 60 });
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const { DB } = await getEnv();
  const row = await DB.prepare(
    `SELECT u.id, u.email, u.name, u.avatar_url, u.handle
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > ?`,
  )
    .bind(base64url(await sha256(token)), Date.now())
    .first<UserRow>();
  return row ? toSessionUser(row) : null;
}

/** Deletes the session and returns the Set-Cookie header value that clears it. */
export async function destroySession(request: Request): Promise<string> {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) {
    const { DB } = await getEnv();
    await DB.prepare("DELETE FROM sessions WHERE id = ?")
      .bind(base64url(await sha256(token)))
      .run();
  }
  return serializeCookie(request, SESSION_COOKIE, "", { maxAge: 0 });
}

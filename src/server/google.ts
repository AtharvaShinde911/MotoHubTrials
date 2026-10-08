/** Google OAuth 2.0 authorization-code flow with PKCE (no SDK needed). */
import { base64url, randomToken, sha256 } from "./auth";
import type { Env } from "./env";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const CALLBACK_PATH = "/api/auth/callback/google";

export function redirectUri(env: Env, request: Request): string {
  const origin = env.APP_URL?.replace(/\/+$/, "") || new URL(request.url).origin;
  return origin + CALLBACK_PATH;
}

export async function buildAuthUrl(env: Env, request: Request) {
  const state = randomToken(16);
  const verifier = randomToken(32);
  const challenge = base64url(await sha256(verifier));
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(env, request),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), state, verifier };
}

export interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function exchangeCode(
  env: Env,
  request: Request,
  code: string,
  verifier: string,
): Promise<GoogleUserInfo> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(env, request),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token exchange failed (${tokenRes.status})`);
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) throw new Error("Google token response had no access_token");

  const infoRes = await fetch(USERINFO_URL, {
    headers: { authorization: `Bearer ${access_token}` },
  });
  if (!infoRes.ok) throw new Error(`Google userinfo failed (${infoRes.status})`);
  return (await infoRes.json()) as GoogleUserInfo;
}

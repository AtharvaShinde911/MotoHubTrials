import { createFileRoute } from "@tanstack/react-router";

import {
  OAUTH_COOKIE,
  createSession,
  readCookie,
  safeNext,
  serializeCookie,
  upsertGoogleUser,
} from "@/server/auth";
import { getEnv } from "@/server/env";
import { exchangeCode } from "@/server/google";

/** Google sends the user back here. Creates the account on first visit and signs them in. */
export const Route = createFileRoute("/api/auth/callback/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const clearOauth = serializeCookie(request, OAUTH_COOKIE, "", {
          maxAge: 0,
          path: "/api/auth",
        });
        const fail = (reason: string) => {
          const headers = new Headers({ location: `/signin?error=${reason}` });
          headers.append("set-cookie", clearOauth);
          return new Response(null, { status: 302, headers });
        };

        let saved: { state?: string; verifier?: string; next?: string } = {};
        try {
          saved = JSON.parse(readCookie(request, OAUTH_COOKIE) ?? "{}");
        } catch {
          /* fall through to the state check */
        }
        const code = url.searchParams.get("code");
        if (url.searchParams.get("error")) return fail("cancelled");
        if (
          !code ||
          !saved.state ||
          !saved.verifier ||
          url.searchParams.get("state") !== saved.state
        ) {
          return fail("expired");
        }

        const env = await getEnv();
        let info;
        try {
          info = await exchangeCode(env, request, code, saved.verifier);
        } catch (e) {
          console.error(e);
          return fail("google");
        }
        if (!info.email || info.email_verified !== true) return fail("unverified");

        const user = await upsertGoogleUser({
          sub: info.sub,
          email: info.email,
          name: info.name,
          picture: info.picture,
        });
        const next = safeNext(saved.next);
        // New accounts pick a username before anything else.
        const location = user.handle ? next : `/account?next=${encodeURIComponent(next)}`;
        const headers = new Headers({ location });
        headers.append("set-cookie", await createSession(request, user.id));
        headers.append("set-cookie", clearOauth);
        return new Response(null, { status: 302, headers });
      },
    },
  },
});

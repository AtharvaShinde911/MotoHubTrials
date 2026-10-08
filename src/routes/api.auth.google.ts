import { createFileRoute } from "@tanstack/react-router";

import { OAUTH_COOKIE, safeNext, serializeCookie } from "@/server/auth";
import { getEnv } from "@/server/env";
import { buildAuthUrl } from "@/server/google";

/** Starts "Continue with Google": remembers state + PKCE verifier, then sends the user to Google. */
export const Route = createFileRoute("/api/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const env = await getEnv();
        const next = safeNext(new URL(request.url).searchParams.get("next"));
        if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
          return Response.redirect(new URL("/signin?error=not_configured", request.url), 302);
        }
        const { url, state, verifier } = await buildAuthUrl(env, request);
        const cookie = serializeCookie(
          request,
          OAUTH_COOKIE,
          JSON.stringify({ state, verifier, next }),
          {
            maxAge: 10 * 60,
            path: "/api/auth",
          },
        );
        return new Response(null, {
          status: 302,
          headers: { location: url, "set-cookie": cookie },
        });
      },
    },
  },
});
